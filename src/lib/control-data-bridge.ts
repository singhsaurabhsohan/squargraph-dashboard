import { supabase } from './supabase';

const STORAGE_KEY = 'sqg-control-workspace-id';
const CONTROL_SUPABASE_URL = 'https://htuswsvgobgpurnbmjkk.supabase.co';

const integrationDefaults = [
  { name: 'Source & Delivery', category: 'Source & delivery', providers: ['GitHub', 'GitLab', 'Bitbucket', 'Cloudflare', 'Vercel', 'Netlify'], purpose: 'Read source, create commits, deploy previews and roll back safely.' },
  { name: 'Data & Content', category: 'Data & content', providers: ['Supabase', 'Firebase', 'Sanity', 'Contentful', 'Strapi', 'WordPress'], purpose: 'Manage forms, collections, customers, content and app data.' },
  { name: 'Communication', category: 'Communication', providers: ['Twilio', 'WhatsApp', 'Resend', 'SendGrid', 'Slack'], purpose: 'Route approvals, alerts, email, SMS and WhatsApp notifications.' },
  { name: 'Commerce', category: 'Commerce', providers: ['Razorpay', 'Stripe', 'Shopify', 'WooCommerce'], purpose: 'Update payment links, product information and conversion flows.' },
  { name: 'Operations & Insights', category: 'Operations & insights', providers: ['Shiprocket', 'Google Analytics', 'Search Console', 'Meta Pixel'], purpose: 'Track fulfilment, conversion performance and technical signals.' },
];

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

async function context() {
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return null;

  const { data: memberships, error } = await supabase
    .from('control_memberships')
    .select('organization_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active');
  if (error) throw error;

  let organizationId = memberships?.[0]?.organization_id as string | undefined;
  let role = memberships?.[0]?.role ?? 'owner';

  if (!organizationId) {
    const company = String(user.user_metadata?.company || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Client').trim().slice(0, 120) || 'Client';
    const slug = `${company.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70) || 'client'}-${user.id.slice(0, 8)}`;
    const { data, error: createError } = await supabase.rpc('control_create_organization', { org_name: company, org_slug: slug });
    if (createError) throw createError;
    organizationId = data?.organization_id;
    if (!organizationId) throw new Error('Unable to create the client organization');
    role = 'owner';
  }

  const { data: workspaces, error: workspaceError } = await supabase
    .from('control_workspaces')
    .select('id, name, slug, organization_id')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: true });
  if (workspaceError) throw workspaceError;

  let workspace = workspaces?.find((w) => w.id === localStorage.getItem(STORAGE_KEY)) ?? workspaces?.[0];
  if (!workspace) {
    const { data, error: insertError } = await supabase
      .from('control_workspaces')
      .insert({ organization_id: organizationId, name: 'Default Workspace', slug: `default-${user.id.slice(0, 8)}` })
      .select('id, name, slug, organization_id')
      .single();
    if (insertError) throw insertError;
    workspace = data;
  }

  localStorage.setItem(STORAGE_KEY, workspace.id);
  return { user, organizationId, role, workspaces: workspaces?.length ? workspaces : [workspace], workspace };
}

async function workspaceResponse() {
  const ctx = await context();
  if (!ctx || !supabase) return response({ currentWorkspaceId: null, workspaces: [] }, 401);

  const { data: members } = await supabase
    .from('control_memberships')
    .select('organization_id, user_id, role')
    .eq('organization_id', ctx.organizationId);
  const ids = [...new Set((members ?? []).map((m) => m.user_id))];
  const { data: profiles } = ids.length
    ? await supabase.from('control_profiles').select('user_id, full_name').in('user_id', ids)
    : { data: [] as Array<{ user_id: string; full_name: string | null }> };
  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return response({
    currentWorkspaceId: ctx.workspace.id,
    workspaces: ctx.workspaces.map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      currentRole: ctx.role,
      members: (members ?? []).map((m) => {
        const p = profileMap.get(m.user_id);
        const email = m.user_id === ctx.user.id ? (ctx.user.email ?? '') : '';
        const name = p?.full_name || email || 'Workspace member';
        return { id: m.user_id, name, email, role: m.role, avatar: name.split(/\s+/).map((x: string) => x[0]).join('').slice(0, 2).toUpperCase() };
      }),
    })),
  });
}

async function seedIntegrations(workspaceId: string) {
  if (!supabase) return;
  const { count } = await supabase.from('control_integrations').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId);
  if ((count ?? 0) > 0) return;
  await supabase.from('control_integrations').insert(integrationDefaults.map((item) => ({ ...item, workspace_id: workspaceId, status: 'needs_auth', is_encrypted: false })));
}

