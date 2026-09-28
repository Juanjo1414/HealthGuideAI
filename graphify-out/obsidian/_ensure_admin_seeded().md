---
source_file: "backend/app/api/dependencies.py"
type: "code"
community: "API Dependencies & Rate Limiting"
location: "L62"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/API_Dependencies__Rate_Limiting
---

# _ensure_admin_seeded()

## Connections
- [[Crea la cuenta admin de arranque si todavia no existe. La contraseña sale de…]] - `rationale_for` [EXTRACTED]
- [[Database]] - `uses` [INFERRED]
- [[EmailAlreadyRegisteredError]] - `uses` [INFERRED]
- [[UserStore]] - `calls` [EXTRACTED]
- [[dependencies.py]] - `contains` [EXTRACTED]
- [[get_db()]] - `calls` [EXTRACTED]
- [[get_settings()]] - `calls` [EXTRACTED]
- [[hash_password()]] - `calls` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/API_Dependencies__Rate_Limiting