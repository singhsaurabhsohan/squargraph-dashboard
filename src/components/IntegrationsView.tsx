import React, { useState } from 'react';
import { ProviderConnection } from '../types';
import {
  Check,
  Shield,
  Activity,
  RefreshCw,
  GitBranch,
  GitPullRequest,
  Database,
  Terminal,
  FileCode,
  Globe,
  Radio,
  ExternalLink,
  ChevronRight,
  Zap,
  Lock,
  Layers,
} from 'lucide-react';
import {
  defaultGitHubAdapter,
  defaultSupabaseAdapter,
  defaultWordPressAdapter,
  defaultShopifyAdapter,
  ECOSYSTEM_PROVIDERS,
  EcosystemProviderInfo,
} from '../lib/adapters';

interface IntegrationsViewProps {
  integrations: ProviderConnection[];
  onConnectProvider: (category: string, provider: string, repoOrAccount: string) => void;
  onTestPing: (provider: string, target?: string) => Promise<{ latencyMs: number; message: string; details?: any }>;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrations,
  onConnectProvider,
  onTestPing,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [activeGroup, setActiveGroup] = useState<ProviderConnection | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('GitHub');
  const [repoAccount, setRepoAccount] = useState<string>('');
  const [pingResult, setPingResult] = useState<{
    provider: string;
    latencyMs: number;
    message: string;
    category?: string;
    protocol?: string;
    details?: any;
  } | null>(null);
  const [pinging, setPinging] = useState(false);

  // Selected ecosystem provider info for quick test & inspection
  const [selectedEcosystemKey, setSelectedEcosystemKey] = useState<string>('GitHub');
  const activeEcosystemInfo: EcosystemProviderInfo =
    ECOSYSTEM_PROVIDERS[selectedEcosystemKey] || ECOSYSTEM_PROVIDERS['GitHub'];

  // Ecosystem action testing state
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [adapterLog, setAdapterLog] = useState<{
    title: string;
    provider: string;
    protocol: string;
    payload: any;
    timestamp: string;
  } | null>(null);

  const categories = [
    'All',
    'Source & delivery',
    'Data & content',
    'Communication',
    'Commerce',
    'Operations & insights',
  ];

