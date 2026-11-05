import json
from collections import Counter
from pathlib import Path

import pytest

from backend.scripts import clasificar_documentos_rag as mod
from backend.scripts.clasificar_documentos_rag import (
    REPO_ROOT,
    clasificar_texto,
    main,
    procesar_pdf,
    resumir,
    tipo_del_documento,
    verificar_ocr,
)


def test_un_comprobante_administrativo_se_clasifica_y_no_es_clinico():
    r = clasificar_texto("COMPROBANTE DE RECIBO DEL USUARIO. Servicio: ECOGRAFIA DE ABDOMEN TOTAL. Firma del usuario")
    assert r["tipo"] == "comprobante_recibo"
    assert r["clinico"] == 0


def test_una_nota_clinica_se_clasifica_como_clinica():
    r = clasificar_texto("Motivo de consulta: dolor. Enfermedad actual: dos dias. Examen físico: normal. Plan de manejo: control.")
    assert r["tipo"] == "historia_clinica_nota"
    assert r["clinico"] == 1


def test_el_laboratorio_y_la_imagenologia_son_clinicos():
    assert clasificar_texto("Hemograma completo. Valores de referencia. Glicemia en ayunas: 90")["clinico"] == 1
    assert clasificar_texto("Tomografia de craneo. Hallazgos: sin alteraciones. Impresion diagnostica: normal")["clinico"] == 1


def test_la_formula_medica_se_descarta_por_politica_del_producto():
    r = clasificar_texto("Formula medica. Posologia: una tableta cada 8 horas por cinco dias.")
    assert r["tipo"] == "formula_medica"
    assert r["clinico"] == 0


def test_poco_texto_es_sin_texto_y_texto_ajeno_es_sin_clasificar():
    assert clasificar_texto("  ab  ")["tipo"] == "sin_texto"
    assert clasificar_texto("Lista de compras: pan, leche, huevos y café para toda la semana")["tipo"] == "sin_clasificar"


def test_detecta_que_parece_haber_una_cedula_sin_devolver_el_numero():
    r = clasificar_texto("Yo, PERSONA DE PRUEBA, identificado con cedula de ciudadania numero 1.042.584.949, declaro")
    assert r["posible_cedula"] == 1
    assert "1042584949" not in str(r) and "1.042.584.949" not in str(r)
    assert clasificar_texto("Examen fisico normal, signos vitales estables y control en una semana")["posible_cedula"] == 0


def test_el_resumen_cuenta_documentos_y_paginas_por_tipo():
    filas = [
        {"ruta": "a.pdf", "tipo": "comprobante_recibo", "posible_cedula": 1, "paginas_ocr": 1,
         "paginas_por_tipo": json.dumps({"comprobante_recibo": 1})},
        {"ruta": "b.pdf", "tipo": "con_contenido_clinico", "posible_cedula": 0, "paginas_ocr": 3,
         "paginas_por_tipo": json.dumps({"comprobante_recibo": 1, "historia_clinica_nota": 2})},
        {"ruta": "c.pdf", "tipo": "sin_texto", "posible_cedula": 0, "paginas_ocr": 1,
         "paginas_por_tipo": json.dumps({"sin_texto": 1})},
    ]
    r = resumir(filas)
    assert (r["conservar_candidatos"], r["descartar"], r["revisar_a_mano"]) == (1, 1, 1)
    assert r["paginas_analizadas"] == 5 and r["documentos_con_posible_cedula"] == 1
    assert r["paginas_por_tipo"]["comprobante_recibo"] == 2


def test_una_pagina_clinica_salva_el_documento_aunque_empiece_con_un_comprobante():
    assert tipo_del_documento(Counter({"comprobante_recibo": 1, "historia_clinica_nota": 1})) == "con_contenido_clinico"
    assert tipo_del_documento(Counter({"comprobante_recibo": 2})) == "comprobante_recibo"
    assert tipo_del_documento(Counter({"sin_texto": 2})) == "sin_texto"
    assert tipo_del_documento(Counter({"sin_clasificar": 1, "sin_texto": 1})) == "sin_clasificar"


