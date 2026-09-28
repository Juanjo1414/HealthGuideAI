---
source_file: "backend/tests/test_rate_limit.py"
type: "code"
community: "API Dependencies & Rate Limiting"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/API_Dependencies__Rate_Limiting
---

# test_rate_limit.py

## Connections
- [[EvidenceStore]] - `imports` [EXTRACTED]
- [[InMemoryRateLimiter]] - `imports` [EXTRACTED]
- [[RedisRateLimiter]] - `imports` [EXTRACTED]
- [[StubOrchestrator]] - `imports` [EXTRACTED]
- [[config.py]] - `imports_from` [EXTRACTED]
- [[dependencies.py]] - `imports_from` [EXTRACTED]
- [[evidence_store.py]] - `imports_from` [EXTRACTED]
- [[fastapi_testclient]] - `imports_from` [EXTRACTED]
- [[get_evidence_store()]] - `imports` [EXTRACTED]
- [[get_rate_limiter()]] - `imports` [EXTRACTED]
- [[get_settings()]] - `imports` [EXTRACTED]
- [[get_triage_orchestrator()]] - `imports` [EXTRACTED]
- [[main.py]] - `imports_from` [EXTRACTED]
- [[make_stub_user()]] - `imports` [EXTRACTED]
- [[model_output()]] - `imports` [EXTRACTED]
- [[rate_limit.py]] - `imports_from` [EXTRACTED]
- [[redis_3]] - `imports` [EXTRACTED]
- [[require_authenticated()]] - `imports` [EXTRACTED]
- [[teardown_function()_1]] - `contains` [EXTRACTED]
- [[test_api.py]] - `imports_from` [EXTRACTED]
- [[test_exceeding_limit_returns_429()]] - `contains` [EXTRACTED]
- [[test_limit_is_per_client_key()]] - `contains` [EXTRACTED]
- [[test_redis_rate_limiter_shares_state_across_instances()]] - `contains` [EXTRACTED]
- [[uuid]] - `imports` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/API_Dependencies__Rate_Limiting