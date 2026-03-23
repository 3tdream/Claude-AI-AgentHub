---
name: seed-data
description: Generate realistic test/seed data for database tables or API testing
argument-hint: <table or entity name> [count]
---

Generate seed data for: $ARGUMENTS

1. Read the schema/types for the target entity
2. Generate realistic data (not "test123" or "foo bar"):
   - Real-sounding names, emails, addresses
   - Realistic numeric ranges
   - Proper date distributions
   - Valid enum values
   - Consistent foreign key references

Output formats (choose based on context):
- **SQL INSERT** — for database seeding
- **JSON array** — for API testing or file-based storage
- **TypeScript const** — for unit tests

Default: 10 records. Specify count in arguments for more.

Include edge cases in the data:
- One record with minimum values
- One record with maximum values
- One record with optional fields null
- One record with unicode/special characters
