"""
clasificar_documentos_rag.py

Clasifica por TIPO los PDF escaneados de documentos-cristian/ para decidir cuáles
sirven para el RAG y cuáles se descartan. Corre en TU máquina, no en la nube.

Garantías de privacidad (por diseño, no por buena voluntad):
  - El texto del OCR vive solo en memoria y se descarta tras clasificar cada PDF:
    nunca se escribe a disco, a un log ni a la salida.
  - La salida solo tiene la ruta relativa del archivo, conteos y banderas 0/1
    (incluida "parece traer una cédula", sin guardar el número).
  - La carpeta de salida no puede estar dentro del repo, para no subirla por error.
  - No borra ni mueve nada: solo escribe listas de rutas para que decidas tú.

Requisitos (solo para esta herramienta, no van a requirements.txt):
  pip install pymupdf pytesseract
  y el programa Tesseract con el idioma español (spa):
    Windows: winget install UB-Mannheim.TesseractOCR  (marca "Spanish" al instalar)
    Linux:   sudo apt install tesseract-ocr tesseract-ocr-spa
  En Windows, si no queda en el PATH: --tesseract-cmd "C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

Uso (empieza por una muestra, ~150 PDF, unos 10-20 minutos):
  python backend/scripts/clasificar_documentos_rag.py documentos-cristian
Todo el conjunto:
  python backend/scripts/clasificar_documentos_rag.py documentos-cristian --todo

Límite conocido: por defecto mira solo la primera página. Un PDF cuya primera página
es una carátula administrativa pero cuyo contenido clínico viene después saldría
como "descartar". Para reducir ese riesgo usa --paginas 3.
"""

from __future__ import annotations

import argparse
import csv
import json
import random
import re
import sys
import unicodedata
from collections import Counter
from collections.abc import Callable
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# Frases ya sin tildes y en minúscula. Cada coincidencia suma 1 al tipo.
TIPOS: dict[str, list[str]] = {
    "comprobante_recibo": ["comprobante de recibo", "recibo del usuario", "firma del usuario", "huella"],
    "autorizacion_administrativa": [
        "autorizacion de servicios", "numero de autorizacion", "orden de servicio",
        "copago", "cuota moderadora", "afiliacion", "radicado",
    ],
    "consentimiento": ["consentimiento informado", "he sido informado", "acepto el procedimiento"],
    "resultado_laboratorio": [
        "hemograma", "valores de referencia", "valor de referencia", "glicemia",
        "creatinina", "colesterol", "uroanalisis", "resultado del examen",
    ],
    "informe_imagenologia": [
        "informe de ecografia", "informe de radiografia", "tomografia", "resonancia",
        "hallazgos", "impresion diagnostica", "tecnica utilizada",
    ],
    "historia_clinica_nota": [
        "historia clinica", "motivo de consulta", "enfermedad actual", "examen fisico",
        "evolucion", "epicrisis", "plan de manejo", "signos vitales", "antecedentes",
    ],
    "formula_medica": ["formula medica", "prescripcion", "posologia", "cada 8 horas", "tabletas"],
}

# Si aparece alguna de estas, el tipo se fija sin importar el puntaje.
FRASES_DECISIVAS = {
    "comprobante_recibo": "comprobante de recibo",
    "consentimiento": "consentimiento informado",
}

# Solo estos tipos traen contenido clínico que podría servir al RAG (tras anonimizar).
TIPOS_CLINICOS = {"resultado_laboratorio", "informe_imagenologia", "historia_clinica_nota"}

# Se descartan: administrativos, o fórmulas (el producto no recomienda medicación).
TIPOS_DESCARTE = {"comprobante_recibo", "autorizacion_administrativa", "consentimiento", "formula_medica"}

_CEDULA = re.compile(r"\b(?:c\.?\s?c\.?|cedula[^0-9]{0,40}|identificad[oa][^0-9]{0,40})\s*[:n°.]*\s*\d{1,3}(?:[.\s]?\d{3}){2}\b")
_MIN_CHARS_CON_TEXTO = 25


def normalizar(texto: str) -> str:
    sin_tildes = "".join(
        c for c in unicodedata.normalize("NFD", texto.lower()) if unicodedata.category(c) != "Mn"
    )
    return re.sub(r"\s+", " ", sin_tildes)


def clasificar_texto(texto: str) -> dict:
    """Devuelve solo etiquetas y banderas; nunca texto."""
    t = normalizar(texto)
    if len(t.strip()) < _MIN_CHARS_CON_TEXTO:
        return {"tipo": "sin_texto", "puntaje": 0, "clinico": 0, "posible_cedula": 0}

    cedula = int(bool(_CEDULA.search(t)))
    for tipo, frase in FRASES_DECISIVAS.items():
        if frase in t:
            return {"tipo": tipo, "puntaje": 99, "clinico": 0, "posible_cedula": cedula}

    puntajes = {tipo: sum(1 for k in claves if k in t) for tipo, claves in TIPOS.items()}
    mejor = max(puntajes.values())
    if mejor == 0:
        return {"tipo": "sin_clasificar", "puntaje": 0, "clinico": 0, "posible_cedula": cedula}
    tipo = next(t_ for t_, p in puntajes.items() if p == mejor)  # empate: gana el primero de TIPOS
    return {"tipo": tipo, "puntaje": mejor, "clinico": int(tipo in TIPOS_CLINICOS), "posible_cedula": cedula}


