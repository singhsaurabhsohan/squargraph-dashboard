import React, { useState, useEffect } from 'react';
import {
  Section,
  Website,
  Workspace,
  ProviderConnection,
  AuditEvent,
  DraftChange,
  WebsiteType,
} from './types';
import { NavigationRail } from './components/NavigationRail';
import { WorkspaceView } from './components/WorkspaceView';
import { WebsitesView } from './components/WebsitesView';
import { IntegrationsView } from './components/IntegrationsView';
import { ActivityView } from './components/ActivityView';
import { PublishModal } from './components/PublishModal';
import { WorkspaceModal } from './components/WorkspaceModal';
import { ConnectSiteModal } from './components/ConnectSiteModal';
import { ShieldCheck, ShieldAlert, ArrowUpRight, GitBranch } from 'lucide-react';

const initialSections: Section[] = [
  {
    id: 'hero-title',
    label: 'Hero headline',
    kind: 'Copy',
    value: 'Perception leaves clues. We follow them.',
    originalValue: 'Perception leaves clues. We follow them.',
    note: 'Home / hero',
    sourcePath: 'src/components/Hero.tsx:L18',
    selector: 'h1.hero-title',
  },
  {
    id: 'hero-cta',
    label: 'Primary call to action',
    kind: 'Link',
    value: 'https://squargraph.com/discovery.html',
    originalValue: 'https://squargraph.com/discovery.html',
    note: 'Home / hero CTA',
    sourcePath: 'src/components/Hero.tsx:L32',
    selector: 'a.primary-cta',
  },
  {
    id: 'brand-color',
    label: 'Primary Brand Color',
    kind: 'Style',
    value: '#e8ff75',
    originalValue: '#e8ff75',
    note: 'Design Tokens / CSS Variable --brand-accent',
    sourcePath: 'src/styles/tokens.css:--brand-accent',
    selector: ':root',
  },
  {
    id: 'header-nav',
    label: 'Header Navigation Menu',
    kind: 'Navigation',
    value: 'Work | Services | Philosophy | Journal | Contact',
    originalValue: 'Work | Services | Philosophy | Journal | Contact',
    note: 'Header / Desktop & Mobile Menu',
    sourcePath: 'src/components/NavigationRail.tsx:L24',
    selector: 'header nav',
  },
  {
    id: 'hero-image',
    label: 'Hero visual',
    kind: 'Image',
    value: 'film1.webp',
    originalValue: 'film1.webp',
    note: 'Home / hero asset',
    sourcePath: 'public/assets/film1.webp',
    selector: 'img.hero-visual',
  },
  {
    id: 'studio-copy',
    label: 'Studio introduction',
    kind: 'Copy',
    value:
      'Brand strategy, creative and digital systems built to align perception, communication and growth.',
    originalValue:
      'Brand strategy, creative and digital systems built to align perception, communication and growth.',
    note: 'Footer / studio',
    sourcePath: 'src/components/Intro.tsx:L14',
    selector: 'p.studio-intro',
  },
  {
    id: 'meta-title',
    label: 'Page title tag',
    kind: 'SEO',
    value: 'SQUARGRAPH — Brand strategy, creative and digital systems',
    originalValue: 'SQUARGRAPH — Brand strategy, creative and digital systems',
    note: 'Home / metadata',
    sourcePath: 'public/index.html:L6',
    selector: 'title',
  },
  {
    id: 'head-analytics',
    label: 'Analytics & Tracking Script',
    kind: 'Code',
    codeLanguage: 'html',
    value: '<script async src="https://www.googletagmanager.com/gtag/js?id=G-TRACK99"></script>',
    originalValue: '<script async src="https://www.googletagmanager.com/gtag/js?id=G-TRACK99"></script>',
    note: 'Document Head / Global Telemetry Script',
    sourcePath: 'public/index.html:<head>',
    selector: 'head script[src*="gtag"]',
  },
  {
    id: 'lead-webhook',
    label: 'Lead Capture Webhook Action',
    kind: 'Form',
    value: 'https://api.squargraph.com/v1/leads',
    originalValue: 'https://api.squargraph.com/v1/leads',
    note: 'Contact / Inbound Form Webhook Endpoint',
    sourcePath: 'src/components/ContactForm.tsx:action',
    selector: 'form#contact-form',
  },
];

