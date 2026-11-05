"""
clasificar_documentos_rag.py

Clasifica por TIPO, página por página, los PDF escaneados de documentos-cristian/ para
decidir cuáles sirven para el RAG y cuáles se descartan. Corre en TU máquina, no en la nube.

Garantías de privacidad (por diseño, no por buena voluntad):
  - El texto del OCR vive solo en memoria y se descarta tras clasificar cada página:
    nunca se escribe a disco, a un log ni a la salida.
  - La salida solo tiene la ruta relativa del archivo, conteos y banderas 0/1
    (incluida "parece traer una cédula", sin guardar el número).
  - La carpeta de salida no puede estar dentro del repo, para no subirla por error.
  - No borra ni mueve nada: solo escribe listas de rutas para que decidas tú.

Requisitos (solo para esta herramienta, no van a requirements.txt):
  pip install pymupdf pytesseract
  y el programa Tesseract CON el idioma español (spa). El script lo verifica al arrancar.
  Windows: el instalador silencioso de winget suele traer solo inglés. Si falta "spa",
  descarga https://github.com/tesseract-ocr/tessdata_fast/raw/main/spa.traineddata y ponlo
  en una carpeta tuya, por ejemplo C:\\tessdata, y usa --tessdata C:\\tessdata

Uso, muestra de ~150 PDF (la primera página de cada uno, ~10-20 minutos):
  python backend/scripts/clasificar_documentos_rag.py documentos-cristian

Estudio completo (todos los PDF, todas las páginas; son horas, se puede interrumpir con
Ctrl+C y continuar después con el mismo comando gracias a --reanudar):
  python backend/scripts/clasificar_documentos_rag.py documentos-cristian --todo --paginas 0 --reanudar
"""

from __future__ import annotations

import argparse
import csv
import json
import os
import random
import re
import shutil
import sys
import time
import unicodedata
from collections import Counter
from collections.abc import Callable
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]

# Frases ya sin tildes y en minúscula. Cada coincidencia suma 1 al tipo de esa página.
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

# Si aparece alguna de estas en una página, el tipo de esa página se fija sin importar el puntaje.
FRASES_DECISIVAS = {
    "comprobante_recibo": "comprobante de recibo",
    "consentimiento": "consentimiento informado",
}

# Solo estos tipos traen contenido clínico que podría servir al RAG (tras anonimizar).
TIPOS_CLINICOS = {"resultado_laboratorio", "informe_imagenologia", "historia_clinica_nota"}

# Se descartan: administrativos, o fórmulas (el producto no recomienda medicación).
TIPOS_DESCARTE = {"comprobante_recibo", "autorizacion_administrativa", "consentimiento", "formula_medica"}

TIPOS_REVISAR = {"sin_clasificar", "sin_texto", "error"}

_CEDULA = re.compile(r"\b(?:c\.?\s?c\.?|cedula[^0-9]{0,40}|identificad[oa][^0-9]{0,40})\s*[:n°.]*\s*\d{1,3}(?:[.\s]?\d{3}){2}\b")
_MIN_CHARS_CON_TEXTO = 25

CAMPOS_CSV = [
    "ruta", "paginas_totales", "paginas_ocr", "chars_ocr", "tipo", "paginas_clinicas",
    "paginas_por_tipo", "posible_cedula", "error_tipo",
]


def normalizar(texto: str) -> str:
    sin_tildes = "".join(
        c for c in unicodedata.normalize("NFD", texto.lower()) if unicodedata.category(c) != "Mn"
    )
    return re.sub(r"\s+", " ", sin_tildes)


def clasificar_texto(texto: str) -> dict:
    """Clasifica UNA página. Devuelve solo etiquetas y banderas; nunca texto."""
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


def tipo_del_documento(por_pagina: Counter) -> str:
    """Una sola página clínica basta para conservar el documento: un comprobante en la
    primera página no debe esconder el contenido clínico que venga después."""
    if any(por_pagina[t] for t in TIPOS_CLINICOS):
        return "con_contenido_clinico"
    con_contenido = Counter({t: n for t, n in por_pagina.items() if t not in ("sin_texto", "sin_clasificar")})
    if con_contenido:
        return con_contenido.most_common(1)[0][0]
    return "sin_clasificar" if por_pagina["sin_clasificar"] else "sin_texto"


def _ocr_pytesseract(png: bytes, idioma: str, tesseract_cmd: str | None) -> str:
    import io

    import pytesseract
    from PIL import Image

    if tesseract_cmd:
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
    return pytesseract.image_to_string(Image.open(io.BytesIO(png)), lang=idioma)


