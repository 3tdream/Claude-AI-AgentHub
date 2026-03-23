---
name: table-builder
description: Generate one data table component — columns, sorting, filtering, pagination from a data shape description
argument-hint: <data description> — e.g. "users table with name, email, role, last login"
---

Build data table for: $ARGUMENTS

Features:
- Column headers with sort indicators (asc/desc/none)
- Client-side sorting by clicking headers
- Search/filter input
- Pagination (10/25/50 per page)
- Loading skeleton
- Empty state
- Row selection (optional)
- Responsive: horizontal scroll on mobile or card view

Tech stack:
- React 19 with `"use client"`
- Tailwind CSS
- TypeScript generics for data type safety
- Use existing table patterns in project if available

Output:
1. Table component file
2. TypeScript interface for the data type
3. Usage example with sample data
