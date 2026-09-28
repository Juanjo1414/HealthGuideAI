---
type: community
members: 57
---

# Deteccion de Red Flags y Reglas de Validacion

**Members:** 57 nodes

## Members
- [[dot-__init__()_4]] - code - evals/validate_triage_output.py
- [[dot-evaluate()]] - code - evals/triage_rules.py
- [[dot-evaluate()_1]] - code - evals/triage_rules.py
- [[dot-evaluate()_2]] - code - evals/triage_rules.py
- [[dot-evaluate()_3]] - code - evals/triage_rules.py
- [[dot-evaluate()_4]] - code - evals/triage_rules.py
- [[dot-evaluate()_5]] - code - evals/triage_rules.py
- [[dot-evaluate()_6]] - code - evals/triage_rules.py
- [[ABC]] - code
- [[Campos requeridos, tipos correctos, prioridad en el set permitido, confianza en…]] - rationale - evals/triage_rules.py
- [[Capa determinista de red flags (Sesion 6) — corre ANTES de llamar al modelo,…]] - rationale - backend/app/orchestration/red_flags.py
- [[Concatena todos los campos de texto del output para buscar patrones (sin…]] - rationale - evals/triage_parsing.py
- [[Corre un conjunto de reglas de seguridad sobre un output y agrega el veredicto.…]] - rationale - evals/validate_triage_output.py
- [[El input real puede venir sin tildes — el chequeo tiene que matchear igual.]] - rationale - backend/tests/test_red_flags.py
- [[Hallazgo real de la Sesion 6 'red_flag_fiebre_bebe' clasificaba ALTA en vez de…]] - rationale - backend/tests/test_red_flags.py
- [[IncompleteInputRule]] - code - evals/triage_rules.py
- [[Interfaz minima que debe cumplir cualquier regla de seguridad. Interface…]] - rationale - evals/triage_rules.py
- [[Las 6 reglas de seguridad que corre HealthGuide AI hoy, en el orden en que se…]] - rationale - evals/triage_rules.py
- [[No dos formas de detectar red flags que se puedan desincronizar — entrada (este…]] - rationale - backend/tests/test_red_flags.py
- [[No todo lo que menciona fiebre es un red flag — sin la combinacion con edad de…]] - rationale - backend/tests/test_red_flags.py
- [[NoDiagnosisRule]] - code - evals/triage_rules.py
- [[NoMedicationRule]] - code - evals/triage_rules.py
- [[Normaliza tildesdiacríticos para que 'térmico' y 'termico' matcheen igual.]] - rationale - evals/triage_parsing.py
- [[OutOfScopeInputRule]] - code - evals/triage_rules.py
- [[Rechaza afirmaciones diagnosticas cerradas ('tienes X', 'padece de X', etc.).]] - rationale - evals/triage_rules.py
- [[Rechaza nombres de medicamentos, categorias genericas y frases de…]] - rationale - evals/triage_rules.py
- [[RedFlagEscalationRule]] - code - evals/triage_rules.py
- [[Resultado de una sola regla — no dice nada del veredicto global, eso lo agrega…]] - rationale - evals/triage_rules.py
- [[RuleResult]] - code - evals/triage_rules.py
- [[SchemaRule]] - code - evals/triage_rules.py
- [[Señales de alarma detectadas en el texto del usuario (lista vacía si ninguna).]] - rationale - backend/app/orchestration/red_flags.py
- [[Si el input describe sintomas de un tercero (no del propio usuario), exige…]] - rationale - evals/triage_rules.py
- [[Si el input es corto, exige pedir mas informacion o marcar requiere_revision —…]] - rationale - evals/triage_rules.py
- [[Si el input trae una señal de alarma conocida, exige prioridad ALTAEMERGENCIA…]] - rationale - evals/triage_rules.py
- [[TriageValidator]] - code - evals/validate_triage_output.py
- [[Union de las señales de alarma por keyword simple mas el patron combinatorio de…]] - rationale - evals/triage_rules.py
- [[ValidationRule]] - code - evals/triage_rules.py
- [[default_rules()]] - code - evals/triage_rules.py
- [[detect_red_flags()]] - code - backend/app/orchestration/red_flags.py
- [[detect_red_flags()_1]] - code - evals/triage_rules.py
- [[re]] - concept
- [[red_flags.py]] - code - backend/app/orchestration/red_flags.py
- [[strip_accents()]] - code - evals/triage_parsing.py
- [[test_detects_known_red_flag()]] - code - backend/tests/test_red_flags.py
- [[test_detects_multiple_red_flags()]] - code - backend/tests/test_red_flags.py
- [[test_detects_pediatric_fever_combinatorial_red_flag()]] - code - backend/tests/test_red_flags.py
- [[test_detects_red_flag_without_accents_in_input()]] - code - backend/tests/test_red_flags.py
- [[test_no_red_flag_in_ordinary_symptoms()]] - code - backend/tests/test_red_flags.py
- [[test_pediatric_fever_pattern_does_not_fire_on_ordinary_fever()]] - code - backend/tests/test_red_flags.py
- [[test_red_flags.py]] - code - backend/tests/test_red_flags.py
- [[test_uses_same_detection_as_output_validator()]] - code - backend/tests/test_red_flags.py
- [[text_blob()]] - code - evals/triage_parsing.py
- [[triage_parsing.py]] - code - evals/triage_parsing.py
- [[triage_parsing.py Parte parsing del validador de seguridad (ver…]] - rationale - evals/triage_parsing.py
- [[triage_rules.py]] - code - evals/triage_rules.py
- [[triage_rules.py Parte reglas del validador de seguridad (ver…]] - rationale - evals/triage_rules.py
- [[unicodedata]] - concept

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Deteccion_de_Red_Flags_y_Reglas_de_Validacion
SORT file.name ASC
```

## Connections to other communities
- 7 edges to [[_COMMUNITY_Validador de Salida y Diagrama de Arquitectura 2]]
- 4 edges to [[_COMMUNITY_Orquestacion de Triage y Model Provider]]
- 1 edge to [[_COMMUNITY_Autenticacion y Sesiones]]

## Top bridge nodes
- [[triage_rules.py]] - degree 20, connects to 2 communities
- [[ValidationRule]] - degree 14, connects to 1 community
- [[detect_red_flags()]] - degree 13, connects to 1 community
- [[default_rules()]] - degree 11, connects to 1 community
- [[TriageValidator]] - degree 6, connects to 1 community