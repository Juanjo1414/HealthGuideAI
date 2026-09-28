---
source_file: "backend/app/api/dependencies.py"
type: "code"
community: "API Dependencies & Rate Limiting"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/API_Dependencies__Rate_Limiting
---

# dependencies.py

## Connections
- [[Database]] - `imports` [EXTRACTED]
- [[EmailAlreadyRegisteredError]] - `imports` [EXTRACTED]
- [[EvidenceStore]] - `imports` [EXTRACTED]
- [[FastAPI]] - `imports_from` [EXTRACTED]
- [[NvidiaProvider]] - `imports` [EXTRACTED]
- [[Redis]] - `imports` [EXTRACTED]
- [[SessionStore]] - `imports` [EXTRACTED]
- [[TriageOrchestrator]] - `imports` [EXTRACTED]
- [[User]] - `imports` [EXTRACTED]
- [[UserStore]] - `imports` [EXTRACTED]
- [[Wiring de dependencias — el unico lugar del backend donde se decide QUE…]] - `rationale_for` [EXTRACTED]
- [[_ensure_admin_seeded()]] - `contains` [EXTRACTED]
- [[config.py]] - `imports_from` [EXTRACTED]
- [[db.py]] - `imports_from` [EXTRACTED]
- [[evidence_store.py]] - `imports_from` [EXTRACTED]
- [[functools]] - `imports_from` [EXTRACTED]
- [[get_current_user()]] - `contains` [EXTRACTED]
- [[get_db()]] - `contains` [EXTRACTED]
- [[get_evidence_store()]] - `contains` [EXTRACTED]
- [[get_redis_client()]] - `contains` [EXTRACTED]
- [[get_session_store()]] - `contains` [EXTRACTED]
- [[get_settings()]] - `imports` [EXTRACTED]
- [[get_triage_orchestrator()]] - `contains` [EXTRACTED]
- [[get_user_store()]] - `contains` [EXTRACTED]
- [[hash_password()]] - `imports` [EXTRACTED]
- [[nvidia_provider.py]] - `imports_from` [EXTRACTED]
- [[rate_limit.py]] - `imports_from` [EXTRACTED]
- [[require_admin()]] - `contains` [EXTRACTED]
- [[require_authenticated()]] - `contains` [EXTRACTED]
- [[routes_auth.py]] - `imports_from` [EXTRACTED]
- [[routes_health.py]] - `imports_from` [EXTRACTED]
- [[routes_triage.py]] - `imports_from` [EXTRACTED]
- [[security.py]] - `imports_from` [EXTRACTED]
- [[session_store.py]] - `imports_from` [EXTRACTED]
- [[test_api.py]] - `imports_from` [EXTRACTED]
- [[test_auth.py]] - `imports_from` [EXTRACTED]
- [[test_gateway.py]] - `imports_from` [EXTRACTED]
- [[test_rate_limit.py]] - `imports_from` [EXTRACTED]
- [[triage_orchestrator.py]] - `imports_from` [EXTRACTED]
- [[user_store.py]] - `imports_from` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/API_Dependencies__Rate_Limiting