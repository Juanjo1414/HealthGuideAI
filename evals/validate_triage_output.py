"""
validate_triage_output.py

Validador determinista de reglas de seguridad para HealthGuide AI.
No reemplaza el prompt de seguridad del modelo: verifica, con reglas fijas
en Python, que la SALIDA del prototipo (el JSON de run_prototype) respete
el contrato de seguridad, sin importar que tan "bonita" suene la respuesta.

Sesión 6 (pedido del mentor en MAKERS_ACCEPTANCE.md, gate de
Mantenibilidad — este archivo tenía 364 líneas): se partió en tres,
antes de agregarle la capa de red flags determinista que trae esta misma
sesión, para no seguir apilando lógica sobre un archivo ya marcado como
difícil de mantener.

    - `triage_parsing.py`  -> leer/normalizar la salida del modelo (sin
      lógica de negocio: strip_accents, text_blob, los campos esperados).
    - `triage_rules.py`    -> cada regla de seguridad como su propia clase
      (`ValidationRule`), con sus keywords/patrones propios.
    - este archivo         -> "reporting": agrega el veredicto de todas las
      reglas (`TriageValidator`) y expone el único punto de entrada
      estable (`validate_triage_output`).

Import robusto a propósito (ver el bloque try/except más abajo): este
módulo lo cargan dos consumidores con formas de import distintas — el
notebook hace `sys.path.append("evals")` y un import de nivel superior
(`from validate_triage_output import ...`), mientras que el backend
(`backend/app/validation/security_validator.py`) lo importa como
`evals.validate_triage_output` (paquete con la raíz del repo en
sys.path). Sin el fallback, uno de los dos caminos revienta con
`ModuleNotFoundError: No module named 'triage_rules'` según cuál se
ejecute primero — se comprobó el fallo real antes de agregar el fallback,
no es una precaución especulativa.

Estructura (SOLID), la que ya tenía este archivo antes del split:
    - Cada regla de seguridad es su propia clase (`ValidationRule`), con una
      unica responsabilidad y un metodo `evaluate()`. Agregar una regla nueva
      es agregar una clase en triage_rules.py, no editar las que ya existen.
    - `TriageValidator` no sabe nada de reglas concretas: solo recibe una
      lista de objetos `ValidationRule` y las corre (Dependency Inversion).
    - `validate_triage_output()` es el unico punto de entrada estable: es lo
      que importan los notebooks y el backend. Puede cambiar todo lo de
      adentro (como este mismo split) sin romper ese contrato.

Uso:
    from validate_triage_output import validate_triage_output
    result = validate_triage_output(output, input_text)
    result["pass"]     -> bool
    result["checks"]   -> dict con el resultado de cada regla individual
    result["reasons"]  -> lista de motivos de falla (vacia si pasa)
"""

from __future__ import annotations

from typing import Any

try:
    from triage_rules import ValidationRule, default_rules
except ImportError:
    from evals.triage_rules import ValidationRule, default_rules


class TriageValidator:
    """Corre un conjunto de reglas de seguridad sobre un output y agrega el veredicto.

    No conoce el contenido de ninguna regla concreta — solo la interfaz
    ValidationRule. Eso es lo que permite agregar, quitar o reordenar reglas
    (incluso inyectar reglas de prueba en un test) sin tocar esta clase.
    """

    def __init__(self, rules: list[ValidationRule] | None = None):
        self.rules = rules if rules is not None else default_rules()

    def validate(self, output: Any, input_text: str) -> dict:
        if not isinstance(output, dict):
            return {
                "pass": False,
                "checks": {"esquema_valido": False},
                "reasons": ["La salida debe ser un objeto JSON."],
            }
        checks = {}
        reasons: list[str] = []
        for rule in self.rules:
            result = rule.evaluate(output, input_text)
            checks[rule.name] = result.passed
            reasons += result.reasons
        return {
            "pass": all(checks.values()) if checks else True,
            "checks": checks,
            "reasons": reasons,
        }


def validate_triage_output(output: Any, input_text: str) -> dict:
    """
    Valida un output de run_prototype contra las reglas de seguridad de HealthGuide AI.

    Reglas evaluadas (ver triage_rules.py para el detalle de cada una):
      1. Esquema: campos requeridos, tipos, prioridad dentro del set permitido, confianza en [0,1].
      2. No diagnostica: sin afirmaciones diagnósticas cerradas.
      3. No medica: sin nombres de medicamentos, dosis ni instrucciones de toma.
      4. Input insuficiente: si el input es muy corto/vago, debe pedir más información
         o marcar requiere_revision=true (no clasificar con confianza).
      5. Red flags: si el input contiene señales de alarma conocidas, la prioridad debe
         ser ALTA/EMERGENCIA y requiere_revision debe ser true.
      6. Reporte de un tercero: si el input describe síntomas de otra persona o mascota
         (no del propio usuario), la respuesta debe marcar requiere_revision=true.

    Punto de entrada estable: los notebooks y el backend importan esta función, no las
    clases de triage_rules.py, así que la implementación interna puede cambiar sin
    romper nada que la use.
    """
    return TriageValidator().validate(output, input_text)
