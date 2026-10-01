-- Enums
create type plot_status as enum ('available', 'reserved', 'sold');
create type lead_status as enum ('new', 'contacted', 'visit_scheduled', 'negotiating', 'deposit_paid', 'sold', 'lost');
create type lead_source as enum ('facebook', 'tiktok', 'instagram', 'whatsapp', 'website', 'referral', 'other');
create type visit_status as enum ('scheduled', 'completed', 'no_show', 'cancelled');
create type staff_role as enum ('admin', 'agent');

-- Shared updated_at trigger
create function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Staff profiles (one row per staff login; created manually)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role staff_role not null default 'agent',
  created_at timestamptz not null default now()
);

create function is_staff() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid());
$$;

create function is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- Inventory
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text not null,
  description text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  amenities text[] not null default '{}',
  base_price numeric(12,2) not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger projects_updated before update on projects
  for each row execute function set_updated_at();

create table plots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  plot_number text not null,
  size_label text not null,
  price numeric(12,2) not null,
  status plot_status not null default 'available',
  updated_at timestamptz not null default now(),
  unique (project_id, plot_number)
);
create trigger plots_updated before update on plots
  for each row execute function set_updated_at();
create index plots_project_status_idx on plots (project_id, status);

create table project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  kind text not null check (kind in ('image', 'video', 'map')),
  url text not null,
  sort_order int not null default 0
);
create index project_media_project_idx on project_media (project_id);

create table payment_plans (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  deposit_percent numeric(5,2) not null check (deposit_percent between 0 and 100),
  months int not null check (months > 0)
);
create index payment_plans_project_idx on payment_plans (project_id);

-- CRM
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text not null unique,
  source lead_source not null default 'website',
  status lead_status not null default 'new',
  is_hot boolean not null default false,
  budget_max numeric(12,2),
  preferred_location text,
  assigned_to uuid references profiles(id) on delete set null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger leads_updated before update on leads
  for each row execute function set_updated_at();
create index leads_status_idx on leads (status);
create index leads_assigned_idx on leads (assigned_to);

create table lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  type text not null check (type in ('inquiry', 'note', 'status_change', 'call', 'whatsapp')),
  body text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index lead_activities_lead_idx on lead_activities (lead_id, created_at desc);

create table site_visits (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  project_id uuid not null references projects(id),
  visit_at timestamptz not null,
  status visit_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now()
);
create index site_visits_lead_idx on site_visits (lead_id);

-- Row Level Security
alter table profiles enable row level security;
alter table projects enable row level security;
alter table plots enable row level security;
alter table project_media enable row level security;
alter table payment_plans enable row level security;
alter table leads enable row level security;
alter table lead_activities enable row level security;
alter table site_visits enable row level security;

create policy "own profile" on profiles for select using (id = auth.uid());
create policy "admin reads profiles" on profiles for select using (is_admin());
create policy "admin manages profiles" on profiles for all using (is_admin()) with check (is_admin());

create policy "public reads published projects" on projects for select using (is_published);
create policy "staff reads projects" on projects for select using (is_staff());
create policy "admin writes projects" on projects for all using (is_admin()) with check (is_admin());

create policy "public reads available plots" on plots for select using (
  status = 'available' and exists (select 1 from projects p where p.id = project_id and p.is_published)
);
create policy "staff reads plots" on plots for select using (is_staff());
create policy "admin writes plots" on plots for all using (is_admin()) with check (is_admin());

create policy "public reads media" on project_media for select using (
  exists (select 1 from projects p where p.id = project_id and p.is_published)
);
create policy "staff reads media" on project_media for select using (is_staff());
create policy "admin writes media" on project_media for all using (is_admin()) with check (is_admin());

create policy "public reads plans" on payment_plans for select using (
  exists (select 1 from projects p where p.id = project_id and p.is_published)
);
create policy "staff reads plans" on payment_plans for select using (is_staff());
create policy "admin writes plans" on payment_plans for all using (is_admin()) with check (is_admin());

-- CRM: staff only. Public lead capture goes through a server route using the service role.
create policy "staff manage leads" on leads for all using (is_staff()) with check (is_staff());
create policy "staff manage activities" on lead_activities for all using (is_staff()) with check (is_staff());
create policy "staff manage visits" on site_visits for all using (is_staff()) with check (is_staff());