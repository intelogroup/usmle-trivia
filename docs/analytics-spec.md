# Analytics & Interaction Specification

This document outlines the event-tracking schema for capturing user interactions in the USMLE Trivia MVP.

## Event Definitions

| Event Name       | Trigger                                        | Properties                                |
|------------------|------------------------------------------------|-------------------------------------------|
| quiz_start       | User begins a quiz                              | { mode, topic, numQuestions }             |
| question_view    | New question card rendered                      | { questionId, index }                     |
| answer_selected  | User selects an answer option                  | { questionId, selectedOption, correct }   |
| quiz_complete    | Quiz submission or time expiration              | { totalCorrect, totalQuestions, duration }|
| question_bookmark| User bookmarks or flags a question              | { questionId }                            |
| review_start     | User enters Review mode                         | { numBookmarked, numIncorrect }           |
| search_performed | User searches question bank                    | { query, resultCount }                    |
| error_encountered| Any unhandled UI error                          | { errorCode, errorMessage, context }      |

## Data Layer Integration
- Use `data-analytics` attributes on clickable elements in markup
- Consistent naming and property mapping for downstream reporting

## Privacy Considerations
- PII should never be sent through analytics events
- Anonymize user identifiers where required (GDPR/HIPAA)
