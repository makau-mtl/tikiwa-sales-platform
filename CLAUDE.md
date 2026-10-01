@AGENTS.md
# Tikiwa Smart Sales Platform
Land sales platform for Tikiwa Lands Ltd (Kenya). Not a listings site.
Full vision: docs/BLUEPRINT.md

## Stack
Next.js (App Router, TypeScript, src/ directory), Tailwind, Supabase (Postgres, Auth, Storage), Vercel.

## Current scope: PHASE 1 ONLY
Marketing site, project and plot inventory, admin dashboard, lead capture
and pipeline, WhatsApp click-to-chat (wa.me links).
Do NOT build: AI assistant, n8n, WhatsApp Cloud API, analytics. Those are Phase 2/3.

## Commands
- Dev: npm run dev
- Lint: npm run lint
- Build: npm run build
- Apply DB changes: npx supabase db push

## Database (already created, see supabase/migrations/)
Tables: profiles, projects, plots, project_media, payment_plans, leads,
lead_activities, site_visits. RLS is enabled on all of them.
- Staff = a row in profiles (role: admin or agent). Helper functions is_staff() and is_admin().
- Public can read only published projects (is_published) and their available plots.
- Leads, activities and visits are staff-only. Admins write projects and plots.
- Staff sign-up is disabled. Staff accounts are created manually in the Supabase dashboard.

## Rules
- All schema changes are new SQL files in supabase/migrations/. Never edit applied migrations or change the DB by hand.
- Keep RLS enabled on every table.
- Public lead capture goes through a server route using the service role: upsert on phone, log every inquiry in lead_activities, store UTM fields.
- Never expose SUPABASE_SERVICE_ROLE_KEY to client code. Only NEXT_PUBLIC_ variables reach the browser.
- Mobile-first, fast, trust-focused design. Currency in KES. Phone numbers stored as +254XXXXXXXXX.
- One feature per branch. Small commits. Run lint and build before committing.
- Ask before adding any new dependency.