def verificar_ocr(idioma: str, tesseract_cmd: str | None, listar_idiomas: Callable[[], list[str]] | None = None) -> str | None:
    """None si el OCR está listo; si no, el mensaje de qué falta."""
    try:
        if listar_idiomas is None:
            import pytesseract

            if tesseract_cmd:
                pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
            listar_idiomas = pytesseract.get_languages
        idiomas = listar_idiomas()
    except ImportError as exc:
        return (f"Falta un módulo de Python ({exc.name}) en ESTE entorno. Instálalo con el mismo python que "
                "usas para correr el script: python -m pip install pymupdf pytesseract")
    except Exception as exc:
        return (f"No pude ejecutar Tesseract ({type(exc).__name__}). Cierra y abre la terminal tras instalarlo, "
                "o indica --tesseract-cmd con la ruta de tesseract.exe.")
    if idioma not in idiomas:
        return (f"Tesseract no tiene el idioma '{idioma}' (tiene: {', '.join(sorted(idiomas))}). "
                "Descarga spa.traineddata y usa --tessdata CARPETA (ver el encabezado del script).")
    return None


def procesar_pdf(
    ruta: Path,
    base: Path,
    paginas: int,
    dpi: int,
    idioma: str,
    tesseract_cmd: str | None,
    ocr: Callable[[bytes, str, str | None], str] = _ocr_pytesseract,
) -> dict:
    """paginas=0 significa todas. El texto de cada página se descarta al clasificarla."""
    fila = {"ruta": ruta.relative_to(base).as_posix(), "paginas_totales": 0, "paginas_ocr": 0, "chars_ocr": 0,
            "tipo": "error", "paginas_clinicas": 0, "paginas_por_tipo": "{}", "posible_cedula": 0}
    try:
        import fitz  # PyMuPDF

        por_pagina: Counter = Counter()
        with fitz.open(ruta) as doc:
            fila["paginas_totales"] = doc.page_count
            limite = doc.page_count if paginas <= 0 else min(paginas, doc.page_count)
            for i in range(limite):
                texto = ocr(doc[i].get_pixmap(dpi=dpi).tobytes("png"), idioma, tesseract_cmd)
                fila["chars_ocr"] += len(texto.strip())
                r = clasificar_texto(texto)
                por_pagina[r["tipo"]] += 1
                fila["posible_cedula"] |= r["posible_cedula"]
                fila["paginas_ocr"] += 1
        fila["paginas_clinicas"] = sum(por_pagina[t] for t in TIPOS_CLINICOS)
        fila["paginas_por_tipo"] = json.dumps(dict(por_pagina), sort_keys=True)
        fila["tipo"] = tipo_del_documento(por_pagina)
    except Exception as exc:  # un PDF dañado no debe tumbar la corrida; se guarda solo el tipo de error
        fila["tipo"] = "error"
        fila["error_tipo"] = type(exc).__name__
    return fila


def _procesar(args: tuple) -> dict:
    return procesar_pdf(*args)


def clasificar_destino(tipo: str) -> str:
    if tipo == "con_contenido_clinico" or tipo in TIPOS_CLINICOS:
        return "conservar_candidatos"
    if tipo in TIPOS_DESCARTE:
        return "descartar"
    return "revisar_a_mano"


def resumir(filas: list[dict]) -> dict:
    por_tipo = Counter(f["tipo"] for f in filas)
    destinos = Counter(clasificar_destino(f["tipo"]) for f in filas)
    paginas: Counter = Counter()
    for f in filas:
        paginas.update(json.loads(f.get("paginas_por_tipo") or "{}"))
    return {
        "documentos_analizados": len(filas),
        "paginas_analizadas": sum(int(f.get("paginas_ocr") or 0) for f in filas),
        "documentos_por_tipo": dict(por_tipo.most_common()),
        "paginas_por_tipo": dict(paginas.most_common()),
        "conservar_candidatos": destinos["conservar_candidatos"],
        "descartar": destinos["descartar"],
        "revisar_a_mano": destinos["revisar_a_mano"],
        "documentos_con_posible_cedula": sum(int(f.get("posible_cedula") or 0) for f in filas),
    }


