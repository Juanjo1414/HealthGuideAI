# Reflexión — feedback de Codex en makers/review

## Qué cambió Codex

Comparamos la versión vieja de `MAKERS_REVIEW.md` (la de cuando solo existía un notebook con
Gemini) contra la que dejó Codex ahora en `makers/review`, y el cambio real es que el reto se
movió hacia adelante porque nosotros ya resolvimos lo que pedía antes:

- Antes pedía, como Core, completar `pass_fail` a mano para 5 casos, y como Intermediate,
  crear `validate_triage_output(output, input_text)` desde cero. Eso ya lo teníamos hecho
  (el validador con las 5 reglas, más `run_eval_suite` conectándolo a una ejecución real), así
  que Codex no repitió ese pedido — lo dio por resuelto y actualizó el "Qué encontramos" para
  reflejarlo ("ya agregaron evals extendidos y un script inicial de validación").
- También notó que ahora hay dos notebooks (Gemini y NVIDIA) en vez de uno solo, y ajustó
  "Cómo probarlo" para que mencione ambos y para que se comparen entre sí, no solo se corra
  uno.
- El reto nuevo quedó en tres niveles distintos a los de antes:
  1. Core: correr de verdad `pass_fail` para los casos base y extendidos (no solo diseñarlos).
  2. Intermediate: conectar `validate_triage_output.py` a una ejecución real del notebook —
     esto también ya lo teníamos vía `run_eval_suite`, así que en la práctica ya estaba
     resuelto antes de que Codex lo pidiera.
  3. Advanced: armar una tabla comparativa Gemini vs NVIDIA con score, latencia, costo
     estimado y fallas de seguridad — este sí era completamente nuevo, no existía nada
     parecido en el repo.
- El punto que más nos sirvió de esta revisión fue una frase que no estaba antes: "Falta
  unificar el contrato de salida entre proveedores para comparar modelos con la misma
  rúbrica." Al ponernos a construir la tabla comparativa del punto Advanced nos dimos cuenta
  de que tenía toda la razón: el notebook de Gemini no forzaba los nombres exactos del
  contrato de salida (`prioridad`, `resumen`, etc.) como sí lo hacía el de NVIDIA, así que
  generaba sus propias claves (`prioridad_atencion`, `resumen_sintomas`...) y el validador de
  seguridad no podía leerlo. Sin ese comentario de Codex probablemente no lo hubiéramos
  revisado a tiempo — quedaba escondido porque nadie había corrido el notebook de Gemini con
  el validador real todavía.
- `TEAM_ROTATION.md` no cambió en esta actualización — sigue siendo la misma plantilla de la
  vez pasada, con los roles todavía en `TBD`.

## Qué riesgo técnico encontró

El riesgo más serio que tenemos hoy no es que el modelo diagnostique cosas obvias como
"tienes gripe" — eso ya lo estamos bloqueando. El riesgo real es más sutil: el modelo puede
salirse del esquema sin que se note a simple vista. Nos pasó dos veces mientras probábamos:
una vez devolvió `prioridad` en minúscula y tronó todo con un error de Pydantic, y otra vez
nos mandó un `score` de 55 cuando el rango era de 0 a 10 (asumió una escala de 0 a 100 porque
el prompt no lo dejaba lo suficientemente claro). Si eso pasa en producción con un caso real
de un usuario, en vez de una respuesta útil lo que recibe es un error o, peor, una
clasificación de prioridad mal calculada sin que nadie se dé cuenta en el momento.

También hay un riesgo de fondo que no hemos resuelto todavía: nuestras reglas de seguridad
(no diagnosticar, no recomendar medicamentos, escalar síntomas críticos) las estamos
verificando con un validador que busca palabras clave. Eso funciona para los casos obvios,
pero un modelo puede decir lo mismo con otras palabras y colarse. Ya nos pasó una vez con
"usar antitérmicos si es necesario" — técnicamente no decía "ibuprofeno", pero seguía siendo
una recomendación de medicación, y el validador lo dejó pasar hasta que lo revisamos a mano.

## Qué eval falla o falta

De los 5 casos base, el que más nos ha dado problemas es el de input adversarial: cuando
alguien intenta manipular al modelo para que dé un diagnóstico o mencione medicamentos, a
veces el modelo responde bien pero con un formato que no matchea el esquema exacto, y el
validador lo marca como FAIL por razones de forma, no de fondo. Nos falta separar esas dos
cosas: un fallo de seguridad real (el modelo sí cedió y dio un diagnóstico) no debería
contarse igual que un fallo de formato (el modelo se negó bien pero el JSON no cuadra).

Lo que falta de verdad es correr el set extendido de 20 casos y dejar los resultados
documentados — hasta ahora existe el diseño de esos casos, pero no hemos corrido todos y
anotado qué pasó con cada uno. Sin eso, decir que el producto es "seguro" es una afirmación
sin evidencia.

## Qué haríamos primero si esto fuera un producto real

Antes de agregar cualquier funcionalidad nueva, arreglaríamos la forma en que verificamos que
el modelo no recomienda medicación ni diagnostica. Ahora mismo es una lista de palabras
prohibidas, y eso siempre va a tener huecos porque el lenguaje natural tiene mil formas de
decir lo mismo. Lo primero sería conseguir que alguien con criterio clínico real revise una
muestra de respuestas y nos diga qué se nos está pasando, en vez de seguir adivinando nosotros
mismos qué palabras agregar a la lista.

Después de eso, meteríamos logging de verdad: guardar cada input, cada output y el resultado
de la validación, para poder auditar después qué está pasando en producción y no depender de
que alguien lo note corriendo el notebook a mano.

## Qué parte de nuestro repo no aguantaría una revisión de un ingeniero senior

Honestamente, el validador de seguridad. Funciona, y encontró bugs reales, pero es una lista
de palabras clave con algo de normalización de tildes — no es un sistema robusto, es un
parche razonable para el tamaño del proyecto que tenemos ahora. Un ingeniero senior
preguntaría de inmediato: ¿qué pasa si el modelo dice "hay que bajar la fiebre" en vez de
nombrar un medicamento? Y tendría razón, porque hoy eso no lo detectaríamos.

Lo otro que no aguantaría revisión es que no tenemos ningún tipo de test automatizado que
corra solo (CI). Todo depende de que alguien abra el notebook y ejecute las celdas a mano.
Si alguien cambia un prompt sin querer romper algo, no nos enteraríamos hasta la próxima vez
que alguien corra los evals manualmente.