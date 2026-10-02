# Project Creation Redesign Plan

## Approved Scope

- Require only project name, county, and area/town during project creation.
- Store county and area/town together in the existing `projects.location` field as `Area/Town, County County` (for example, `Juja, Kiambu County`).
- Remove slug from every user-facing form. Generate a normalized slug from the project name on create, add deterministic numeric suffixes for collisions, and preserve the existing slug on edits.
- Make `projects.base_price` nullable in a new migration file. Generate the migration but do not apply it.
- Put optional project data in a collapsed `Additional Project Details (Optional)` section: cover image, description, GPS coordinates, developer information, and gallery images.
- Reuse `project_media` and its existing private image storage for cover/gallery assets. Keep cover first using `sort_order`; do not add media tables or columns.
- Store developer information within the existing description value using a stable, reversible delimiter because there is no developer column and this change should avoid another schema migration.
- Replace slug-based project deletion confirmation with exact project-name confirmation.
- After successful project creation, show actions to import plot numbers, add plots manually, invite sales agents, or skip for now.
- Implement CSV import against the existing `plots` table. The CSV requires `plot_number`; `size_label` and `price` may be supplied per row or provided once as import defaults. Set status to `available`.
- Report imported/rejected counts and row-level errors. Derive inventory counts from `plots`; do not add `total_plots`.
- Do not implement OCR, reservations, GIS/geometry, or AI generation as part of this work.

## Application Changes

1. Simplify the shared project form and use native `<details>` disclosure for optional fields. Split location into County and Area/Town controls while persisting the combined value to `location`.
2. Update server-side create/update validation. On create, generate and collision-resolve the slug server-side. On update, read and retain the stored slug rather than accepting one from the form.
3. Update project list/detail displays and deletion confirmation so no user-facing form asks for or requires a slug.
4. Add a project-created success route with the four requested next actions. Link manual plot entry to the existing inventory route. Provide an honest placeholder for sales-agent invitations because staff invitations are not implemented.
5. Add a project-scoped CSV import route and server action. Parse quoted CSV fields, check required headers, validate blank/duplicate plot numbers and invalid sizes/prices, apply optional one-time defaults, insert valid rows, and return counts plus row errors.
6. Keep all plot inserts on the current `plots` schema. `project_id` comes from the route; `id`, `updated_at`, and `status` use existing defaults where appropriate.

## Database and Storage

- Add one migration that alters only `projects.base_price` to drop `NOT NULL`. Do not run `supabase db push` or otherwise apply it.
- No changes to `projects.location`, `projects.slug`, `plots`, `project_media`, or storage bucket policy are planned.
- Existing plot constraints remain: `project_id`, `plot_number`, `size_label`, and `price` are required, and `(project_id, plot_number)` is unique. Missing size/price values must be resolved by the CSV defaults before insert.

## Verification and Commits

- Add or update focused validation for slug generation, CSV parsing/defaulting, duplicate handling, and row-level import results where the existing test setup permits.
- Run `npm run build`, `npm run lint`, and `npm run typecheck` as requested. The repository currently has no `typecheck` script; add a script for `tsc --noEmit` if absent, then run it.
- Preserve the pre-existing worktree changes. Commit only changes attributable to this approved implementation, in logical commits, and do not push.

## Constraints and Caveats

- County and area/town remain combined in `location`; they are not independently queryable until a future schema change.
- Developer information is encoded within the existing description to avoid adding a database column. Keep the encoding private to application code and render the content as readable text.
- Sales-agent invitation is not an existing feature; the success-flow action should lead to a clear placeholder rather than imply an invitation was sent.
- The nullable `base_price` migration is generated only. The application may require it to be applied before project creation without a price can succeed against the live database.