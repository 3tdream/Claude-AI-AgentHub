---
name: dashboard-builder
description: Generate dashboard page — KPI cards + Recharts + detail table from metric descriptions
argument-hint: <dashboard description> — e.g. "sales dashboard with revenue, orders, conversion rate"
---

Build dashboard for: $ARGUMENTS

1. Parse the metrics from the description
2. Generate layout:

**Top row** — KPI cards (2-4):
- Metric name, current value, trend (up/down/flat), % change
- Color-coded: green=good, red=bad, neutral=grey

**Middle section** — Charts (1-2):
- Line chart for time series data
- Bar chart for comparisons
- Use Recharts (already in project dependencies)

**Bottom section** — Detail table:
- Recent entries/transactions
- With sorting and pagination

3. Wire up:
- API data fetching with SWR
- Loading skeletons for each section
- Error states
- Responsive grid (1 col mobile, 2 col tablet, full desktop)

Tech stack: Next.js 15, Tailwind CSS 4, Recharts, SWR
Output ready-to-use page + components.
