---
source_file: "backend/app/api/routes_auth.py"
type: "code"
community: "Autenticacion y Sesiones"
location: "L72"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Autenticacion_y_Sesiones
---

# login()

## Connections
- [[LoginRequest]] - `uses` [INFERRED]
- [[Response]] - `references` [EXTRACTED]
- [[SessionStore]] - `uses` [INFERRED]
- [[UserResponse]] - `uses` [INFERRED]
- [[UserStore]] - `uses` [INFERRED]
- [[_set_session_cookie()]] - `calls` [EXTRACTED]
- [[post]] - `references` [EXTRACTED]
- [[routes_auth.py]] - `contains` [EXTRACTED]
- [[verify_password()]] - `calls` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Autenticacion_y_Sesiones