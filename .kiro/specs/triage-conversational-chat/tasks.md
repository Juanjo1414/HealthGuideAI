# Implementation Plan: Triage Conversational Chat

## Overview

Convierte el diseño en pasos de código incrementales: primero la extracción del pipeline compartido y el esquema nuevo, luego `ChatOrchestrator` y `ConversationStore`, luego la capa de API, luego el frontend (chat + lista de conversaciones + corrección del número de emergencia), y por último el cableado final. Property tests con Hypothesis acompañan cada pieza de lógica pura; tests de integración/ejemplo (pytest + fixture `db`, Vitest + React Testing Library) cubren el resto.

## Tasks

- [x] 1. Agregar Hypothesis como dependencia de test y extraer el pipeline compartido
  - Agregar `hypothesis>=6.100,<7` a `backend/requirements-dev.txt`
  - Crear `backend/app/orchestration/pipeline.py` con `run_pipeline(evaluation_text, model_input_text, provider, retriever, already_emergency)`, moviendo la lógica de `TriageOrchestrator.run()` (red flags, RAG, llamada al modelo, normalización, `drop_named_disease_causes`, gate de emergencia) sin cambiar su comportamiento
  - Reescribir `TriageOrchestrator.run()` como wrapper de una línea sobre `run_pipeline(symptoms_text, symptoms_text, self._provider, self._knowledge_retriever, already_emergency=False)`
  - _Requirements: 3.2, 3.3, 7.1_

- [x] 2. Checkpoint — Confirmar que la extracción no rompió nada
  - Ejecutar la suite existente de `backend/tests/test_triage_orchestrator.py` sin modificarla y confirmar que sigue pasando igual que antes de la extracción. Preguntar al usuario si surgen dudas.

- [x] 3. Esquema de base de datos para conversaciones
  - [x] 3.1 Agregar las tablas `conversations` y `chat_messages` a `backend/app/storage/schema.py` (`CREATE_STATEMENTS`), con los índices `idx_conversations_user_id`, `idx_conversations_last_activity`, `idx_chat_messages_conversation_id`
    - _Requirements: 2.1, 2.4, 3.3, 3.4, 6.1_
  - [x] 3.2 Crear la migración Alembic `backend/alembic/versions/0002_chat_conversations.py` reutilizando las mismas sentencias DDL de `schema.py`
    - _Requirements: 2.1, 2.4_

- [x] 4. Implementar `ConversationStore`
  - [x] 4.1 Crear `backend/app/storage/conversation_store.py` con `create_conversation`, `get_conversation` (filtrado por `user_id` en SQL), `list_conversations` (ordenado por `last_activity_at DESC`), `append_message` (actualiza `last_activity_at`/`message_count` en la misma transacción), `mark_emergency_locked`, `messages_for` (orden cronológico), `delete_conversation` (con `WHERE user_id = %s`)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.1, 6.4_
  - [ ]* 4.2 Escribir property test para persistencia round-trip
    - **Feature: triage-conversational-chat, Property 2: Persistir antes de responder (round trip)**
    - **Validates: Requirements 2.1**
    - Usa el fixture `db` existente de `conftest.py`
  - [ ]* 4.3 Escribir property test para orden cronológico del historial
    - **Feature: triage-conversational-chat, Property 3: El historial se lee en orden cronológico**
    - **Validates: Requirements 2.2, 6.3**
  - [ ]* 4.4 Escribir property test para aislamiento entre conversaciones nuevas
    - **Feature: triage-conversational-chat, Property 4: Conversaciones nuevas están aisladas**
    - **Validates: Requirements 2.3**
  - [ ]* 4.5 Escribir property test para autorización por dueño
    - **Feature: triage-conversational-chat, Property 5: Una conversación tiene exactamente un dueño**
    - **Validates: Requirements 2.4**
  - [ ]* 4.6 Escribir property test para orden por actividad reciente en el listado
    - **Feature: triage-conversational-chat, Property 10: La lista de conversaciones respeta el orden de actividad reciente**
    - **Validates: Requirements 6.1**
  - [ ]* 4.7 Escribir property test para borrado completo
    - **Feature: triage-conversational-chat, Property 11: Borrar una conversación la elimina por completo**
    - **Validates: Requirements 6.4**