def _ocr_pytesseract(png: bytes, idioma: str, tesseract_cmd: str | None) -> str:
    import io

    import pytesseract
    from PIL import Image

    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
    return pytesseract.image_to_string(Image.open(io.BytesIO(png)), lang=idioma)


def procesar_pdf(
    ruta: Path,
    base: Path,
    paginas: int,
    dpi: int,
    idioma: str,
    tesseract_cmd: str | None,
    ocr: Callable[[bytes, str, str | None], str] = _ocr_pytesseract,
) -> dict:
    fila = {"ruta": ruta.relative_to(base).as_posix(), "paginas_totales": 0, "paginas_ocr": 0,
            "chars_ocr": 0, "tipo": "error", "puntaje": 0, "clinico": 0, "posible_cedula": 0}
    try:
        import fitz  # PyMuPDF

        with fitz.open(ruta) as doc:
            fila["paginas_totales"] = doc.page_count
            texto = ""
            for i in range(min(paginas, doc.page_count)):
                png = doc[i].get_pixmap(dpi=dpi).tobytes("png")
                texto += "\n" + ocr(png, idioma, tesseract_cmd)
                fila["paginas_ocr"] += 1
        fila["chars_ocr"] = len(texto.strip())
        fila.update(clasificar_texto(texto))
    except Exception as exc:  # un PDF dañado no debe tumbar la corrida; se guarda solo el tipo de error
        fila["tipo"] = "error"
        fila["error_tipo"] = type(exc).__name__
    return fila


def _procesar(args: tuple) -> dict:
    return procesar_pdf(*args)


def resumir(filas: list[dict]) -> dict:
    total = len(filas)
    por_tipo = Counter(f["tipo"] for f in filas)
    return {
        "documentos_analizados": total,
        "por_tipo": dict(por_tipo.most_common()),
        "clinicos": sum(f["clinico"] for f in filas),
        "a_descartar": sum(por_tipo[t] for t in TIPOS_DESCARTE),
        "a_revisar_a_mano": sum(por_tipo[t] for t in ("sin_clasificar", "sin_texto", "error")),
        "con_posible_cedula": sum(f["posible_cedula"] for f in filas),
    }


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Clasifica por tipo los PDF escaneados (solo conteos, sin guardar texto).")
    p.add_argument("carpeta", type=Path)
    p.add_argument("--muestra", type=int, default=150, help="PDF al azar a analizar (por defecto 150)")
    p.add_argument("--todo", action="store_true", help="analiza todos los PDF")
    p.add_argument("--paginas", type=int, default=1, help="páginas por PDF a leer con OCR (por defecto 1)")
    p.add_argument("--dpi", type=int, default=150)
    p.add_argument("--idioma", default="spa")
    p.add_argument("--workers", type=int, default=2)
    p.add_argument("--semilla", type=int, default=7)
    p.add_argument("--tesseract-cmd", default=None)
    p.add_argument("--salida", type=Path, default=Path.home() / "rag_clasificacion")
    a = p.parse_args(argv)

    base = a.carpeta.resolve()
    salida = a.salida.resolve()
    if salida == REPO_ROOT or REPO_ROOT in salida.parents:
        print("La salida no puede estar dentro del repo (para no subirla por error).", file=sys.stderr)
        return 2
    pdfs = sorted(base.rglob("*.pdf"))
    if not pdfs:
        print(f"No encontré PDF en {base}", file=sys.stderr)
        return 2
    if not a.todo and a.muestra < len(pdfs):
        pdfs = sorted(random.Random(a.semilla).sample(pdfs, a.muestra))

    print(f"Analizando {len(pdfs)} PDF (páginas por PDF: {a.paginas}). Esto toma un rato...")
    trabajos = [(f, base, a.paginas, a.dpi, a.idioma, a.tesseract_cmd) for f in pdfs]
    with ProcessPoolExecutor(max_workers=max(a.workers, 1)) as pool:
        filas = []
        for i, fila in enumerate(pool.map(_procesar, trabajos), 1):
            filas.append(fila)
            if i % 25 == 0:
                print(f"  {i}/{len(pdfs)}")

    salida.mkdir(parents=True, exist_ok=True)
    campos = ["ruta", "paginas_totales", "paginas_ocr", "chars_ocr", "tipo", "puntaje", "clinico", "posible_cedula", "error_tipo"]
    with open(salida / "clasificacion.csv", "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=campos, extrasaction="ignore")
        w.writeheader()
        w.writerows(filas)

    listas = {
        "conservar_candidatos.txt": [f["ruta"] for f in filas if f["tipo"] in TIPOS_CLINICOS],
        "descartar.txt": [f["ruta"] for f in filas if f["tipo"] in TIPOS_DESCARTE],
        "revisar_a_mano.txt": [f["ruta"] for f in filas if f["tipo"] in ("sin_clasificar", "sin_texto", "error")],
    }
    for nombre, rutas in listas.items():
        (salida / nombre).write_text("\n".join(rutas) + ("\n" if rutas else ""), encoding="utf-8")

    resumen = resumir(filas)
    (salida / "resumen.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=2), encoding="utf-8")
    print("\n=== RESUMEN ===")
    print(json.dumps(resumen, ensure_ascii=False, indent=2))
    print(f"\nArchivos en: {salida}\nNo se borró ni movió nada. Comparte solo resumen.json.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