def _leer_csv(ruta: Path) -> list[dict]:
    if not ruta.exists():
        return []
    with open(ruta, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def _escribir_listas(salida: Path, filas: list[dict]) -> dict:
    listas = {"conservar_candidatos": [], "descartar": [], "revisar_a_mano": []}
    for f in filas:
        listas[clasificar_destino(f["tipo"])].append(f["ruta"])
    for nombre, rutas in listas.items():
        (salida / f"{nombre}.txt").write_text("\n".join(sorted(rutas)) + ("\n" if rutas else ""), encoding="utf-8")
    resumen = resumir(filas)
    (salida / "resumen.json").write_text(json.dumps(resumen, ensure_ascii=False, indent=2), encoding="utf-8")
    return resumen


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(description="Clasifica por tipo, página por página, los PDF escaneados (solo conteos, sin guardar texto).")
    p.add_argument("carpeta", type=Path)
    p.add_argument("--muestra", type=int, default=150, help="PDF al azar a analizar (por defecto 150)")
    p.add_argument("--todo", action="store_true", help="analiza todos los PDF")
    p.add_argument("--paginas", type=int, default=1, help="páginas por PDF a leer con OCR; 0 = todas (por defecto 1)")
    p.add_argument("--reanudar", action="store_true", help="continúa una corrida interrumpida sin repetir lo ya hecho")
    p.add_argument("--dpi", type=int, default=150)
    p.add_argument("--idioma", default="spa")
    p.add_argument("--workers", type=int, default=max(1, (os.cpu_count() or 2) // 2))
    p.add_argument("--semilla", type=int, default=7)
    p.add_argument("--tesseract-cmd", default=None)
    p.add_argument("--tessdata", default=None, help="carpeta con spa.traineddata si no está en la instalación")
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

    # Un solo hilo por proceso de Tesseract: con varios procesos en paralelo, más hilos solo se estorban.
    os.environ["OMP_THREAD_LIMIT"] = "1"
    if a.tessdata:
        os.environ["TESSDATA_PREFIX"] = a.tessdata
    cmd = a.tesseract_cmd or shutil.which("tesseract")
    if not cmd and sys.platform == "win32":
        por_defecto = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
        cmd = str(por_defecto) if por_defecto.exists() else None
    try:
        import fitz  # noqa: F401  (PyMuPDF: se comprueba aquí para avisar antes de empezar)
    except ImportError:
        print("Falta PyMuPDF en ESTE entorno. Instálalo con: python -m pip install pymupdf pytesseract", file=sys.stderr)
        return 2
    problema = verificar_ocr(a.idioma, cmd)
    if problema:
        print(problema, file=sys.stderr)
        return 2

    salida.mkdir(parents=True, exist_ok=True)
    csv_ruta = salida / "clasificacion.csv"
    previas = _leer_csv(csv_ruta) if a.reanudar else []
    hechas = {f["ruta"] for f in previas}
    pendientes = [f for f in pdfs if f.relative_to(base).as_posix() not in hechas]
    print(f"{len(pdfs)} PDF en total; ya hechos: {len(hechas)}; pendientes: {len(pendientes)}. "
          f"Páginas por PDF: {'todas' if a.paginas <= 0 else a.paginas}. Workers: {a.workers}.")

    nuevo = not (a.reanudar and csv_ruta.exists())
    inicio = time.time()
    with open(csv_ruta, "w" if nuevo else "a", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=CAMPOS_CSV, extrasaction="ignore")
        if nuevo:
            w.writeheader()
        trabajos = [(x, base, a.paginas, a.dpi, a.idioma, cmd) for x in pendientes]
        # Sin "with": su salida espera a TODAS las tareas encoladas, y Ctrl+C tardaría horas.
        pool = ProcessPoolExecutor(max_workers=max(a.workers, 1))
        try:
            for i, fila in enumerate(pool.map(_procesar, trabajos), 1):
                w.writerow(fila)
                f.flush()
                if i % 10 == 0 or i == len(trabajos):
                    ritmo = (time.time() - inicio) / i
                    print(f"  {i}/{len(trabajos)}  ~{ritmo * (len(trabajos) - i) / 60:.0f} min restantes")
            pool.shutdown()
        except KeyboardInterrupt:
            pool.shutdown(wait=False, cancel_futures=True)
            print("\nInterrumpido. Lo hecho quedó guardado; continúa con el mismo comando y --reanudar.")

    resumen = _escribir_listas(salida, _leer_csv(csv_ruta))
    print("\n=== RESUMEN ===")
    print(json.dumps(resumen, ensure_ascii=False, indent=2))
    print(f"\nArchivos en: {salida}\nNo se borró ni movió nada. Comparte solo resumen.json.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