- [x] 5. Implementar `ChatOrchestrator`
  - [x] 5.1 Crear `backend/app/orchestration/chat_orchestrator.py` con `ChatOrchestrator.run_turn(history, new_user_message, already_emergency)`: construye `evaluation_text` (concatenación cronológica de todos los mensajes de usuario + el nuevo), construye el payload con el campo `"historial"` (lista `{"rol", "texto"}`), y llama a `run_pipeline()`
    - Agregar la constante `TURN_LIMIT = 40` en este módulo
    - _Requirements: 1.4, 3.1_
  - [x] 5.2 Agregar `"historial"` a `INSTRUCTION_HIERARCHY` en `backend/app/orchestration/contract.py` y a las instrucciones de `backend/app/orchestration/prompt_builder.py`, siguiendo el mismo criterio ya usado para `"contexto_recuperado"`
    - _Requirements: 1.4_
  - [ ]* 5.3 Escribir property test de que el historial completo llega al payload del modelo
    - **Feature: triage-conversational-chat, Property 1: El historial llega completo al modelo**
    - **Validates: Requirements 1.4**
    - Usa un `FakeProvider` igual al de `test_triage_orchestrator.py`
  - [ ]* 5.4 Escribir property test de red flags diluidos entre turnos
    - **Feature: triage-conversational-chat, Property 6: Red flags diluidos entre turnos siguen detectándose**
    - **Validates: Requirements 3.1**
  - [ ]* 5.5 Escribir property test de que un red flag en el acumulado fuerza EMERGENCIA sin importar la salida del modelo
    - **Feature: triage-conversational-chat, Property 7: Un red flag en el acumulado fuerza EMERGENCIA sin importar el modelo**
    - **Validates: Requirements 3.2**
  - [ ]* 5.6 Escribir property test de monotonicidad del lock de emergencia
    - **Feature: triage-conversational-chat, Property 8: Una vez EMERGENCIA, nunca baja en la misma conversación (monotonicidad)**
    - **Validates: Requirements 3.3, 3.4**

- [x] 6. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Rate limiting y schemas de chat
  - [x] 7.1 Agregar `enforce_chat_rate_limit`/`get_chat_rate_limiter` a `backend/app/api/rate_limit.py` (clave `"chat:"`, mismo patrón que `enforce_auth_rate_limit`), y las settings `CHAT_RATE_LIMIT_MAX_REQUESTS`/`CHAT_RATE_LIMIT_WINDOW_SECONDS` en `backend/app/config.py` (default 20/60s)
    - _Requirements: 5.1_
  - [ ]* 7.2 Escribir test unitario de que el namespace `"chat:"` es independiente del de triage/auth (429 con límite bajo configurado en el test)
    - _Requirements: 5.1, 5.2_
  - [x] 7.3 Crear `backend/app/schemas/chat.py` con `SendMessageRequest`, `ChatMessageOut`, `ConversationDetail`, `ConversationSummary`
    - _Requirements: 2.1, 2.2, 6.1, 6.3_

- [x] 8. Implementar la capa de API de chat
  - [x] 8.1 Agregar `get_chat_orchestrator` y `get_conversation_store` a `backend/app/api/dependencies.py` (patrón `@lru_cache`)
    - _Requirements: 1.4, 2.1_
  - [x] 8.2 Crear `backend/app/api/routes_chat.py` con `POST /chat/conversations`, `GET /chat/conversations`, `GET /chat/conversations/{id}`, `DELETE /chat/conversations/{id}`, protegidos por `require_authenticated`
    - _Requirements: 1.1, 1.2, 2.3, 2.4, 6.1, 6.2, 6.3, 6.4_
  - [x] 8.3 Implementar `POST /chat/conversations/{id}/messages` siguiendo el flujo del diseño: 404 genérico si no existe/no es del usuario, 409 si se alcanzó `TURN_LIMIT`, invocación de `ChatOrchestrator.run_turn`, `validate_output` sobre el texto acumulado, `build_safe_fallback` si falla, `mark_emergency_locked` si corresponde, persistencia de ambos mensajes + evidencia en una transacción lógica
    - _Requirements: 1.2, 1.4, 2.1, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 7.1, 7.2_
  - [x] 8.4 Montar `routes_chat.router` en `backend/app/main.py` bajo `/api/v1` (sin exponerlo también en el prefijo deprecado sin versión, ya que es un endpoint nuevo)
    - _Requirements: 1.1_
  - [ ]* 8.5 Escribir property test del límite de turnos como frontera dura
    - **Feature: triage-conversational-chat, Property 9: El límite de turnos es una frontera dura**
    - **Validates: Requirements 4.1, 4.2**
  - [ ]* 8.6 Escribir property test de que cada turno pasa por el validador de salida compartido
    - **Feature: triage-conversational-chat, Property 12: Cada turno pasa por el validador de salida compartido**
    - **Validates: Requirements 7.1**
  - [ ]* 8.7 Escribir property test de que las respuestas que fallan validación nunca llegan al usuario
    - **Feature: triage-conversational-chat, Property 13: Las respuestas que fallan validación nunca llegan al usuario**
    - **Validates: Requirements 7.2**
  - [ ]* 8.8 Escribir tests de integración/ejemplo para: anónimo recibe 401 en cada endpoint de `/chat/*` (Requirement 1.2), nueva conversación disponible tras alcanzar el límite (Requirement 4.3), content vacío/>4000 caracteres devuelve 422 (schema), fallo del proveedor con/sin red flag ya acumulado (502 vs fallback)
    - _Requirements: 1.2, 4.3_

