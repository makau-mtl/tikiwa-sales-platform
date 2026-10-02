create table mutation_uploads (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  upload_date timestamptz not null default now(),
  processing_status text not null default 'uploaded'
    check (processing_status in ('uploaded', 'processing', 'review_required', 'reviewed', 'failed')),
  extracted_data_json jsonb,
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz
);

create index mutation_uploads_project_date_idx
  on mutation_uploads (project_id, upload_date desc);

alter table mutation_uploads enable row level security;

create policy "staff reads mutation uploads"
  on mutation_uploads for select using (is_staff());
create policy "admins manage mutation uploads"
  on mutation_uploads for all using (is_admin()) with check (is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mutation-documents',
  'mutation-documents',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "staff reads mutation documents"
  on storage.objects for select to authenticated
  using (bucket_id = 'mutation-documents' and public.is_staff());
create policy "admins upload mutation documents"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'mutation-documents' and public.is_admin());
create policy "admins delete mutation documents"
  on storage.objects for delete to authenticated
  using (bucket_id = 'mutation-documents' and public.is_admin());