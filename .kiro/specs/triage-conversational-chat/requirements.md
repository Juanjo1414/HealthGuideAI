# Requirements Document

## Introduction

HealthGuideAI's current triage flow is stateless: each symptom query is processed in isolation, with no memory of prior exchanges, and the result is shown on a separate results page. This feature introduces a continuous, conversational triage chat with per-conversation memory for authenticated users, similar in interaction style to a chat assistant, while preserving the existing single-pass triage flow unchanged for anonymous (non-authenticated) users.

This initiative also corrects hardcoded emergency phone number references in the frontend. The product targets Colombia, and several fixed UI texts currently display "112" (Spain) and "911" (US/other American countries) instead of "123" (Colombia's Número Único de Seguridad y Emergencias). The country selector already present on the profile page already lists Colombia with "123" correctly and is explicitly out of scope for this correction.

## Glossary

- **System**: The HealthGuideAI backend and frontend application as a whole.
- **Triage_Orchestrator**: The backend component that currently processes a single symptoms submission and returns a classification (`backend/app/orchestration/triage_orchestrator.py`).
- **Chat_Orchestrator**: The backend component (new) responsible for processing a message within the context of a Conversation's accumulated history.
- **Conversation**: A persisted sequence of Chat_Messages belonging to one Authenticated_User, representing one continuous triage dialogue.
- **Chat_Message**: A single turn within a Conversation, authored by either the Authenticated_User or the System, with associated timestamp and ordering.
- **Authenticated_User**: A user who has an active, valid session established through the existing login/signup flow.
- **Anonymous_User**: A user without an active session.
- **Single_Pass_Triage**: The existing stateless triage flow (one symptoms submission producing one isolated classification, with no conversational memory).
- **Red_Flag_Detector**: The deterministic, rule-based component that scans text for emergency indicators prior to model invocation (`detect_red_flags`).
- **Emergency_Gate**: The post-processing rule that forces a classification to EMERGENCIA whenever the Red_Flag_Detector matches, regardless of the model's own output, and that never allows a model response to downgrade a Red_Flag_Detector match.
- **Conversation_History**: The ordered, accumulated set of Chat_Messages in a Conversation up to and including the current turn.
- **Model_Provider**: The backend component that sends prompts to the underlying language model and returns a response (`backend/app/providers/nvidia_provider.py`).
- **Triage_History_View**: The existing frontend page and backend endpoints listing a user's past Single_Pass_Triage entries (`HistoryPage.tsx`, `GET/DELETE /api/v1/triage/history`).
- **Conversation_List_View**: The replacement frontend view (new) listing an Authenticated_User's Conversations.
- **Turn_Limit**: The maximum number of Chat_Messages permitted within a single Conversation.
- **Emergency_Number**: The fixed emergency contact number displayed in static UI text, which SHALL be "123" (Colombia).
- **Country_Selector**: The existing country/emergency-number dropdown on the profile page (`ProfilePage.tsx`), which already lists Colombia with "123" correctly.

## Requirements

### Requirement 1: Conversational Chat Availability

**User Story:** As an authenticated patient, I want to have a continuous conversation with the triage assistant, so that I can describe my symptoms over multiple messages without repeating prior context.

#### Acceptance Criteria

1. WHERE a user is an Authenticated_User, THE System SHALL provide access to the conversational triage chat.
2. IF an Anonymous_User attempts to start or continue a Conversation, THEN THE System SHALL deny the request and prompt the Anonymous_User to log in or sign up.
3. WHILE a user is an Anonymous_User, THE System SHALL continue to provide the Single_Pass_Triage flow unchanged.
4. WHEN an Authenticated_User sends a new Chat_Message in a Conversation, THE Chat_Orchestrator SHALL generate a response using the Conversation_History.

### Requirement 2: Conversation Persistence

**User Story:** As an authenticated patient, I want my conversation to be saved, so that I can leave and return to it without losing context.

#### Acceptance Criteria

1. WHEN an Authenticated_User sends a Chat_Message, THE System SHALL persist the Chat_Message and its associated Conversation to storage before returning a response.
2. WHEN an Authenticated_User opens an existing Conversation, THE System SHALL load and display the full Conversation_History in chronological order.
3. WHEN an Authenticated_User starts a new Conversation, THE System SHALL create a new, distinct Conversation record not linked to any previous Conversation's history.
4. THE System SHALL associate every Conversation with exactly one Authenticated_User.

### Requirement 3: Cumulative Emergency Detection Across Turns

**User Story:** As a product owner, I want the emergency detection safeguards to remain effective across multi-turn conversations, so that a patient cannot unintentionally or intentionally dilute an emergency description across several messages and avoid detection.

#### Acceptance Criteria

1. WHEN an Authenticated_User sends a Chat_Message, THE Red_Flag_Detector SHALL evaluate the full Conversation_History accumulated up to and including that Chat_Message, not solely the newly submitted Chat_Message.
2. IF the Red_Flag_Detector matches on the accumulated Conversation_History, THEN THE Emergency_Gate SHALL force the classification for that turn to EMERGENCIA regardless of the Chat_Orchestrator's model-generated classification.
3. THE Emergency_Gate SHALL NOT allow a model-generated classification to downgrade a classification already forced to EMERGENCIA by the Red_Flag_Detector in the same or an earlier turn of the same Conversation.
4. WHEN a turn in a Conversation is classified as EMERGENCIA, THE System SHALL retain that EMERGENCIA classification as part of the Conversation_History for all subsequent evaluations within the same Conversation.

### Requirement 4: Conversation Turn Limit

**User Story:** As a system operator, I want conversations to have a bounded number of turns, so that model latency and cost per conversation remain predictable.

#### Acceptance Criteria

1. THE System SHALL enforce a Turn_Limit on the number of Chat_Messages permitted within a single Conversation.
2. IF an Authenticated_User attempts to send a Chat_Message that would exceed the Turn_Limit for a Conversation, THEN THE System SHALL reject the Chat_Message and inform the Authenticated_User that the Conversation has reached its maximum length.
3. WHEN an Authenticated_User reaches the Turn_Limit for a Conversation, THE System SHALL allow the Authenticated_User to start a new Conversation.

### Requirement 5: Conversation Rate Limiting

**User Story:** As a system operator, I want chat usage to be rate limited independently from single-pass triage, so that the conversational flow cannot be used to bypass existing abuse protections.

#### Acceptance Criteria

1. THE System SHALL apply a rate limit to Chat_Message submissions that is tracked separately from the rate limit applied to Single_Pass_Triage submissions.
2. IF an Authenticated_User exceeds the chat rate limit, THEN THE System SHALL reject the Chat_Message and inform the Authenticated_User of the rate limit.

### Requirement 6: Conversation List Replaces Single-Pass History for Authenticated Users

**User Story:** As an authenticated patient, I want to see my past conversations instead of a flat list of isolated queries, so that my triage history reflects how I actually interact with the assistant.

#### Acceptance Criteria

1. WHEN an Authenticated_User opens the Conversation_List_View, THE System SHALL display the Authenticated_User's Conversations ordered by most recent activity.
2. THE System SHALL replace the Triage_History_View with the Conversation_List_View for Authenticated_Users.
3. WHEN an Authenticated_User selects a Conversation from the Conversation_List_View, THE System SHALL open that Conversation with its full Conversation_History.
4. WHEN an Authenticated_User deletes a Conversation from the Conversation_List_View, THE System SHALL remove the Conversation and all its Chat_Messages from storage.

### Requirement 7: Output Validation Applies to Every Turn

**User Story:** As a product owner, I want every chat response to pass the same output validation as single-pass triage, so that the conversational flow does not weaken existing safety guarantees.

#### Acceptance Criteria

1. WHEN the Chat_Orchestrator generates a response for a Chat_Message, THE System SHALL validate that response using the same output validation applied to Single_Pass_Triage responses before returning it to the Authenticated_User.
2. IF a Chat_Orchestrator response fails output validation, THEN THE System SHALL NOT return the invalid response to the Authenticated_User and SHALL return a safe fallback response instead.

### Requirement 8: Correct Emergency Number in Fixed UI Text

**User Story:** As a Colombian patient, I want the emergency number shown in the app to be the correct local number, so that I call the right service in an emergency.

#### Acceptance Criteria

1. THE System SHALL display "123" as the Emergency_Number in all static UI text and emergency call-to-action controls outside of the Country_Selector.
2. THE System SHALL NOT display "112" or "911" as the Emergency_Number in any static UI text or emergency call-to-action control outside of the Country_Selector.
3. THE System SHALL leave the Country_Selector and its associated country-to-emergency-number mapping unchanged.

## Out of Scope

- Changing or redesigning the Country_Selector on the profile page.
- Providing conversational chat with memory to Anonymous_Users.
- Defining the exact numeric value of the Turn_Limit (deferred to design).
