---
source_file: "backend/tests/test_auth.py"
type: "code"
community: "Autenticacion y Sesiones"
location: "L1"
tags:
  - graphify/code
  - graphify/EXTRACTED
  - community/Autenticacion_y_Sesiones
---

# test_auth.py

## Connections
- [[SessionStore]] - `imports` [EXTRACTED]
- [[UserStore]] - `imports` [EXTRACTED]
- [[client_with_fresh_db()]] - `contains` [EXTRACTED]
- [[dependencies.py]] - `imports_from` [EXTRACTED]
- [[fastapi_testclient]] - `imports_from` [EXTRACTED]
- [[get_db()]] - `imports` [EXTRACTED]
- [[get_session_store()]] - `imports` [EXTRACTED]
- [[get_user_store()]] - `imports` [EXTRACTED]
- [[main.py]] - `imports_from` [EXTRACTED]
- [[session_store.py]] - `imports_from` [EXTRACTED]
- [[teardown_function()_2]] - `contains` [EXTRACTED]
- [[test_login_with_correct_credentials_succeeds()]] - `contains` [EXTRACTED]
- [[test_login_with_wrong_password_returns_401()]] - `contains` [EXTRACTED]
- [[test_logout_invalidates_session()]] - `contains` [EXTRACTED]
- [[test_me_with_valid_session_returns_user()]] - `contains` [EXTRACTED]
- [[test_me_without_session_returns_401()]] - `contains` [EXTRACTED]
- [[test_session_cookie_is_not_secure_in_development()]] - `contains` [EXTRACTED]
- [[test_session_cookie_is_secure_in_production()]] - `contains` [EXTRACTED]
- [[test_signup_creates_user_and_sets_session_cookie()]] - `contains` [EXTRACTED]
- [[test_signup_rejects_unexpected_field()]] - `contains` [EXTRACTED]
- [[test_signup_with_duplicate_email_returns_409()]] - `contains` [EXTRACTED]
- [[test_triage_without_session_requires_login()]] - `contains` [EXTRACTED]
- [[user_store.py]] - `imports_from` [EXTRACTED]

#graphify/code #graphify/EXTRACTED #community/Autenticacion_y_Sesiones