---
source_file: "backend/tests/test_api.py"
type: "code"
community: "API Dependencies & Rate Limiting"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/API_Dependencies__Rate_Limiting
---

# test_api.py

## Connections
- [[EvidenceStore]] - `imports` [EXTRACTED]
- [[InMemoryRateLimiter]] - `imports` [EXTRACTED]
- [[StubOrchestrator]] - `contains` [EXTRACTED]
- [[UserStore]] - `imports` [EXTRACTED]
- [[client_with_output()]] - `contains` [EXTRACTED]
- [[dependencies.py]] - `imports_from` [EXTRACTED]
- [[evidence_store.py]] - `imports_from` [EXTRACTED]
- [[fastapi_testclient]] - `imports_from` [EXTRACTED]
- [[get_evidence_store()]] - `imports` [EXTRACTED]
- [[get_rate_limiter()]] - `imports` [EXTRACTED]
- [[get_triage_orchestrator()]] - `imports` [EXTRACTED]
- [[json]] - `imports` [EXTRACTED]
- [[main.py]] - `imports_from` [EXTRACTED]
- [[make_stub_user()]] - `contains` [EXTRACTED]
- [[model_output()]] - `contains` [EXTRACTED]
- [[rate_limit.py]] - `imports_from` [EXTRACTED]
- [[require_authenticated()]] - `imports` [EXTRACTED]
- [[teardown_function()]] - `contains` [EXTRACTED]
- [[test_evidence_omits_sensitive_payloads_by_default()]] - `contains` [EXTRACTED]
- [[test_fallback_never_downgrades_model_emergency()]] - `contains` [EXTRACTED]
- [[test_health_does_not_require_provider_key()]] - `contains` [EXTRACTED]
- [[test_rate_limit.py]] - `imports_from` [EXTRACTED]
- [[test_triage_rejects_unexpected_field()]] - `contains` [EXTRACTED]
- [[test_undertriaged_red_flag_uses_emergency_fallback()]] - `contains` [EXTRACTED]
- [[test_unsafe_model_output_is_replaced_by_safe_fallback()]] - `contains` [EXTRACTED]
- [[test_whitespace_only_input_is_rejected()]] - `contains` [EXTRACTED]
- [[user_store.py]] - `imports_from` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/API_Dependencies__Rate_Limiting