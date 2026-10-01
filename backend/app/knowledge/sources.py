"""
Corpus curado para RAG (Sesion 7). Cada entrada es una fuente de salud
publica real y citable (URL + cita original verbatim conservada para
auditoria) — nunca contenido generado por el modelo ni inventado de
memoria. Categorias alineadas con RED_FLAG_KEYWORDS (evals/triage_rules.py)
para que la recuperacion refuerce exactamente las señales que el sistema ya
escala de forma determinista.

Estado de revision clinica: normalmente Cristian valida el contenido
clinico que entra aca (TEAM_ROTATION.md), pero no esta activo en el
proyecto en este momento. El equipo decidio explicitamente construir esto
igual (ver docs/PLAN_IMPLEMENTACION.md, Sesion 7) dejandolo marcado como
PENDIENTE de su revision clinica eventual — mismo tratamiento que ya
tienen los ejemplos few-shot de la Sesion 6 (orchestration/contract.py,
FEW_SHOT_EXAMPLES).

Advertencia metodologica honesta (no ocultarla, CONSTRAINTS.md pide ser
explicito sobre debilidades conocidas): las citas en `source_quote_en` se
obtuvieron via una herramienta de fetch que procesa el HTML con un modelo
intermedio antes de devolver texto, no un volcado crudo verificado
byte-a-byte contra la pagina real (el acceso directo con curl fue
bloqueado por el firewall del entorno de desarrollo). El contenido es
internamente consistente y las URLs son reales y publicas, pero antes de
tratar estas citas como verbatim "congeladas" para evals o auditoria
formal, alguien del equipo deberia abrir las 4 URLs a mano y confirmar la
redaccion exacta.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class KnowledgeChunk:
    id: str
    category: str  # coincide con las categorias de red flag de evals/triage_rules.py
    source_name: str
    source_url: str
    text_es: str  # version en español, la que se inyecta en el prompt
    source_quote_en: str  # cita original verbatim, para auditar la traduccion


KNOWLEDGE_BASE: list[KnowledgeChunk] = [
    KnowledgeChunk(
        id="cdc_infarto",
        category="dolor_pecho",
        source_name="CDC — About Heart Attack",
        source_url="https://www.cdc.gov/heart-disease/about/heart-attack.html",
        text_es=(
            "La mayoria de los infartos involucran una molestia en el centro o el lado "
            "izquierdo del pecho que dura mas de unos minutos, o que desaparece y vuelve "
            "a aparecer. Suele acompañarse de dificultad para respirar, y de sentirse "
            "debil, mareado o a punto de desmayarse, a veces con sudor frio. Ante estos "
            "sintomas la recomendacion es llamar de inmediato a la linea de emergencias."
        ),
        source_quote_en=(
            "Chest pain or discomfort. Most heart attacks involve discomfort in the "
            "center or left side of the chest that lasts for more than a few minutes or "
            "that goes away and comes back. Shortness of breath. ... Feeling weak, "
            "light-headed, or faint. You may also break into a cold sweat. "
            "Call 9-1-1 if you notice symptoms of a heart attack."
        ),
    ),
    KnowledgeChunk(
        id="cdc_acv",
        category="acv",
        source_name="CDC — Stroke Signs and Symptoms",
        source_url="https://www.cdc.gov/stroke/signs-symptoms/index.html",
        text_es=(
            "Un posible derrame cerebral (ACV) se reconoce por entumecimiento o debilidad "
            "repentina en la cara, el brazo o la pierna, especialmente en un solo lado del "
            "cuerpo; confusion repentina o dificultad para hablar o entender lo que se "
            "dice; problemas repentinos de vision; o dificultad repentina para caminar, "
            "mareo o perdida de equilibrio. Una forma simple de evaluarlo: pedirle a la "
            "persona que sonria (¿un lado de la cara se cae?), que levante ambos brazos "
            "(¿uno se cae hacia abajo?) y que repita una frase simple (¿el habla suena "
            "arrastrada?). Si aparece cualquiera de estas señales, hay que llamar de "
            "inmediato a la linea de emergencias."
        ),
        source_quote_en=(
            "Sudden numbness or weakness in the face, arm, or leg, especially on one "
            "side of the body. Sudden confusion, trouble speaking, or difficulty "
            "understanding speech. Sudden trouble seeing. Sudden trouble walking, "
            "dizziness, loss of balance, or lack of coordination. ... Ask the person to "
            "smile. Does one side of the face droop? ... Ask the person to raise both "
            "arms. Does one arm drift downward? ... Ask the person to repeat a simple "
            "phrase. Is the speech slurred or strange? ... If you see any of these "
            "signs, call 9-1-1 right away."
        ),
    ),
    KnowledgeChunk(
        id="medlineplus_emergencia",
        category="dificultad_respiratoria",
        source_name="MedlinePlus (NIH) — Recognizing Medical Emergencies",
        source_url="https://medlineplus.gov/ency/article/001927.htm",
        text_es=(
            "La dificultad para respirar o la falta de aire estan entre los sintomas que "
            "indican una emergencia medica en un adulto. En general, hay que llamar a la "
            "linea de emergencias cuando la condicion de la persona pone en riesgo su "
            "vida — por ejemplo, ante un infarto o una reaccion alergica grave — o podria "
            "volverse potencialmente mortal mientras se traslada a un centro medico."
        ),
        source_quote_en=(
            "Breathing problems (difficulty breathing, shortness of breath) "
            "[listed among symptoms indicating an emergency in adults]. "
            "CALL 911 OR YOUR LOCAL EMERGENCY NUMBER IF: The person's condition is life "
            "threatening (for example, the person is having a heart attack or severe "
            "allergic reaction). The person's condition could become life threatening "
            "on the way to the hospital."
        ),
    ),
    KnowledgeChunk(
        id="cleveland_clinic_anafilaxia",
        category="anafilaxia",
        source_name="Cleveland Clinic — Anaphylaxis",
        source_url="https://my.clevelandclinic.org/health/diseases/8619-anaphylaxis",
        text_es=(
            "La anafilaxia suele comenzar con sintomas en la piel, como urticaria o "
            "picazon, y puede seguir con hinchazon en la garganta, los labios y la "
            "lengua, dificultad para respirar y dificultad para tragar. Es una reaccion "
            "alergica grave: ante cualquiera de estas señales hay que llamar de "
            "inmediato a la linea de emergencias y acudir a urgencias, incluso si ya se "
            "aplico un tratamiento de rescate."
        ),
        source_quote_en=(
            "Anaphylaxis usually begins with skin symptoms of hives or itching. "
            "Swelling in your throat, lips and tongue. Shortness of breath. ... "
            "Difficulty swallowing. ... Call 911 (or your emergency services number) "
            "and go to the nearest emergency room if you, or someone around you, are "
            "experiencing anaphylaxis, even if you've already administered epinephrine."
        ),
    ),
]
