---
name: kb-search
description: Search the Mission Control Knowledge Base for patterns, decisions, and learnings
disable-model-invocation: true
argument-hint: search query
---

Search the Knowledge Base for relevant entries.

Steps:
1. Take the search query from $ARGUMENTS
2. GET http://localhost:3077/api/knowledge-base?q={query} (URL-encode the query)
3. Parse the response and display matching entries:
   - **Title**: entry title
   - **Category**: architecture-patterns, failure-patterns, success-patterns, tech-decisions, security-playbook
   - **Severity**: if applicable (critical, high, medium, low)
   - **Content Preview**: first 200 characters of the content
   - **Tags**: associated tags
   - **Created/Updated**: timestamps
4. If no results found:
   - Suggest alternative search terms
   - Also try reading the KB files directly from data/knowledge-base/ and searching locally
5. If multiple results, sort by relevance and show count: "Found N entries matching '{query}'"
