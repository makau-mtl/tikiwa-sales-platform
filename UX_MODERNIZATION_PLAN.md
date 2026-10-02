# Sprint 1: UX Modernization Plan

## Guardrails

- Preserve the existing Next.js routes, Supabase queries, authorization checks, data validation, and mutation semantics.
- Make no database, Supabase policy, or business-logic changes.
- Keep the current Shadcn-style primitives and approved Radix, Lucide, and Sonner packages; add no further dependencies.

## MVP Scope

1. **Projects (MVP-009):** Retain the existing project query and convert the listing into responsive cards with clearer hierarchy and mobile-safe actions.
2. **Statuses (MVP-010):** Use the shared Badge primitive for Draft/Published projects and Available/Reserved/Sold Out plots. “Sold Out” is a display label for the existing `sold` status; do not change stored values.
3. **Actions (MVP-011):** Provide View Project, Edit Project, Publish/Unpublish, Import Plots, Manage Media, and Delete Project in a dropdown. Reuse current routes and server actions; keep the project-name delete confirmation.
4. **Notifications (MVP-012):** Use Sonner for existing create/save/delete/publish/import outcomes and safe user-facing errors. Keep existing operation behavior.
5. **Metrics (MVP-013):** Derive Projects, Total Plots, Available, Reserved, and Sold counts from current project/plot queries.
6. **Empty states (MVP-014):** Provide concise, useful empty states and role-appropriate calls to action.
7. **Loading (MVP-015):** Add route-level skeletons for Projects and Inventory while preserving the current server-rendered pages.

## Inventory UX

- Keep the existing plot inventory query and edit/delete actions.
- Add client-side search by plot number/size and status filtering over the already-fetched records.
- Do not add bulk database mutations or alter plot status semantics in this sprint.
- Preserve the existing manual add, batch generation, and CSV import workflows.

## Implementation Order

1. Finish shared UI primitives and the responsive project Actions dropdown.
2. Convert Projects to cards and five portfolio metrics; add its empty state and Sonner notices.
3. Use the Accordion in project details and align form spacing/typography without changing fields or actions.
4. Replace the inventory row layout with a searchable/filterable semantic table and plot badges; keep existing edit/delete forms/actions.
5. Add inventory empty state and route loading skeletons.
6. Run `npm run lint`, `npm run typecheck`, and `npm run build`; resolve findings.
7. Review the final diff to verify no schema, policy, query, or business-rule changes. Commit as `feat: modernize inventory and project management UX`; do not push.