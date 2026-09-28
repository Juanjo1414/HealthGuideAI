---
source_file: "backend/tests/test_api.py"
type: "code"
community: "API Dependencies & Rate Limiting"
location: "L33"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/API_Dependencies__Rate_Limiting
---

# model_output()

## Connections
- [[test_api.py]] - `contains` [EXTRACTED]
- [[test_evidence_omits_sensitive_payloads_by_default()]] - `calls` [EXTRACTED]
- [[test_exceeding_limit_returns_429()]] - `calls` [EXTRACTED]
- [[test_fallback_never_downgrades_model_emergency()]] - `calls` [EXTRACTED]
- [[test_rate_limit.py]] - `imports` [EXTRACTED]
- [[test_triage_rejects_unexpected_field()]] - `calls` [EXTRACTED]
- [[test_undertriaged_red_flag_uses_emergency_fallback()]] - `calls` [EXTRACTED]
- [[test_unsafe_model_output_is_replaced_by_safe_fallback()]] - `calls` [EXTRACTED]
- [[test_whitespace_only_input_is_rejected()]] - `calls` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/API_Dependencies__Rate_Limiting