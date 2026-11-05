from pathlib import Path

import pytest

from backend.scripts.clasificar_documentos_rag import (
    REPO_ROOT,
    clasificar_texto,
    main,
    procesar_pdf,
    resumir,
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


def test_el_resumen_cuenta_por_tipo():
    filas = [
        {"tipo": "comprobante_recibo", "clinico": 0, "posible_cedula": 1},
        {"tipo": "historia_clinica_nota", "clinico": 1, "posible_cedula": 0},
        {"tipo": "sin_texto", "clinico": 0, "posible_cedula": 0},
    ]
    r = resumir(filas)
    assert (r["clinicos"], r["a_descartar"], r["a_revisar_a_mano"], r["con_posible_cedula"]) == (1, 1, 1, 1)


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
    assert fila["tipo"] == "historia_clinica_nota"
    assert "Motivo" not in str(fila)
