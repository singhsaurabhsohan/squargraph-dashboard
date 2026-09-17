create table if not exists public.control_websites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.control_workspaces(id) on delete cascade,
  name text not null,
  url text not null,
  state text not null default 'Needs connection' check (state in ('Connected','Needs connection','Configuring')),
  color text not null default '#e8ff75',
  type text not null default 'Static / Custom Code',
  environment text not null default 'production' check (environment in ('production','staging','preview')),
  connections jsonb not null default '{}'::jsonb,
  last_scan_at timestamptz,
  detected_stack text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.control_integrations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.control_workspaces(id) on delete cascade,
  name text not null,
  category text not null,
  providers text[] not null default '{}',
  purpose text not null default '',
  status text not null default 'needs_auth' check (status in ('connected','needs_auth','pending')),
  connected_provider text,
  account_ref text,
  scopes text[] not null default '{}',
  last_verified_at timestamptz,
  is_encrypted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workspace_id, name)
);

create table if not exists public.control_activity (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.control_workspaces(id) on delete cascade,
  website_id uuid references public.control_websites(id) on delete set null,
  event_type text not null,
  title text not null,
  description text not null default '',
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_name text,
  status text not null default 'Ready' check (status in ('Live','Ready','Pending','Rolled back','Verified')),
  rollback_available boolean not null default false,
  publish_job_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists control_websites_workspace_idx on public.control_websites(workspace_id);
create index if not exists control_integrations_workspace_idx on public.control_integrations(workspace_id);
create index if not exists control_activity_workspace_created_idx on public.control_activity(workspace_id, created_at desc);

alter table public.control_websites enable row level security;
alter table public.control_integrations enable row level security;
alter table public.control_activity enable row level security;

create policy control_websites_member_select on public.control_websites for select to authenticated using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_is_member(w.organization_id)));
create policy control_websites_editor_write on public.control_websites for all to authenticated using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin','editor']))) with check (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin','editor'])));

create policy control_integrations_member_select on public.control_integrations for select to authenticated using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_is_member(w.organization_id)));
create policy control_integrations_admin_write on public.control_integrations for all to authenticated using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin']))) with check (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_has_role(w.organization_id, array['owner','admin'])));

create policy control_activity_member_select on public.control_activity for select to authenticated using (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_is_member(w.organization_id)));
create policy control_activity_member_insert on public.control_activity for insert to authenticated with check (exists (select 1 from public.control_workspaces w where w.id = workspace_id and public.control_is_member(w.organization_id)));
