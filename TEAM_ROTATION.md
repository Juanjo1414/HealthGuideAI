# Team Rotation

Objetivo: que todos entiendan todo el sistema, no que cada persona quede encerrada en una parte.

Roadmap de trabajo por sesiones (qué sigue, en qué orden) en
[`docs/PLAN_IMPLEMENTACION.md`](docs/PLAN_IMPLEMENTACION.md).

## Semana actual

Ownership real según la evidencia ya documentada en `evals/CLINICAL_SAFETY_CATALOG.md` y el
historial de commits — no son roles rotativos improvisados, son los que ya se venían ejerciendo:

| Rol temporal | Responsable | Que lidera | Quien debe poder explicarlo |
|---|---|---|---|
| Build owner | Juan José | Backend, frontend, Docker/CI, pipeline de evals y flujo principal | Cristian |
| Evaluate owner | Cristian | Ground truth clínico: valida `expected_priority` caso por caso en `evals/CLINICAL_SAFETY_CATALOG.md` | Juan José |
| Explain owner | Juan José | README, resultados, decisiones (`DECISION_LOG.md`) y demo técnica | Cristian |

## Reglas

- El owner lidera, pero no trabaja aislado.
- Cada cambio debe poder ser explicado por otra persona del equipo.
- Cada integrante debe hacer al menos un microcambio visible en GitHub.
- No cuenta decir "yo ayude" si no hay evidencia en el repo.
- No se cambia todo a la vez: una hipotesis, un cambio, una medicion.

## Checklist semanal

- [ ] Todos entienden el flujo principal.
- [ ] Todos entienden los evals.
- [ ] Todos pueden explicar el ultimo cambio.
- [ ] Todos saben que sigue fallando.
- [ ] Cada integrante dejo evidencia en GitHub.

## Preguntas que cualquiera debe responder

1. Que cambio esta semana?
2. Por que ese cambio importa?
3. Como sabemos si mejoro?
4. Que caso sigue fallando?
5. Que haremos despues?