function subscribeToWorkspaceRealtime(workspaceId: string) {
  if (!supabase || (window as Window & { __sqgRealtime?: boolean }).__sqgRealtime) return;
  const channel = supabase
    .channel(`control-workspace-${workspaceId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'control_websites', filter: `workspace_id=eq.${workspaceId}` }, () => window.dispatchEvent(new CustomEvent('sqg-control-data-changed', { detail: { resource: 'websites' } })))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'control_integrations', filter: `workspace_id=eq.${workspaceId}` }, () => window.dispatchEvent(new CustomEvent('sqg-control-data-changed', { detail: { resource: 'integrations' } })))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'control_activity', filter: `workspace_id=eq.${workspaceId}` }, () => window.dispatchEvent(new CustomEvent('sqg-control-data-changed', { detail: { resource: 'activity' } })))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'control_jobs', filter: `workspace_id=eq.${workspaceId}` }, () => window.dispatchEvent(new CustomEvent('sqg-control-data-changed', { detail: { resource: 'jobs' } })))
    .subscribe();
  (window as Window & { __sqgRealtime?: boolean; __sqgRealtimeChannel?: unknown }).__sqgRealtime = true;
  (window as Window & { __sqgRealtimeChannel?: unknown }).__sqgRealtimeChannel = channel;
}

async function scanWebsite(websiteId: string) {
  const { data } = await supabase!.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return response({ error: 'Authentication required' }, 401);
  const result = await fetch(`${CONTROL_SUPABASE_URL}/functions/v1/control-jobs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'scan', websiteId }),
  });
  return result;
}

async function bridge(input: RequestInfo | URL, init?: RequestInit): Promise<Response | null> {
  if (!supabase) return null;
  const url = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.url;
  if (!url.startsWith('/api/')) return null;
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

  try {
    const ctx = await context();
    if (!ctx) return response({ error: 'Authentication required' }, 401);
    subscribeToWorkspaceRealtime(ctx.workspace.id);

    if (url === '/api/workspaces' && method === 'GET') return workspaceResponse();

    if (url === '/api/workspaces/switch' && method === 'POST') {
      const body = JSON.parse(String(init?.body || '{}'));
      const found = ctx.workspaces.find((w) => w.id === body.workspaceId);
      if (!found) return response({ error: 'Workspace not found' }, 404);
      localStorage.setItem(STORAGE_KEY, found.id);
      return response({ success: true, activeWorkspace: { id: found.id, name: found.name, slug: found.slug, currentRole: ctx.role, members: [] } });
    }

    if (url === '/api/websites' && method === 'GET') {
      const { data, error } = await supabase.from('control_websites').select('*').eq('workspace_id', ctx.workspace.id).order('created_at', { ascending: false });
      if (error) throw error;
      return response((data ?? []).map((s) => ({ id: s.id, name: s.name, url: s.url, state: s.state, color: s.color, type: s.type, environment: s.environment, connections: s.connections ?? {}, lastScanAt: s.last_scan_at ? new Date(s.last_scan_at).toLocaleString() : 'Never', detectedStack: s.detected_stack ?? [] })));
    }

    if (url === '/api/websites' && method === 'POST') {
      const body = JSON.parse(String(init?.body || '{}'));
      const cleanUrl = String(body.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (!body.name || !cleanUrl) return response({ error: 'Name and URL are required' }, 400);
      const { data, error } = await supabase.from('control_websites').insert({
        workspace_id: ctx.workspace.id,
        name: String(body.name).trim().toUpperCase(),
        url: cleanUrl,
        state: body.sourceRepo ? 'Connected' : 'Needs connection',
        color: '#e8ff75',
        type: body.type || 'Static / Custom Code',
        environment: body.environment || 'production',
        connections: { sourceProviderId: body.sourceRepo ? 'github' : undefined, sourceRepo: body.sourceRepo || undefined, sourceBranch: body.sourceRepo ? 'main' : undefined },
        detected_stack: [],
      }).select('*').single();
      if (error) throw error;
      return response({ id: data.id, name: data.name, url: data.url, state: data.state, color: data.color, type: data.type, environment: data.environment, connections: data.connections, lastScanAt: 'Never', detectedStack: [] }, 201);
    }

    if (url === '/api/websites/scan' && method === 'POST') {
      const body = JSON.parse(String(init?.body || '{}'));
      if (!body.websiteId) return response({ error: 'websiteId is required' }, 400);
      return scanWebsite(String(body.websiteId));
    }

    if (url === '/api/audit' && method === 'GET') {
      const { data, error } = await supabase.from('control_activity').select('*').eq('workspace_id', ctx.workspace.id).order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return response((data ?? []).map((e) => ({ id: e.id, eventType: e.event_type, title: e.title, description: e.description, websiteName: '', actor: e.actor_name || 'System', timestamp: new Date(e.created_at).toLocaleString(), status: e.status, rollbackAvailable: e.rollback_available, publishJobId: e.publish_job_id, meta: e.metadata })));
    }

    if (url === '/api/integrations' && method === 'GET') {
      await seedIntegrations(ctx.workspace.id);
      const { data, error } = await supabase.from('control_integrations').select('*').eq('workspace_id', ctx.workspace.id).order('created_at');
      if (error) throw error;
      return response((data ?? []).map((i) => ({ id: i.id, name: i.name, category: i.category, providers: i.providers, purpose: i.purpose, status: i.status, connectedProvider: i.connected_provider || undefined, repoOrAccount: i.account_ref || undefined, scopes: i.scopes, lastVerified: i.last_verified_at ? new Date(i.last_verified_at).toLocaleString() : undefined, isEncrypted: i.is_encrypted })));
    }
  } catch (error) {
    console.error('[control-data-bridge]', error);
    return response({ error: error instanceof Error ? error.message : 'Persistent data request failed' }, 500);
  }
  return null;
}

const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const bridged = await bridge(input, init);
  return bridged ?? originalFetch(input, init);
};
