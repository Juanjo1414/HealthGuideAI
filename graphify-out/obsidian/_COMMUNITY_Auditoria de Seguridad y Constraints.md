---
type: community
members: 9
---

# Auditoria de Seguridad y Constraints

**Members:** 9 nodes

## Members
- [[Auditoría cyber-neo del repo (Sesión 5) root en contenedor, DATABASE_URL default]] - rationale - backend/README.md
- [[CONSTRAINTS.md — nivel de calidad exigido]] - document - CONSTRAINTS.md
- [[Cero falsos negativos en red flags de EMERGENCIA]] - rationale - CONSTRAINTS.md
- [[Cobertura backend ≥80% ratchet (hoy 91%)]] - rationale - CONSTRAINTS.md
- [[Floor reglas siempre enforced (sin supresiones, sin stubs, sin secretos)]] - rationale - CONSTRAINTS.md
- [[Gaps conocidos (accesibilidad, prompt injection set, linter frontend)]] - rationale - CONSTRAINTS.md
- [[Política de excepciones (owner + fecha de vencimiento, máx 90 días)]] - rationale - CONSTRAINTS.md
- [[Seguridad de la aplicación (Sesión 5) guard de arranque, CSRF, headers]] - concept - backend/README.md
- [[Tabla de dimensiones enforced con número y comando]] - concept - CONSTRAINTS.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Auditoria_de_Seguridad_y_Constraints
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_CI y Requisitos de Escalabilidad]]
- 2 edges to [[_COMMUNITY_Decisiones del API Gateway]]
- 1 edge to [[_COMMUNITY_Bugs Documentados en CLAUDE]]

## Top bridge nodes
- [[CONSTRAINTS.md — nivel de calidad exigido]] - degree 6, connects to 2 communities
- [[Tabla de dimensiones enforced con número y comando]] - degree 5, connects to 1 community
- [[Seguridad de la aplicación (Sesión 5) guard de arranque, CSRF, headers]] - degree 3, connects to 1 community
- [[Cero falsos negativos en red flags de EMERGENCIA]] - degree 2, connects to 1 community