  const handleOpenConnect = (group: ProviderConnection, defaultProvider?: string) => {
    setActiveGroup(group);
    const chosen = defaultProvider || group.providers[0];
    setSelectedProvider(chosen);
    const eco = ECOSYSTEM_PROVIDERS[chosen];
    setRepoAccount(
      group.repoOrAccount || (eco ? eco.defaultIdentifierPlaceholder : 'workspace-account')
    );
    setPingResult(null);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup) return;
    onConnectProvider(activeGroup.category, selectedProvider, repoAccount);
    setActiveGroup(null);
  };

  const handleRunPing = async (provider: string, target?: string) => {
    setPinging(true);
    try {
      const res = await onTestPing(provider, target);
      const eco = ECOSYSTEM_PROVIDERS[provider];
      setPingResult({
        provider,
        latencyMs: res.latencyMs,
        message: res.message,
        category: eco?.category,
        protocol: eco?.protocol,
        details: res.details,
      });
    } finally {
      setPinging(false);
    }
  };

  // Trigger Ecosystem Provider Action
  const handleTriggerEcosystemAction = async (info: EcosystemProviderInfo) => {
    setActionLoading(true);
    try {
      // Call server backend test endpoint
      const response = await fetch('/api/adapters/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ecosystem_action',
          provider: info.name,
          target: info.defaultIdentifierPlaceholder,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAdapterLog({
          title: `${info.name}: ${info.liveActionLabels.actionLabel}`,
          provider: info.name,
          protocol: info.protocol,
          payload: data.result,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else {
        // Client fallback execution
        const res = await info.triggerAction(info.defaultIdentifierPlaceholder);
        setAdapterLog({
          title: `${info.name}: ${info.liveActionLabels.actionLabel}`,
          provider: info.name,
          protocol: info.protocol,
          payload: res,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } catch (err) {
      const res = await info.triggerAction(info.defaultIdentifierPlaceholder);
      setAdapterLog({
        title: `${info.name}: ${info.liveActionLabels.actionLabel}`,
        provider: info.name,
        protocol: info.protocol,
        payload: res,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredIntegrations = integrations.filter(
    (g) => activeCategoryFilter === 'All' || g.category === activeCategoryFilter
  );

  return (
    <section className="integrations-view" id="integrations-hub-view">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <p className="eyebrow">INTEGRATION ECOSYSTEM & PLATFORM ADAPTERS</p>
          <h2>
            One control layer.
            <br />
            25 production services.
          </h2>
          <p className="integration-intro !mb-0 max-w-2xl">
            Site Control connects your repository, hosting, headless databases, communications, checkout engines, and analytics pipelines into a single unified publisher.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-lg self-start md:self-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`text-xs px-2.5 py-1 rounded transition-all font-medium ${
                activeCategoryFilter === cat
                  ? 'bg-[#10120f] text-[#e8ff75] shadow-xs'
                  : 'text-gray-600 hover:text-black hover:bg-gray-200'
              }`}
            >
              {cat === 'All' ? 'All 25 Providers' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ping / Diagnostic Result Banner */}
      {pingResult && (
        <div className="mb-6 p-4 bg-[#10120f] border border-gray-800 rounded-lg text-xs text-[#eeeee8] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#e8ff75] animate-ping" />
              <b className="text-[#e8ff75] font-mono text-sm">{pingResult.provider} Telemetry Verified</b>
              <span className="px-2 py-0.5 bg-gray-800 rounded text-[10px] font-mono text-gray-300">
                {pingResult.latencyMs}ms roundtrip
              </span>
              {pingResult.protocol && (
                <span className="text-[10px] text-gray-400 font-mono">
                  [{pingResult.protocol}]
                </span>
              )}
            </div>
            <p className="text-gray-300 text-xs">{pingResult.message}</p>
            {pingResult.details && (
              <pre className="text-[11px] font-mono bg-[#1a1c18] p-2 rounded text-[#e8ff75] overflow-x-auto max-h-36 mt-2">
                {JSON.stringify(pingResult.details, null, 2)}
              </pre>
            )}
          </div>
          <button
            onClick={() => setPingResult(null)}
            className="text-gray-400 hover:text-white font-semibold ml-4 text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Category Groups Matrix */}
      <div className="integration-grid" id="integrations-grid">
        {filteredIntegrations.map((group) => {
          const isConnected = group.status === 'connected';
          return (
            <article key={group.category} id={`integration-card-${group.id}`} className="flex flex-col justify-between">
              <div>
                <header>
                  <p>{group.category}</p>
                  <div className="flex items-center gap-2">
                    {isConnected && (
                      <button
                        onClick={() => handleRunPing(group.connectedProvider || group.providers[0])}
                        disabled={pinging}
                        className="!border-gray-300 hover:!border-black flex items-center gap-1 text-[11px]"
                        title="Test live provider API latency"
                      >
                        <RefreshCw size={9} className={pinging ? 'animate-spin' : ''} /> Ping
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenConnect(group)}
                      id={`connect-btn-${group.id}`}
                      className="text-[11px]"
                    >
                      {isConnected ? 'Configure ⚙' : 'Connect +'}
                    </button>
                  </div>
                </header>

                {/* Provider Chips */}
                <div className="flex flex-wrap gap-1.5 my-3">
                  {group.providers.map((provider) => {
                    const isThisConnected = group.connectedProvider?.includes(provider);
                    const isSelectedInTest = selectedEcosystemKey === provider;
                    return (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => {
                          setSelectedEcosystemKey(provider);
                          handleRunPing(provider);
                        }}
                        className={`text-xs px-2.5 py-1 rounded border transition-all cursor-pointer flex items-center gap-1 ${
                          isThisConnected
                            ? 'bg-[#eaf4d5] text-[#2b4c09] border-[#c1d994] font-bold'
                            : isSelectedInTest
                            ? 'bg-[#10120f] text-[#e8ff75] border-[#10120f]'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                        }`}
                        title={`Click to inspect ${provider} adapter and run latency ping`}
                      >
                        <span>{provider}</span>
                        {isThisConnected && <Check size={11} />}
                      </button>
                    );
                  })}
                </div>

                {isConnected && (
                  <div className="conn-status my-2">
                    <Check size={12} /> Connected: {group.connectedProvider} ({group.repoOrAccount})
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <small>{group.purpose}</small>
                <span className="font-mono text-[10px] text-gray-400">
                  {group.providers.length} supported
                </span>
              </div>
            </article>
          );
        })}
      </div>

      {/* INTERACTIVE ECOSYSTEM ADAPTER WORKBENCH */}
      <div className="mt-8 pt-8 border-t border-gray-200" id="adapter-runtime-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
          <div>
            <p className="eyebrow !text-gray-500">ECOSYSTEM ADAPTER WORKBENCH</p>
            <h3 className="text-xl font-bold text-[#10120f]">
              Active Protocol Inspector: {activeEcosystemInfo.name}
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 bg-[#10120f] text-[#e8ff75] rounded text-[11px] font-mono">
              {activeEcosystemInfo.category}
            </span>
            <span className="px-2.5 py-1 bg-[#eeeee8] border border-gray-300 rounded text-[11px] font-mono text-gray-700">
              {activeEcosystemInfo.protocol}
            </span>
          </div>
        </div>

        {/* Selected Provider Card & Interactive Actions */}
        <div className="p-5 bg-white border border-gray-200 rounded-lg shadow-xs mb-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-[#10120f]">{activeEcosystemInfo.name}</h4>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold rounded uppercase tracking-wider">
                  {activeEcosystemInfo.badge}
                </span>
              </div>
              <p className="text-xs text-gray-600 max-w-2xl">{activeEcosystemInfo.description}</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleRunPing(activeEcosystemInfo.name)}
                disabled={pinging}
                className="py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-[#10120f] text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
                id="btn-inspect-ping"
              >
                <Activity size={13} className={pinging ? 'animate-spin' : ''} />
                Ping API ({activeEcosystemInfo.typicalLatencyMs}ms)
              </button>

              <button
                type="button"
                onClick={() => handleTriggerEcosystemAction(activeEcosystemInfo)}
                disabled={actionLoading}
                className="py-1.5 px-3 bg-[#10120f] hover:bg-black text-[#e8ff75] text-xs font-semibold rounded flex items-center gap-1.5 shadow-xs transition-colors"
                id="btn-trigger-action"
              >
                <Zap size={13} />
                {actionLoading ? 'Executing…' : activeEcosystemInfo.liveActionLabels.actionLabel}
              </button>
            </div>
          </div>

          {/* Scopes & Identifier details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded border border-gray-200 text-xs font-mono">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Target Endpoint / Identifier</span>
              <span className="text-gray-800 font-semibold">{activeEcosystemInfo.defaultIdentifierPlaceholder}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Default Least-Privilege Scopes</span>
              <span className="text-gray-800">{activeEcosystemInfo.defaultScopes.join(', ')}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase">Protocol Spec</span>
              <span className="text-gray-800">{activeEcosystemInfo.protocol}</span>
            </div>
          </div>
        </div>

        {/* Live Adapter Output Inspector */}
        {adapterLog && (
          <div
            className="mt-4 p-4 bg-[#10120f] text-[#eeeee8] rounded-lg font-mono text-xs border border-gray-800"
            id="adapter-result-log"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#e8ff75] animate-pulse" />
                <span className="font-bold text-[#e8ff75]">{adapterLog.title}</span>
                <span className="text-gray-400 text-[11px]">({adapterLog.timestamp})</span>
              </div>
              <button
                type="button"
                onClick={() => setAdapterLog(null)}
                className="text-gray-400 hover:text-white text-[11px]"
              >
                Clear
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] text-gray-200 leading-relaxed max-h-64">
              {JSON.stringify(adapterLog.payload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Security & Isolation standard */}
      <aside className="professional-note mt-8" id="security-standard-note">
        <span>✓</span>
        <div>
          <b>Universal Service Security Standard</b>
          <small>
            Credentials for all 25 systems (OAuth tokens, API secrets, webhooks) are encrypted using AES-256-GCM in the secure vault. Client browsers never receive secret tokens. All write actions are gated by workspace permissions and recorded in the audit trail.
          </small>
        </div>
      </aside>

      {/* Connect / Configure Modal */}
      {activeGroup && (
        <div className="modal-backdrop" id="connect-provider-modal">
          <div className="modal-card">
            <header>
              <div>
                <p className="eyebrow">{activeGroup.category.toUpperCase()}</p>
                <h3>Configure {selectedProvider} Connection</h3>
              </div>
              <button className="close-btn" onClick={() => setActiveGroup(null)}>
                ×
              </button>
            </header>

            <form onSubmit={handleSaveConnection}>
              <div className="mb-4">
                <label className="field-label">Select Provider</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    setSelectedProvider(newProv);
                    const eco = ECOSYSTEM_PROVIDERS[newProv];
                    if (eco) {
                      setRepoAccount(eco.defaultIdentifierPlaceholder);
                    }
                  }}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm"
                >
                  {activeGroup.providers.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="field-label">
                  {selectedProvider.includes('Git')
                    ? 'Target Repository (e.g. org/repo-name)'
                    : selectedProvider.includes('Cloudflare') || selectedProvider.includes('Netlify')
                    ? 'Site Domain / Project Name'
                    : selectedProvider.includes('Analytics') || selectedProvider.includes('Pixel')
                    ? 'Tracking / Measurement Stream ID'
                    : 'Target Account / Project Identifier'}
                </label>
                <input
                  type="text"
                  value={repoAccount}
                  onChange={(e) => setRepoAccount(e.target.value)}
                  placeholder={
                    ECOSYSTEM_PROVIDERS[selectedProvider]?.defaultIdentifierPlaceholder ||
                    'e.g. squargraph/studio-web'
                  }
                  className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm font-mono"
                  required
                />
              </div>

              <div className="mb-4 p-3 bg-gray-100 rounded text-xs text-gray-700">
                <b>Requested Least-Privilege Scopes for {selectedProvider}:</b>
                <ul className="list-disc pl-4 mt-1.5 space-y-0.5 font-mono text-[11px]">
                  {(ECOSYSTEM_PROVIDERS[selectedProvider]?.defaultScopes || [
                    'read:status',
                    'write:isolated',
                  ]).map((scope) => (
                    <li key={scope}>{scope}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-xs text-emerald-800 mb-5">
                <Shield size={14} className="text-emerald-700" />
                <span>Encrypted credentials are verified at rest; client tokens remain masked.</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel" onClick={() => setActiveGroup(null)}>
                  Cancel
                </button>
                <button type="submit" className="confirm">
                  Authorize &amp; Save Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
