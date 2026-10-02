insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-media',
  'project-media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "staff reads project media objects"
on storage.objects for select to authenticated
using (bucket_id = 'project-media' and public.is_staff());

create policy "admins upload project media objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'project-media' and public.is_admin());

create policy "admins update project media objects"
on storage.objects for update to authenticated
using (bucket_id = 'project-media' and public.is_admin())
with check (bucket_id = 'project-media' and public.is_admin());

create policy "admins delete project media objects"
on storage.objects for delete to authenticated
using (bucket_id = 'project-media' and public.is_admin());