export default function App() {
  const [view, setView] = useState<'workspace' | 'sites' | 'integrations' | 'activity'>('workspace');
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [selectedId, setSelectedId] = useState<string>(initialSections[0].id);
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string>('');

  // Multi-tenancy & Workspace
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 'ws-squargraph',
      name: 'SQUARGRAPH Studio',
      slug: 'squargraph-studio',
      currentRole: 'owner',
      members: [
        { id: 'm-1', name: 'Saurabh Singh', email: 'saurabh@squargraph.com', role: 'owner', avatar: 'SS' },
        { id: 'm-2', name: 'Priya Verma', email: 'priya@squargraph.com', role: 'reviewer', avatar: 'PV' },
        { id: 'm-3', name: 'Dev Team Lead', email: 'eng@squargraph.com', role: 'editor', avatar: 'DT' },
      ],
    },
    {
      id: 'ws-client-portfolio',
      name: 'Enterprise Client Portfolio',
      slug: 'client-portfolio',
      currentRole: 'admin',
      members: [
        { id: 'm-1', name: 'Saurabh Singh', email: 'saurabh@squargraph.com', role: 'admin', avatar: 'SS' },
        { id: 'm-4', name: 'Client Director', email: 'director@northstarbrand.in', role: 'reviewer', avatar: 'CD' },
      ],
    },
  ]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>('ws-squargraph');

  // Websites
  const [websites, setWebsites] = useState<Website[]>([
    {
      id: 'site-squargraph',
      name: 'SQUARGRAPH',
      url: 'squargraph.com',
      state: 'Connected',
      color: '#e8ff75',
      type: 'Static / Custom Code',
      environment: 'production',
      connections: {
        sourceProviderId: 'github',
        sourceRepo: 'singhsaurabhsohan/squargraph-site',
        sourceBranch: 'main',
        deployProviderId: 'cloudflare',
        deployProject: 'squargraph-worker-edge',
      },
      lastScanAt: 'Just now',
      detectedStack: ['Vite', 'TypeScript', 'Cloudflare Worker', 'Tailwind CSS'],
    },
    {
      id: 'site-squargraph-os',
      name: 'SQUARGRAPH OS',
      url: 'os.squargraph.com',
      state: 'Connected',
      color: '#e8ff75',
      type: 'Full-Stack Web App',
      environment: 'production',
      connections: {
        sourceProviderId: 'github',
        sourceRepo: 'singhsaurabhsohan/SQUARGRAPH-OS',
        sourceBranch: 'main',
        deployProviderId: 'cloudflare',
        deployProject: 'squargraph-os-edge',
      },
      lastScanAt: 'Just now',
      detectedStack: ['React', 'TypeScript', 'Node.js', 'Vite', 'Tailwind CSS'],
    },
    {
      id: 'site-northstar',
      name: 'NORTHSTAR',
      url: 'northstarbrand.in',
      state: 'Needs connection',
      color: '#c0d7ff',
      type: 'Headless CMS',
      environment: 'staging',
      connections: {
        cmsProviderId: 'sanity',
      },
      lastScanAt: '2 hours ago',
      detectedStack: ['Next.js', 'Sanity CMS', 'Vercel'],
    },
  ]);
  const [currentWebsite, setCurrentWebsite] = useState<Website>(websites[0]);

  // Integrations
  const [integrations, setIntegrations] = useState<ProviderConnection[]>([
    {
      id: 'int-source',
      name: 'Source & Delivery',
      category: 'Source & delivery',
      providers: ['GitHub', 'GitLab', 'Bitbucket', 'Cloudflare', 'Vercel', 'Netlify'],
      purpose: 'Read source, create commits, deploy previews and roll back safely.',
      status: 'connected',
      connectedProvider: 'GitHub App + Cloudflare',
      repoOrAccount: 'squargraph/studio-web',
      scopes: ['repo:status', 'contents:write', 'pull_requests:write', 'deployments:write'],
      lastVerified: '5 mins ago',
      isEncrypted: true,
    },
    {
      id: 'int-data',
      name: 'Data & Content',
      category: 'Data & content',
      providers: ['Supabase', 'Firebase', 'Sanity', 'Contentful', 'Strapi', 'WordPress'],
      purpose: 'Manage forms, collections, customers, content and app data.',
      status: 'connected',
      connectedProvider: 'Supabase Postgres',
      repoOrAccount: 'db.squargraph-core',
      scopes: ['tenancy:read', 'audit:write', 'rls:enforced'],
      lastVerified: '12 mins ago',
      isEncrypted: true,
    },
    {
      id: 'int-comm',
      name: 'Communication',
      category: 'Communication',
      providers: ['Twilio', 'WhatsApp', 'Resend', 'SendGrid', 'Slack'],
      purpose: 'Route approvals, alerts, email, SMS and WhatsApp notifications.',
      status: 'needs_auth',
      isEncrypted: true,
    },
    {
      id: 'int-commerce',
      name: 'Commerce',
      category: 'Commerce',
      providers: ['Razorpay', 'Stripe', 'Shopify', 'WooCommerce'],
      purpose: 'Update payment links, product information and conversion flows.',
      status: 'needs_auth',
      isEncrypted: true,
    },
    {
      id: 'int-ops',
      name: 'Operations & Insights',
      category: 'Operations & insights',
      providers: ['Shiprocket', 'Google Analytics', 'Search Console', 'Meta Pixel'],
      purpose: 'Track fulfilment, conversion performance and technical signals.',
      status: 'needs_auth',
      isEncrypted: true,
    },
  ]);

  // Audit Events
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: 'aud-01',
      eventType: 'pr_created',
      title: 'Discovery CTA display fix',
      description: 'GitHub PR #38 merged to main. Cloudflare Worker edge preview promoted.',
      websiteName: 'SQUARGRAPH',
      actor: 'Saurabh Singh (Owner)',
      timestamp: 'Today',
      status: 'Live',
      rollbackAvailable: true,
      publishJobId: 'job-1001',
    },
    {
      id: 'aud-02',
      eventType: 'scan',
      title: 'Automated structure discovery',
      description: 'Scanned 5 editable sections (Copy, Link, Image, SEO) across landing DOM.',
      websiteName: 'SQUARGRAPH',
      actor: 'System Scanner (SSRF Safe)',
      timestamp: 'Today',
      status: 'Ready',
      rollbackAvailable: false,
    },
    {
      id: 'aud-03',
      eventType: 'provider_connect',
      title: 'GitHub App OAuth & Cloudflare Adapter verified',
      description: 'Scoped write permissions confirmed for squargraph/studio-web repository.',
      websiteName: 'SQUARGRAPH',
      actor: 'Saurabh Singh',
      timestamp: 'Yesterday',
      status: 'Verified',
      rollbackAvailable: false,
    },
    {
      id: 'aud-04',
      eventType: 'workspace_switch',
      title: 'Workspace initialized',
      description: 'Tenancy established with Role-Based Access Control and encrypted secrets vault.',
      websiteName: 'Site Control',
      actor: 'System',
      timestamp: 'Yesterday',
      status: 'Ready',
      rollbackAvailable: false,
    },
  ]);

  // Modals
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState<boolean>(false);
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false);

  // Sync initial state with server on mount
  useEffect(() => {
    fetch('/api/workspaces')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.workspaces) {
          setWorkspaces(data.workspaces);
          if (data.currentWorkspaceId) setCurrentWorkspaceId(data.currentWorkspaceId);
        }
      })
      .catch(() => {});

    fetch('/api/websites')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setWebsites(data);
          setCurrentWebsite(data[0]);
        }
      })
      .catch(() => {});

    fetch('/api/audit')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAuditEvents(data);
      })
      .catch(() => {});
  }, []);

  const activeWorkspace =
    workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];

  // Scan URL Handler (Real Server Scanner with SSRF Safety)
  const handleScanUrl = async (url: string) => {
    setScanLoading(true);
    setNotice('');
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || 'Scan failed: unable to read website structure.');
        return;
      }

      if (data.sections && data.sections.length > 0) {
        setSections(data.sections);
        setSelectedId(data.sections[0].id);
      }

      // Update current website URL
      const cleanUrl = (data.scannedUrl || url).replace(/^https?:\/\//, '').replace(/\/$/, '');
      const matched = websites.find((w) => w.url.toLowerCase() === cleanUrl.toLowerCase());
      if (matched) {
        setCurrentWebsite(matched);
      } else {
        const tempSite: Website = {
          id: `site-${Date.now()}`,
          name: (data.hostname || cleanUrl).toUpperCase(),
          url: cleanUrl,
          state: 'Needs connection',
          color: '#d6c8e8',
          type: 'Static / Custom Code',
          environment: 'production',
          connections: {},
          lastScanAt: 'Just now',
        };
        setWebsites((prev) => [tempSite, ...prev]);
        setCurrentWebsite(tempSite);
      }

      setNotice(data.notice || 'Scan complete — editable sections are ready.');
    } catch (err: any) {
      setNotice('Server scanner error. Please verify the URL and retry.');
    } finally {
      setScanLoading(false);
    }
  };

  // Update Section Value
  const handleUpdateSectionValue = (id: string, value: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value } : s))
    );
  };

  // Reset Section Value
  const handleResetSectionValue = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, value: s.originalValue } : s))
    );
    setNotice('Section reverted to scanned baseline.');
  };

  // Add Custom Section to Workspace
  const handleAddSection = (newSection: Section) => {
    setSections((prev) => [newSection, ...prev]);
    setSelectedId(newSection.id);
    setNotice(`Custom element "${newSection.label}" added to ${currentWebsite.name}.`);
  };

  // Delete Section from Workspace
  const handleDeleteSection = (id: string) => {
    setSections((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (selectedId === id && filtered.length > 0) {
        setSelectedId(filtered[0].id);
      }
      return filtered;
    });
    setNotice('Element removed from workspace inventory.');
  };

  // Switch Website and optionally scan its DOM
  const handleSelectWebsite = (site: Website) => {
    setCurrentWebsite(site);
    handleScanUrl(`https://${site.url}`);
    setNotice(`Active site switched to ${site.name} (${site.type}).`);
  };

  // Save Draft
  const handleSaveDraft = () => {
    setNotice('Edit saved to this publishing draft.');
  };

  // Publish changes action
  const handlePublishClick = () => {
    // Deliberate safety gate: check repository connection
    const isRepoConnected =
      currentWebsite.state === 'Connected' && !!currentWebsite.connections.sourceRepo;

    if (!isRepoConnected) {
      setNotice(
        'Connect this website’s repository before publishing. Once connected, Publish creates a reviewable commit automatically.'
      );
      setShowPublishModal(true);
      return;
    }

    setShowPublishModal(true);
  };

  // Confirm Publish API Call
  const handleConfirmPublish = async (details: {
    prTitle: string;
    prDescription: string;
    reviewer: string;
    changes: DraftChange[];
  }) => {
    const res = await fetch('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        websiteUrl: currentWebsite.url,
        ...details,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Publish failed');
    }

    // Refresh audit events
    fetch('/api/audit')
      .then((r) => r.json())
      .then((aud) => setAuditEvents(aud));

    setNotice(`Reviewable Pull Request #${data.job.prNumber} opened in ${currentWebsite.connections.sourceRepo}!`);
    return data;
  };

  // Execute Rollback
  const handleExecuteRollback = async (publishJobId?: string) => {
    const res = await fetch('/api/rollback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publishJobId }),
    });

    const data = await res.json();
    if (res.ok) {
      setNotice(data.message || 'Rollback executed. Deployed previous healthy revision.');
      fetch('/api/audit')
        .then((r) => r.json())
        .then((aud) => setAuditEvents(aud));
    } else {
      setNotice(data.error || 'Rollback failed.');
    }
  };

  // Add Website
  const handleAddWebsite = async (siteData: {
    name: string;
    url: string;
    type: WebsiteType;
    environment: 'production' | 'staging' | 'preview';
    sourceRepo?: string;
  }) => {
    const res = await fetch('/api/websites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(siteData),
    });

    if (res.ok) {
      const created = await res.json();
      setWebsites((prev) => [...prev, created]);
      setCurrentWebsite(created);
      setView('workspace');
      setNotice(`Website ${created.name} registered. Scanning baseline DOM…`);
      handleScanUrl(`https://${created.url}`);
    }
  };

  // Connect Provider
  const handleConnectProvider = async (category: string, provider: string, repoOrAccount: string) => {
    const res = await fetch('/api/integrations/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, provider, repoOrAccount }),
    });

    if (res.ok) {
      const data = await res.json();
      setIntegrations((prev) =>
        prev.map((i) => (i.category === category ? data.updated : i))
      );

      // If GitHub was mapped, update current website connection state
      if (category === 'Source & delivery') {
        setCurrentWebsite((prev) => ({
          ...prev,
          state: 'Connected',
          connections: {
            ...prev.connections,
            sourceProviderId: 'github',
            sourceRepo: repoOrAccount,
            sourceBranch: 'main',
          },
        }));
      }

      setNotice(`${provider} authorized successfully for ${repoOrAccount}. Token stored securely in vault.`);
      fetch('/api/audit')
        .then((r) => r.json())
        .then((aud) => setAuditEvents(aud));
    }
  };

  // Test Ping Connection (Universal 25-Provider Support)
  const handleTestPing = async (provider: string, target?: string) => {
    const res = await fetch('/api/integrations/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, target }),
    });
    return res.json();
  };

  // Switch Workspace
  const handleSwitchWorkspace = async (workspaceId: string) => {
    const res = await fetch('/api/workspaces/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId }),
    });

    if (res.ok) {
      setCurrentWorkspaceId(workspaceId);
      const found = workspaces.find((w) => w.id === workspaceId);
      setNotice(`Active workspace switched to ${found?.name}. Scoped credentials reloaded.`);
    }
  };

  const isRepoConnected =
    currentWebsite.state === 'Connected' && !!currentWebsite.connections.sourceRepo;

  return (
    <main className="control-room" id="squargraph-site-control-root">
      {/* 1. Left Nav Rail */}
      <NavigationRail
        currentView={view}
        onSelectView={setView}
        activeWorkspace={activeWorkspace}
        onOpenWorkspaceModal={() => setShowWorkspaceModal(true)}
      />

      {/* 2. Main Shell */}
      <section className="shell" id="main-content-shell">
        <header className="topbar" id="shell-topbar">
          <div>
            <p>WORKSPACE / {activeWorkspace.name.toUpperCase()}</p>
            <h1>
              {view === 'workspace'
                ? 'Website control room'
                : view === 'sites'
                ? 'Your websites'
                : view === 'integrations'
                ? 'Integration hub'
                : 'Publishing activity'}
            </h1>
          </div>

          <div className="topbar-actions">
            {/* Safety Gate status badge (clickable to open connection hub) */}
            <div
              className={`safety-badge ${isRepoConnected ? 'connected' : ''} cursor-pointer`}
              onClick={() => setShowConnectModal(true)}
              title="Click to view or switch GitHub repository & live connection"
            >
              <i />
              <span>
                {isRepoConnected
                  ? `Repo: ${currentWebsite.connections.sourceRepo}`
                  : 'Repo Not Connected'}
              </span>
            </div>

            {/* Direct Connect Hub Trigger */}
            <button
              className="py-1.5 px-3 bg-[#10120f] hover:bg-black text-[#e8ff75] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors shadow-xs"
              onClick={() => setShowConnectModal(true)}
              id="topbar-connect-site-btn"
              title="Connect GitHub Token & squargraph.com"
            >
              <GitBranch size={13} />
              Connect squargraph.com ↗
            </button>

            <button className="publish" onClick={handlePublishClick} id="topbar-publish-btn">
              Publish changes <span>↗</span>
            </button>
          </div>
        </header>

        {/* 3. View Switcher */}
        {view === 'workspace' && (
          <WorkspaceView
            currentWebsite={currentWebsite}
            websites={websites}
            onSelectWebsite={handleSelectWebsite}
            sections={sections}
            selectedId={selectedId}
            onSelectSection={setSelectedId}
            onUpdateSectionValue={handleUpdateSectionValue}
            onResetSectionValue={handleResetSectionValue}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onScanUrl={handleScanUrl}
            scanLoading={scanLoading}
            scanNotice={notice}
            onOpenPublishModal={handlePublishClick}
            onSaveDraft={handleSaveDraft}
          />
        )}

        {view === 'sites' && (
          <WebsitesView
            websites={websites}
            onSelectWebsite={(site) => {
              handleSelectWebsite(site);
              setView('workspace');
            }}
            onAddWebsite={handleAddWebsite}
            onOpenConnectRepo={(site) => {
              setCurrentWebsite(site);
              setView('integrations');
            }}
          />
        )}

        {view === 'integrations' && (
          <IntegrationsView
            integrations={integrations}
            onConnectProvider={handleConnectProvider}
            onTestPing={handleTestPing}
          />
        )}

        {view === 'activity' && (
          <ActivityView
            auditEvents={auditEvents}
            onExecuteRollback={handleExecuteRollback}
          />
        )}
      </section>

      {/* 4. Publish & Review Pull Request Modal */}
      {showPublishModal && (
        <PublishModal
          website={currentWebsite}
          sections={sections}
          onClose={() => setShowPublishModal(false)}
          onConfirmPublish={handleConfirmPublish}
          onNavigateToIntegrations={() => setView('integrations')}
        />
      )}

      {/* 5. Workspace Tenancy Modal */}
      {showWorkspaceModal && (
        <WorkspaceModal
          workspaces={workspaces}
          currentWorkspaceId={currentWorkspaceId}
          onSwitchWorkspace={handleSwitchWorkspace}
          onClose={() => setShowWorkspaceModal(false)}
        />
      )}

      {/* 5b. Live Site Connection Modal */}
      {showConnectModal && (
        <ConnectSiteModal
          currentWebsite={currentWebsite}
          onClose={() => setShowConnectModal(false)}
          onRepoConnected={(newRepo) => {
            setCurrentWebsite((prev) => ({
              ...prev,
              state: 'Connected',
              connections: {
                ...prev.connections,
                sourceRepo: newRepo,
              },
            }));
            setWebsites((prev) =>
              prev.map((w) =>
                w.id === currentWebsite.id
                  ? { ...w, state: 'Connected', connections: { ...w.connections, sourceRepo: newRepo } }
                  : w
              )
            );
            setNotice(`Connected to GitHub repository ${newRepo}`);
          }}
        />
      )}

      {/* 6. Notification Toast */}
      {notice && (
        <div className="toast" role="status" id="app-notification-toast">
          {notice}
          <button aria-label="Close notice" onClick={() => setNotice('')}>
            ×
          </button>
        </div>
      )}
    </main>
  );
}
