---
source_file: "backend/app/api/routes_auth.py"
type: "code"
community: "Autenticacion y Sesiones"
location: "L46"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Autenticacion_y_Sesiones
---

# signup()

## Connections
- [[EmailAlreadyRegisteredError]] - `uses` [INFERRED]
- [[Response]] - `references` [EXTRACTED]
- [[SessionStore]] - `uses` [INFERRED]
- [[SignupRequest]] - `uses` [INFERRED]
- [[UserResponse]] - `uses` [INFERRED]
- [[UserStore]] - `uses` [INFERRED]
- [[_set_session_cookie()]] - `calls` [EXTRACTED]
- [[hash_password()]] - `calls` [EXTRACTED]
- [[post]] - `references` [EXTRACTED]
- [[routes_auth.py]] - `contains` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Autenticacion_y_Sesiones