- [x] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend: cliente de API y constante de emergencia
  - [x] 10.1 Crear `frontend/src/constants/emergency.ts` exportando `EMERGENCY_NUMBER = "123"` (mismo patrón que `frontend/src/constants/priority.ts`)
    - _Requirements: 8.1, 8.2_
  - [x] 10.2 Crear `frontend/src/api/chatApi.ts` (mismo patrón que `triageApi.ts`): `createConversation`, `listConversations`, `getConversation`, `sendMessage`, `deleteConversation`, y los tipos correspondientes agregados a `frontend/src/api/types.ts`
    - _Requirements: 1.4, 2.1, 2.2, 2.3, 6.1, 6.3, 6.4_
  - [ ]* 10.3 Escribir tests unitarios para `chatApi.ts` (mismo patrón que `triageApi.test.ts`)
    - _Requirements: 2.1, 6.1_

- [x] 11. Frontend: corregir el número de emergencia hardcodeado
  - [x] 11.1 Reemplazar los literales `"112"`/`"911"` por `EMERGENCY_NUMBER` en `AuthPage.tsx`, `SiteHeader.tsx`, `SiteFooter.tsx`, `HomePage.tsx`, `NotFoundPage.tsx`, `OfflinePanel.tsx`, `ResultPage.tsx`, `TermsPage.tsx`, `ServerErrorPage.tsx`, `EmergencyPanel.tsx`, `ProtocolPage.tsx`, sin tocar `ProfilePage.tsx` ni el `Country_Selector`
    - _Requirements: 8.1, 8.2, 8.3_
  - [ ]* 11.2 Escribir/actualizar tests de render con React Testing Library para cada uno de los 10 archivos listados, verificando que renderizan "123" y no renderizan "112" ni "911" (replicando el patrón de `ProfilePage.test.tsx`/`StaticPages.test.tsx`)
    - _Requirements: 8.1, 8.2_

- [x] 12. Frontend: página de chat
  - [x] 12.1 Crear `frontend/src/pages/ChatPage.tsx`: envío de mensajes, renderizado del historial en orden cronológico, manejo de 409 (límite de turnos) y 401 (redirección a login/signup)
    - _Requirements: 1.1, 1.2, 1.4, 2.2_
  - [ ]* 12.2 Escribir tests de render/interacción para `ChatPage.tsx` (mismo patrón que `HomePage.test.tsx`/`AuthPage.test.tsx`)
    - _Requirements: 1.1, 1.2, 1.4, 2.2, 4.3_

- [x] 13. Frontend: lista de conversaciones reemplaza el historial
  - [x] 13.1 Crear `frontend/src/pages/ConversationListPage.tsx` listando conversaciones ordenadas por actividad reciente, con navegación a cada conversación y acción de borrado
    - _Requirements: 6.1, 6.3, 6.4_
  - [x] 13.2 Eliminar `frontend/src/pages/HistoryPage.tsx` y `HistoryPage.test.tsx`, y actualizar `frontend/src/App.tsx` para que la ruta `/historial` (o una ruta nueva) monte `ConversationListPage` y una ruta nueva monte `ChatPage`
    - _Requirements: 6.2_
  - [ ]* 13.3 Escribir tests de render/interacción para `ConversationListPage.tsx` (listado, apertura, borrado)
    - _Requirements: 6.1, 6.3, 6.4_

- [x] 14. Checkpoint final — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Las tareas marcadas con `*` son opcionales (tests) y no se implementan como parte de la ejecución estándar de este plan, salvo que se indique lo contrario.
- Cada property test referencia su número de propiedad del diseño y corre con el mínimo de 100 ejemplos por default de Hypothesis.
- Los property tests que tocan Postgres usan el fixture `db` existente de `backend/tests/conftest.py`. Los que tocan el pipeline de orquestación usan un `FakeProvider` sin red real.
- La corrección del número de emergencia incluye 11 archivos frontend en total (los 9 originales del requisito más `EmergencyPanel.tsx` y `ProtocolPage.tsx`, confirmado con el usuario), repartidos entre las tareas 11.1 y 11.2.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1", "10.1"] },
    { "id": 1, "tasks": ["3.2", "4.1", "7.1"] },
    { "id": 2, "tasks": ["4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "5.1", "7.2", "11.1"] },
    { "id": 3, "tasks": ["5.2", "7.3", "11.2"] },
    { "id": 4, "tasks": ["5.3", "5.4", "5.5", "5.6"] },
    { "id": 5, "tasks": ["8.1", "10.2"] },
    { "id": 6, "tasks": ["8.2", "10.3"] },
    { "id": 7, "tasks": ["8.3"] },
    { "id": 8, "tasks": ["8.4"] },
    { "id": 9, "tasks": ["8.5", "8.6", "8.7", "8.8", "12.1"] },
    { "id": 10, "tasks": ["12.2", "13.1"] },
    { "id": 11, "tasks": ["13.2"] },
    { "id": 12, "tasks": ["13.3"] }
  ]
}
```
