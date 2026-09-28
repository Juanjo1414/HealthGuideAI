---
source_file: "backend/app/api/dependencies.py"
type: "code"
community: "API Dependencies & Rate Limiting"
location: "L52"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/API_Dependencies__Rate_Limiting
---

# get_db()

## Connections
- [[Database]] - `uses` [INFERRED]
- [[_ensure_admin_seeded()]] - `calls` [EXTRACTED]
- [[dependencies.py]] - `contains` [EXTRACTED]
- [[get_evidence_store()]] - `calls` [EXTRACTED]
- [[get_session_store()]] - `calls` [EXTRACTED]
- [[get_settings()]] - `calls` [EXTRACTED]
- [[get_user_store()]] - `calls` [EXTRACTED]
- [[routes_health.py]] - `imports` [EXTRACTED]
- [[test_auth.py]] - `imports` [EXTRACTED]
- [[test_gateway.py]] - `imports` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/API_Dependencies__Rate_Limiting