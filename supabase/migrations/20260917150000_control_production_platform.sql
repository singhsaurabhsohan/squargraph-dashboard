create table if not exists public.control_provider_connections (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.control_workspaces(id) on delete cascade,
  provider text not null, category text not null, account_ref text, display_name text, status text not null default 'needs_auth' check (status in ('needs_auth','connected','error','revoked','pending')),
  scopes text[] default '{}', vault_secret_id uuid, oauth_expires_at timestamptz, last_verified_at timestamptz, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id, provider, account_ref)
);
create table if not exists public.control_jobs (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.control_workspaces(id) on delete cascade,
  website_id uuid references public.control_websites(id) on delete set null, job_type text not null, status text not null default 'queued' check (status in ('queued','running','succeeded','failed','cancelled')),
  provider text, requested_by uuid references auth.users(id) on delete set null, input jsonb not null default '{}'::jsonb, output jsonb not null default '{}'::jsonb, error text,
  progress integer not null default 0 check (progress between 0 and 100), started_at timestamptz, finished_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.control_assets (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.control_workspaces(id) on delete cascade,
  website_id uuid references public.control_websites(id) on delete set null, name text not null, storage_path text not null, mime_type text not null, size_bytes bigint not null default 0, checksum text, width integer, height integer, duration_seconds numeric, status text not null default 'ready' check (status in ('uploading','ready','failed','deleted')),
  created_by uuid references auth.users(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.control_subscriptions (
  id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.control_organizations(id) on delete cascade,
  provider text not null default 'internal', external_customer_id text, external_subscription_id text, plan text not null default 'free', status text not null default 'active', seats integer not null default 1, current_period_end timestamptz, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider, external_subscription_id)
);
create index if not exists control_provider_connections_workspace_idx on public.control_provider_connections(workspace_id);
create index if not exists control_jobs_workspace_created_idx on public.control_jobs(workspace_id, created_at desc);
create index if not exists control_jobs_status_idx on public.control_jobs(status, created_at);
create index if not exists control_assets_workspace_idx on public.control_assets(workspace_id, created_at desc);

alter table public.control_provider_connections enable row level security;
alter table public.control_jobs enable row level security;
alter table public.control_assets enable row level security;
alter table public.control_subscriptions enable row level security;

create policy "control_provider_connections_member_select" on public.control_provider_connections for select using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_is_member(w.organization_id)));
create policy "control_provider_connections_admin_write" on public.control_provider_connections for all using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin']))) with check (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin'])));
create policy "control_jobs_member_select" on public.control_jobs for select using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_is_member(w.organization_id)));
create policy "control_jobs_editor_write" on public.control_jobs for all using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin','editor']))) with check (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin','editor'])));
create policy "control_assets_member_select" on public.control_assets for select using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_is_member(w.organization_id)));
create policy "control_assets_editor_write" on public.control_assets for all using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin','editor']))) with check (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin','editor'])));
create policy "control_subscriptions_member_select" on public.control_subscriptions for select using (public.control_is_member(organization_id));

create or replace function public.control_touch_updated_at() returns trigger language plpgsql security invoker set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists control_provider_connections_touch on public.control_provider_connections;
create trigger control_provider_connections_touch before update on public.control_provider_connections for each row execute function public.control_touch_updated_at();
drop trigger if exists control_jobs_touch on public.control_jobs;
create trigger control_jobs_touch before update on public.control_jobs for each row execute function public.control_touch_updated_at();
drop trigger if exists control_assets_touch on public.control_assets;
create trigger control_assets_touch before update on public.control_assets for each row execute function public.control_touch_updated_at();
drop trigger if exists control_subscriptions_touch on public.control_subscriptions;
create trigger control_subscriptions_touch before update on public.control_subscriptions for each row execute function public.control_touch_updated_at();

alter table public.control_jobs replica identity full;
alter table public.control_activity replica identity full;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('control-assets','control-assets',false,524288000,array['image/*','video/*','audio/*','application/pdf','text/*','application/zip']) on conflict (id) do update set public=false, file_size_limit=524288000, allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "control_assets_storage_select" on storage.objects;
create policy "control_assets_storage_select" on storage.objects for select to authenticated using (bucket_id='control-assets' and exists (select 1 from public.control_workspaces w where w.id::text = (storage.foldername(name))[1] and public.control_is_member(w.organization_id)));
drop policy if exists "control_assets_storage_insert" on storage.objects;
create policy "control_assets_storage_insert" on storage.objects for insert to authenticated with check (bucket_id='control-assets' and exists (select 1 from public.control_workspaces w where w.id::text = (storage.foldername(name))[1] and public.control_has_role(w.organization_id, array['owner','admin','editor'])));
drop policy if exists "control_assets_storage_delete" on storage.objects;
create policy "control_assets_storage_delete" on storage.objects for delete to authenticated using (bucket_id='control-assets' and exists (select 1 from public.control_workspaces w where w.id::text = (storage.foldername(name))[1] and public.control_has_role(w.organization_id, array['owner','admin','editor'])));

do $$ begin
  begin alter publication supabase_realtime add table public.control_websites; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.control_integrations; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.control_activity; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.control_jobs; exception when duplicate_object then null; end;
end $$;