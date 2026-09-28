---
source_file: "backend/app/api/dependencies.py"
type: "code"
community: "API Dependencies & Rate Limiting"
location: "L25"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/API_Dependencies__Rate_Limiting
---

# get_triage_orchestrator()

## Connections
- [[NvidiaProvider]] - `uses` [INFERRED]
- [[TriageOrchestrator]] - `uses` [INFERRED]
- [[dependencies.py]] - `contains` [EXTRACTED]
- [[get_settings()]] - `calls` [EXTRACTED]
- [[routes_triage.py]] - `imports` [EXTRACTED]
- [[test_api.py]] - `imports` [EXTRACTED]
- [[test_rate_limit.py]] - `imports` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/API_Dependencies__Rate_Limiting