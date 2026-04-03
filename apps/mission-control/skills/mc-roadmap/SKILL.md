---
name: mc-roadmap
description: Show Mission Control roadmap — current sprint, progress, next tasks, milestones
disable-model-invocation: true
---

Display the current Mission Control product roadmap and progress.

Steps:
1. Read the roadmap memory file:
   - Path: C:\Users\Ro050\.claude\projects\C--Users-Ro050-Desktop-ai-projects\memory\project_mc_roadmap.md
   - If the file does not exist, inform the user and suggest creating one
2. Also read related planning files for additional context:
   - C:\Users\Ro050\.claude\projects\C--Users-Ro050-Desktop-ai-projects\memory\project_mc_product_plan.md
   - C:\Users\Ro050\.claude\projects\C--Users-Ro050-Desktop-ai-projects\memory\project_phase2_plan.md
3. Display the roadmap:
   - **Current Sprint**: what is being worked on right now
   - **Completed Items**: features and tasks already done (with dates if available)
   - **Next Tasks**: upcoming work items in priority order
   - **Milestones**: key dates and deliverables
   - **Blockers**: anything blocking progress (from product_blockers if available)
4. If there are discrepancies between the roadmap file and recent git history, flag them
   - Run `git log --oneline -10` to check if recent work aligns with the roadmap
