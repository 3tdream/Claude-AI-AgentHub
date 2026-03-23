---
name: form-builder
description: Generate a form component with validation, error handling, submit logic from field descriptions
argument-hint: <form description> — e.g. "user registration form with email, password, name"
---

Build form for: $ARGUMENTS

1. Read existing form patterns in the project
2. Generate a complete form component:

- Field components with proper types (text, email, number, select, textarea, checkbox)
- Client-side validation (required, min/max, pattern, custom)
- Error messages per field
- Loading state on submit
- Success/error feedback
- Accessible: labels, aria-describedby for errors, focus management
- Responsive layout

Tech stack:
- React 19 with `"use client"`
- Tailwind CSS for styling
- Native form validation or existing patterns in project
- Proper TypeScript types for form data

Output a single ready-to-use component file.
