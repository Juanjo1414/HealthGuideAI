---
type: community
members: 62
---

# Autenticacion y Sesiones

**Members:** 62 nodes

## Members
- [[dot-_row_to_user()]] - code - backend/app/storage/user_store.py
- [[dot-create()]] - code - backend/app/storage/session_store.py
- [[dot-create_user()]] - code - backend/app/storage/user_store.py
- [[dot-delete()]] - code - backend/app/storage/session_store.py
- [[dot-get_by_email()]] - code - backend/app/storage/user_store.py
- [[dot-get_by_id()]] - code - backend/app/storage/user_store.py
- [[dot-get_valid()]] - code - backend/app/storage/session_store.py
- [[dot-reject_blank()]] - code - backend/app/schemas/auth.py
- [[BaseModel]] - code
- [[Capa de APIGateway para autenticación. Igual que routes_triage.py, esta es la…]] - rationale - backend/app/api/routes_auth.py
- [[Capa de acceso a la tabla `sessions`. Sesiones respaldadas por servidor (no JWT…]] - rationale - backend/app/storage/session_store.py
- [[Capa de acceso a la tabla `users`. No sabe de HTTP ni de hashing de contraseñas…]] - rationale - backend/app/storage/user_store.py
- [[Devuelve el usuario autenticado si la cookie de sesion es valida, o None si no…]] - rationale - backend/app/api/dependencies.py
- [[El logout manual es el unico mecanismo real de cierre de sesion en este…]] - rationale - backend/app/api/routes_auth.py
- [[EmailAlreadyRegisteredError]] - code - backend/app/storage/user_store.py
- [[Esquemas de la API de autenticación. Sin verificación de email por diseño en…]] - rationale - backend/app/schemas/auth.py
- [[Exception_1]] - code
- [[Hashing de contraseñas. Nunca se guarda ni se compara texto plano — bcrypt vía…]] - rationale - backend/app/auth/security.py
- [[LoginRequest]] - code - backend/app/schemas/auth.py
- [[Response]] - code
- [[Session]] - code - backend/app/storage/session_store.py
- [[SessionStore]] - code - backend/app/storage/session_store.py
- [[SignupRequest]] - code - backend/app/schemas/auth.py
- [[User]] - code - backend/app/storage/user_store.py
- [[UserResponse]] - code - backend/app/schemas/auth.py
- [[UserStore]] - code - backend/app/storage/user_store.py
- [[_set_session_cookie()]] - code - backend/app/api/routes_auth.py
- [[auth.py]] - code - backend/app/schemas/auth.py
- [[auth__init__.py]] - code - backend/app/auth/__init__.py
- [[client_with_fresh_db()]] - code - backend/tests/test_auth.py
- [[dataclasses]] - concept
- [[datetime]] - concept
- [[extra='forbid' (Sesion 5) un campo colado a mano (ej. role admin) tiene…]] - rationale - backend/tests/test_auth.py
- [[field_validator]] - code
- [[get]] - code
- [[get_current_user()]] - code - backend/app/api/dependencies.py
- [[hash_password()]] - code - backend/app/auth/security.py
- [[login()]] - code - backend/app/api/routes_auth.py
- [[logout()]] - code - backend/app/api/routes_auth.py
- [[me()]] - code - backend/app/api/routes_auth.py
- [[passlib_context]] - concept
- [[post]] - code
- [[routes_auth.py]] - code - backend/app/api/routes_auth.py
- [[secrets]] - concept
- [[security.py]] - code - backend/app/auth/security.py
- [[session_store.py]] - code - backend/app/storage/session_store.py
- [[signup()]] - code - backend/app/api/routes_auth.py
- [[teardown_function()_2]] - code - backend/tests/test_auth.py
- [[test_auth.py]] - code - backend/tests/test_auth.py
- [[test_login_with_correct_credentials_succeeds()]] - code - backend/tests/test_auth.py
- [[test_login_with_wrong_password_returns_401()]] - code - backend/tests/test_auth.py
- [[test_logout_invalidates_session()]] - code - backend/tests/test_auth.py
- [[test_me_with_valid_session_returns_user()]] - code - backend/tests/test_auth.py
- [[test_me_without_session_returns_401()]] - code - backend/tests/test_auth.py
- [[test_session_cookie_is_not_secure_in_development()]] - code - backend/tests/test_auth.py
- [[test_session_cookie_is_secure_in_production()]] - code - backend/tests/test_auth.py
- [[test_signup_creates_user_and_sets_session_cookie()]] - code - backend/tests/test_auth.py
- [[test_signup_rejects_unexpected_field()]] - code - backend/tests/test_auth.py
- [[test_signup_with_duplicate_email_returns_409()]] - code - backend/tests/test_auth.py
- [[test_triage_without_session_requires_login()]] - code - backend/tests/test_auth.py
- [[user_store.py]] - code - backend/app/storage/user_store.py
- [[verify_password()]] - code - backend/app/auth/security.py

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Autenticacion_y_Sesiones
SORT file.name ASC
```

## Connections to other communities
- 32 edges to [[_COMMUNITY_API Dependencies & Rate Limiting]]
- 8 edges to [[_COMMUNITY_Base de Datos y Health Checks]]
- 4 edges to [[_COMMUNITY_API de Triage y Esquema de Salida]]
- 4 edges to [[_COMMUNITY_Middleware de Seguridad y Config]]
- 1 edge to [[_COMMUNITY_Tests de Gateway y Seguridad]]
- 1 edge to [[_COMMUNITY_Migraciones y Metricas de Evals]]
- 1 edge to [[_COMMUNITY_Deteccion de Red Flags y Reglas de Validacion]]

## Top bridge nodes
- [[test_auth.py]] - degree 23, connects to 3 communities
- [[user_store.py]] - degree 12, connects to 3 communities
- [[dataclasses]] - degree 5, connects to 3 communities
- [[routes_auth.py]] - degree 27, connects to 2 communities
- [[UserStore]] - degree 18, connects to 2 communities