def test_verificar_ocr_avisa_si_falta_el_idioma_o_tesseract():
    assert verificar_ocr("spa", None, lambda: ["eng", "spa", "osd"]) is None
    assert "spa" in verificar_ocr("spa", None, lambda: ["eng", "osd"])

    def no_instalado():
        raise FileNotFoundError

    assert "Tesseract" in verificar_ocr("spa", None, no_instalado)

    def sin_modulo():
        raise ModuleNotFoundError("sin pytesseract", name="pytesseract")

    mensaje = verificar_ocr("spa", None, sin_modulo)
    assert "pytesseract" in mensaje and "pip install" in mensaje


def test_la_salida_no_puede_estar_dentro_del_repo(capsys):
    assert main([str(REPO_ROOT / "backend"), "--salida", str(REPO_ROOT / "salida")]) == 2
    assert "dentro del repo" in capsys.readouterr().err


def test_procesar_pdf_solo_devuelve_etiquetas_no_texto(tmp_path: Path):
    fitz = pytest.importorskip("fitz")
    pdf = tmp_path / "a" / "doc.pdf"
    pdf.parent.mkdir()
    doc = fitz.open()
    doc.new_page()
    doc.save(pdf)
    doc.close()

    fila = procesar_pdf(pdf, tmp_path, 1, 72, "spa", None, ocr=lambda *_: "Historia clinica. Motivo de consulta: control. Examen fisico normal")

    assert fila["ruta"] == "a/doc.pdf"
    assert fila["tipo"] == "con_contenido_clinico"
    assert "Motivo" not in str(fila)


def test_procesar_pdf_clasifica_pagina_por_pagina_con_paginas_cero_igual_a_todas(tmp_path: Path):
    fitz = pytest.importorskip("fitz")
    pdf = tmp_path / "doc.pdf"
    doc = fitz.open()
    for _ in range(3):
        doc.new_page()
    doc.save(pdf)
    doc.close()
    textos = iter([
        "COMPROBANTE DE RECIBO DEL USUARIO firma del usuario huella",
        "Historia clinica. Motivo de consulta: control. Examen fisico normal",
        "",
    ])

    fila = procesar_pdf(pdf, tmp_path, 0, 72, "spa", None, ocr=lambda *_: next(textos))

    assert fila["paginas_ocr"] == 3
    assert fila["tipo"] == "con_contenido_clinico" and fila["paginas_clinicas"] == 1
    assert json.loads(fila["paginas_por_tipo"]) == {"comprobante_recibo": 1, "historia_clinica_nota": 1, "sin_texto": 1}


def test_reanudar_no_repite_lo_ya_clasificado(tmp_path: Path, monkeypatch):
    pytest.importorskip("fitz")
    import fitz

    carpeta = tmp_path / "docs"
    carpeta.mkdir()
    for nombre in ("a.pdf", "b.pdf"):
        d = fitz.open()
        d.new_page()
        d.save(carpeta / nombre)
        d.close()
    salida = tmp_path / "salida"
    salida.mkdir()
    (salida / "clasificacion.csv").write_text(
        ",".join(mod.CAMPOS_CSV) + "\n" + 'a.pdf,1,1,50,historia_clinica_nota,1,"{}",0,\n', encoding="utf-8"
    )
    vistos = []

    class PoolFalso:
        def __init__(self, *a, **k): ...
        def map(self, fn, trabajos):
            for t in trabajos:
                vistos.append(t[0].name)
                yield {"ruta": t[0].name, "paginas_totales": 1, "paginas_ocr": 1, "chars_ocr": 9, "tipo": "sin_texto",
                       "paginas_clinicas": 0, "paginas_por_tipo": "{}", "posible_cedula": 0}
        def shutdown(self, *a, **k): ...

    monkeypatch.setattr(mod, "ProcessPoolExecutor", PoolFalso)
    monkeypatch.setattr(mod, "verificar_ocr", lambda *a, **k: None)
    monkeypatch.setattr(mod, "REPO_ROOT", Path("/no/es/el/repo"))

    assert main([str(carpeta), "--todo", "--reanudar", "--salida", str(salida)]) == 0
    assert vistos == ["b.pdf"]
    assert "b.pdf" in (salida / "clasificacion.csv").read_text(encoding="utf-8")
