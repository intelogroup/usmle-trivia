# UI States & Error Screens

This document outlines the key UI states, loading placeholders, and error screens for the USMLE Trivia MVP.

## Loading States
- **QuestionCard**: Skeleton placeholder for question text and options
- **ProgressBar**: Animated striped background during initial load

## Error States
- **Network Error**: Display alert with retry button when fetching questions fails
- **Timeout Mid-Quiz**: Show modal warning if quiz submission times out and allow resubmission
- **Empty Review Mode**: Informative empty state if no bookmarked or incorrect questions exist

## Empty States
- **Search No Results**: Message and suggested tags when question search returns zero matches

## Maintenance State
- **Service Unavailable**: Full-page illustration with scheduled maintenance message
