import React, { useState } from 'react';
import { Website, WebsiteType } from '../types';
import { Plus, ExternalLink, GitBranch, Globe } from 'lucide-react';

interface WebsitesViewProps {
  websites: Website[];
  onSelectWebsite: (site: Website) => void;
  onAddWebsite: (siteData: {
    name: string;
    url: string;
    type: WebsiteType;
    environment: 'production' | 'staging' | 'preview';
    sourceRepo?: string;
  }) => void;
  onOpenConnectRepo: (site: Website) => void;
}

export const WebsitesView: React.FC<WebsitesViewProps> = ({
  websites,
  onSelectWebsite,
  onAddWebsite,
  onOpenConnectRepo,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<WebsiteType>('Static / Custom Code');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'preview'>('production');
  const [sourceRepo, setSourceRepo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    onAddWebsite({
      name: name.trim(),
      url: url.trim(),
      type,
      environment,
      sourceRepo: sourceRepo.trim() || undefined,
    });

    setName('');
    setUrl('');
    setSourceRepo('');
    setShowAddModal(false);
  };

  return (
    <section className="sites-view" id="websites-inventory-view">
      <p className="eyebrow">CONNECTED INVENTORY</p>
      <h2>Every site, one publishing standard.</h2>
      <p className="subcopy">
        All client properties share the same safe change pipeline: authoring, visual review, GitHub branch creation, automated preview deployment, and 1-click rollback.
      </p>

      <div className="site-grid" id="sites-grid-list">
        {websites.map((site) => (
          <article key={site.id} id={`site-card-${site.id}`}>
            <span style={{ background: site.color }}>{site.name.slice(0, 1)}</span>
            <div>
              <b>{site.name}</b>
              <small>{site.url}</small>
              <div className="site-meta">
                <em className={site.state === 'Connected' ? 'good' : ''}>{site.state}</em>
                <span className="type-pill">{site.type}</span>
                {site.connections.sourceRepo ? (
                  <span className="text-[10px] text-gray-600 flex items-center gap-1 font-mono">
                    <GitBranch size={10} /> {site.connections.sourceRepo}
                  </span>
                ) : (
                  <button
                    onClick={() => onOpenConnectRepo(site)}
                    className="!bg-transparent !p-0 !text-[10px] !text-amber-700 underline font-semibold cursor-pointer"
                  >
                    + Map Repo
                  </button>
                )}
              </div>
            </div>

            <button onClick={() => onSelectWebsite(site)} id={`open-site-${site.id}-btn`}>
              Open →
            </button>
          </article>
        ))}
      </div>

      <button
        className="add-site-btn"
        onClick={() => setShowAddModal(true)}
        id="add-new-website-btn"
      >
        + Add another website
      </button>

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="modal-backdrop" id="add-site-modal">
          <div className="modal-card">
            <header>
              <div>
                <p className="eyebrow">REGISTER PROPERTY</p>
                <h3>Add New Website</h3>
              </div>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </header>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="field-label">Website Name</label>
                <input
                  type="text"
                  placeholder="e.g. ACME STUDIO"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="field-label">Canonical URL (Domain)</label>
                <input
                  type="text"
                  placeholder="e.g. acmebrand.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="field-label">Architecture / Adapter Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as WebsiteType)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm"
                  >
                    <option value="Static / Custom Code">Static / Custom Code</option>
                    <option value="Headless CMS">Headless CMS</option>
                    <option value="WordPress">WordPress</option>
                    <option value="Shopify / WooCommerce">Shopify / WooCommerce</option>
                    <option value="SaaS / Custom App">SaaS / Custom App</option>
                  </select>
                </div>

                <div>
                  <label className="field-label">Target Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="preview">Preview</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="field-label">GitHub Repository Mapping (Optional at creation)</label>
                <input
                  type="text"
                  placeholder="org/repo-name (e.g. acme/web-frontend)"
                  value={sourceRepo}
                  onChange={(e) => setSourceRepo(e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm font-mono"
                />
                <small className="text-gray-500 text-[10px] mt-1 block">
                  Publishing requires a connected repository. You can map it now or configure via Integrations.
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm">
                  Save & Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
