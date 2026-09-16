import React, { useState, useMemo, FormEvent } from 'react';
import { Section, EditableKind, Website } from '../types';
import {
  Laptop,
  Tablet,
  Smartphone,
  ShieldCheck,
  Plus,
  Trash2,
  Copy as DuplicateIcon,
  Crosshair,
  ExternalLink,
  Code as CodeIcon,
  Palette,
  DollarSign,
  Menu as MenuIcon,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Check,
  ChevronDown,
  Globe,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AddSectionModal } from './AddSectionModal';

interface WorkspaceViewProps {
  currentWebsite: Website;
  websites: Website[];
  onSelectWebsite: (site: Website) => void;
  sections: Section[];
  selectedId: string;
  onSelectSection: (id: string) => void;
  onUpdateSectionValue: (id: string, value: string) => void;
  onResetSectionValue: (id: string) => void;
  onAddSection: (section: Section) => void;
  onDeleteSection: (id: string) => void;
  onScanUrl: (url: string) => Promise<void>;
  scanLoading: boolean;
  scanNotice: string;
  onOpenPublishModal: () => void;
  onSaveDraft: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  currentWebsite,
  websites,
  onSelectWebsite,
  sections,
  selectedId,
  onSelectSection,
  onUpdateSectionValue,
  onResetSectionValue,
  onAddSection,
  onDeleteSection,
  onScanUrl,
  scanLoading,
  scanNotice,
  onOpenPublishModal,
  onSaveDraft,
}) => {
  const [inputUrl, setInputUrl] = useState(`https://${currentWebsite.url}`);
  const [filter, setFilter] = useState<'All' | EditableKind>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showAddModal, setShowAddModal] = useState(false);
  const [inspectorMode, setInspectorMode] = useState(false);
  const [hoveredSelector, setHoveredSelector] = useState<string | null>(null);

  // Keep inputUrl in sync if website changes
  React.useEffect(() => {
    setInputUrl(`https://${currentWebsite.url}`);
  }, [currentWebsite.url]);

  const selected = sections.find((s) => s.id === selectedId) ?? sections[0] ?? {
    id: 'empty',
    label: 'No section selected',
    kind: 'Copy' as EditableKind,
    value: '',
    originalValue: '',
    note: '',
  };

  const visibleSections = useMemo(() => {
    return sections.filter((s) => {
      const matchesFilter = filter === 'All' || s.kind === filter;
      const matchesSearch =
        !searchQuery ||
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.sourcePath && s.sourcePath.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [sections, filter, searchQuery]);

  const editedSections = useMemo(() => {
    return sections.filter((s) => s.value !== s.originalValue);
  }, [sections]);

  const editsCount = editedSections.length;

  const handleScanSubmit = (e: FormEvent) => {
    e.preventDefault();
    onScanUrl(inputUrl);
  };

  // Helper for duplicate section
  const handleDuplicateSection = (sec: Section) => {
    const duplicated: Section = {
      ...sec,
      id: `${sec.id}-copy-${Date.now().toString().slice(-4)}`,
      label: `${sec.label} (Duplicate)`,
      originalValue: sec.value,
      sourcePath: `${sec.sourcePath || 'custom'}:variant`,
    };
    onAddSection(duplicated);
  };

  // Brand style token color for live canvas
  const brandAccentColor =
    sections.find((s) => s.kind === 'Style' || s.id === 'brand-color')?.value || '#e8ff75';

  // Navigation menu items parsed
  const navRaw = sections.find((s) => s.kind === 'Navigation' || s.id === 'header-nav')?.value || '';
  const navItems = navRaw.split('|').map((item) => item.trim()).filter(Boolean);

  // Commerce price
  const commercePrice =
    sections.find((s) => s.kind === 'Commerce' || s.id === 'primary-price')?.value;

  // Code embed script active indicator
  const hasCodeEmbed = sections.some((s) => s.kind === 'Code');

  return (
    <div id="workspace-view-container">
      {/* Onboarding & Universal Website Header */}
      <section className="onboard" id="onboard-scan-section">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="type-pill !bg-[#10120f] !text-[#e8ff75] font-mono text-[11px] px-2 py-0.5 rounded">
              {currentWebsite.type}
            </span>
            <span className="text-xs font-mono text-gray-500">
              {currentWebsite.connections.sourceRepo ? `repo: ${currentWebsite.connections.sourceRepo}` : 'CMS Mode'}
            </span>
          </div>
          <h2>
            Change anything on <i>{currentWebsite.name}</i>.
          </h2>
          <p className="subcopy">
            Edit text, replace media, update pricing, re-theme colors, inject tracking scripts, or add custom components to any page.
          </p>

          {/* Quick Website Switcher */}
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Switch site:</span>
            {websites.map((site) => (
              <button
                key={site.id}
                onClick={() => onSelectWebsite(site)}
                className={`text-xs px-2.5 py-1 rounded border transition-all flex items-center gap-1.5 ${
                  site.id === currentWebsite.id
                    ? 'bg-[#10120f] text-white border-[#10120f] font-semibold shadow-xs'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: site.color || '#e8ff75' }}
                />
                {site.name}
              </button>
            ))}
          </div>
        </div>

        {/* Universal Scan Box */}
        <div className="scan-box" id="scanner-box">
          <form onSubmit={handleScanSubmit} className="scan-form">
            <label htmlFor="website-url-input">Target Website Address (HTTPS)</label>
            <div className="scan-input-group">
              <input
                id="website-url-input"
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://squargraph.com"
                required
              />
              <button type="submit" disabled={scanLoading} id="scan-submit-button">
                {scanLoading ? 'Scanning…' : 'Scan website'}
              </button>
            </div>

            <div className="scan-foot">
              <small>Discovers copy, media, SEO, code embeds, styling tokens, and commerce models.</small>
              <span className="ssrf-pill" title="Server-side SSRF validation active">
                <ShieldCheck size={12} /> SSRF Protected
              </span>
            </div>
          </form>
        </div>
      </section>

      {/* Main Workspace Grid: Sections Inventory + Deep Inspector */}
      <section className="workspace-grid" id="workspace-editor-grid">
        {/* Left Column: Editable Section Inventory */}
        <div className="editor-card" id="editor-inventory-card">
          <header className="module-head">
            <div>
              <p className="eyebrow">EDITABLE INVENTORY</p>
              <h3>{scanLoading ? 'Analyzing DOM structure…' : `${sections.length} Managed Elements`}</h3>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="py-1.5 px-3 bg-[#10120f] hover:bg-black text-[#e8ff75] text-xs font-semibold rounded flex items-center gap-1 shadow-xs transition-colors"
              id="open-add-section-modal-btn"
            >
              <Plus size={13} /> Add element
            </button>
          </header>

          {/* Search bar */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search elements, paths or copy…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-gray-800 placeholder-gray-400 focus:outline-hidden"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 text-xs">
                ×
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="filters overflow-x-auto" role="tablist" aria-label="Section types">
            {(
              [
                'All',
                'Copy',
                'Image',
                'Link',
                'SEO',
                'Code',
                'Style',
                'Navigation',
                'Commerce',
                'Form',
                'Component',
              ] as const
            ).map((item) => (
              <button
                role="tab"
                aria-selected={filter === item}
                className={filter === item ? 'chosen' : ''}
                onClick={() => setFilter(item)}
                key={item}
                id={`filter-btn-${item.toLowerCase()}`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Section List */}
          <div className="section-list" id="discovered-sections-list">
            {visibleSections.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-xs">No elements match the current category filter.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-xs text-[#10120f] font-semibold underline"
                >
                  + Add a custom element in this category
                </button>
              </div>
            ) : (
              visibleSections.map((section) => {
                const isDirty = section.value !== section.originalValue;
                const isSelected = selected.id === section.id;
                return (
                  <button
                    className={`section-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSelectSection(section.id)}
                    key={section.id}
                    id={`section-row-${section.id}`}
                  >
                    <span className={`section-icon ${section.kind.toLowerCase()}`}>
                      {section.kind === 'Copy'
                        ? 'T'
                        : section.kind === 'Image'
                        ? 'IMG'
                        : section.kind === 'Link'
                        ? 'URL'
                        : section.kind === 'SEO'
                        ? 'SEO'
                        : section.kind === 'Code'
                        ? '<>'
                        : section.kind === 'Style'
                        ? '#'
                        : section.kind === 'Navigation'
                        ? 'NAV'
                        : section.kind === 'Commerce'
                        ? '$'
                        : section.kind === 'Form'
                        ? 'FORM'
                        : 'BLCK'}
                    </span>
                    <div>
                      <b>
                        {section.label}
                        {isDirty && <span className="dirty-dot" title="Modified in draft" />}
                      </b>
                      <small className="font-mono">{section.sourcePath || section.note}</small>
                    </div>
                    <em>{section.kind}</em>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Inspector / Now Editing Panel */}
        <aside className="edit-card" id="now-editing-card">
          <header className="flex items-center justify-between">
            <div>
              <p className="eyebrow">NOW EDITING</p>
              <h3 id="editing-section-title" className="text-base font-bold text-[#10120f] mt-0.5">
                {selected.label}
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`type-badge ${selected.kind.toLowerCase()}`}>{selected.kind}</span>
              <button
                type="button"
                onClick={() => handleDuplicateSection(selected)}
                title="Duplicate this element"
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
              >
                <DuplicateIcon size={13} />
              </button>
              {sections.length > 1 && (
                <button
                  type="button"
                  onClick={() => onDeleteSection(selected.id)}
                  title="Remove element from workspace"
                  className="p-1 hover:bg-red-50 rounded text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </header>

          <p className="location font-mono text-[11px]" id="editing-source-path">
            {selected.sourcePath ? `Target: ${selected.sourcePath}` : selected.note}
          </p>

          {/* Dynamic input field depending on kind */}
          <div className="my-2">
            <label className="field-label" htmlFor="edit-value-input">
              {selected.kind === 'Image'
                ? 'Image Asset Path or CDN URL'
                : selected.kind === 'Link'
                ? 'Destination Link URL'
                : selected.kind === 'SEO'
                ? 'Title Tag / Meta Tag Content'
                : selected.kind === 'Code'
                ? 'Raw Markup, Script Embed or JSON-LD'
                : selected.kind === 'Style'
                ? 'Color Value (Hex / CSS)'
                : selected.kind === 'Navigation'
                ? 'Navigation Items (Separated by |)'
                : selected.kind === 'Commerce'
                ? 'Price or Inventory Amount'
                : selected.kind === 'Form'
                ? 'Form Webhook / Action Endpoint'
                : 'Content Copy'}
            </label>

            {/* STYLE KIND: Color picker & Hex input */}
            {selected.kind === 'Style' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={selected.value.startsWith('#') ? selected.value : '#e8ff75'}
                    onChange={(e) => onUpdateSectionValue(selected.id, e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded cursor-pointer p-0.5 bg-white shadow-xs"
                  />
                  <input
                    id="edit-value-input"
                    value={selected.value}
                    onChange={(e) => onUpdateSectionValue(selected.id, e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-gray-300 rounded text-sm font-mono text-[#10120f]"
                  />
                </div>
                {/* Preset Brand Colors */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-gray-500 font-medium">Quick Presets:</span>
                  {['#e8ff75', '#4a7c59', '#ff4757', '#3b82f6', '#10120f', '#818cf8'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onUpdateSectionValue(selected.id, c)}
                      className="w-5 h-5 rounded-full border border-gray-300 transition-transform hover:scale-110"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            ) : selected.kind === 'Code' ? (
              /* CODE KIND: Monospace editor with syntax indicator */
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 px-1 font-mono">
                  <span>Syntax: {selected.codeLanguage || 'html'}</span>
                  <span>{selected.value.length} chars</span>
                </div>
                <textarea
                  id="edit-value-input"
                  value={selected.value}
                  onChange={(e) => onUpdateSectionValue(selected.id, e.target.value)}
                  rows={6}
                  className="w-full p-2.5 bg-[#1a1c18] text-[#e8ff75] font-mono text-xs rounded border border-gray-700 leading-relaxed"
                  spellCheck={false}
                />
              </div>
            ) : selected.kind === 'Navigation' ? (
              /* NAVIGATION KIND: Menu editor */
              <div className="space-y-2">
                <input
                  id="edit-value-input"
                  value={selected.value}
                  onChange={(e) => onUpdateSectionValue(selected.id, e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs text-[#10120f]"
                  placeholder="Home | About | Work | Contact"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selected.value.split('|').map((item, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium"
                    >
                      {item.trim()}
                    </span>
                  ))}
                </div>
              </div>
            ) : selected.kind === 'Commerce' ? (
              /* COMMERCE KIND */
              <div className="space-y-2">
                <input
                  id="edit-value-input"
                  value={selected.value}
                  onChange={(e) => onUpdateSectionValue(selected.id, e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm font-semibold font-mono text-[#10120f]"
                  placeholder="$185.00"
                />
                <p className="text-[11px] text-gray-500">
                  Updates product catalog, checkout parameters, and live storefront price tags.
                </p>
              </div>
            ) : selected.kind === 'Image' ? (
              /* IMAGE KIND */
              <div className="space-y-2">
                <input
                  id="edit-value-input"
                  value={selected.value}
                  onChange={(e) => onUpdateSectionValue(selected.id, e.target.value)}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs font-mono text-[#10120f]"
                  placeholder="https://... or film1.webp"
                />
                <div className="w-full h-24 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                  {selected.value.startsWith('http') || selected.value.includes('/') ? (
                    <img
                      src={selected.value}
                      alt="Visual asset preview"
                      className="max-h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-mono">Asset: {selected.value}</span>
                  )}
                </div>
              </div>
            ) : selected.kind === 'Link' ? (
              /* LINK KIND */
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="edit-value-input"
                    value={selected.value}
                    onChange={(e) => onUpdateSectionValue(selected.id, e.target.value)}
                    className="flex-1 p-2.5 bg-white border border-gray-300 rounded text-xs font-mono text-[#10120f]"
                    placeholder="https://..."
                  />
                  {selected.value.startsWith('http') && (
                    <a
                      href={selected.value}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                      title="Test destination link"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* COPY / SEO / COMPONENT / FORM */
              <textarea
                id="edit-value-input"
                value={selected.value}
                onChange={(e) => onUpdateSectionValue(selected.id, e.target.value)}
                rows={selected.kind === 'SEO' ? 3 : 5}
                className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-[#10120f] leading-relaxed"
              />
            )}
          </div>

          {/* Change Impact summary */}
          <div className="impact" id="draft-impact-summary">
            <span>↗</span>
            <div>
              <b>
                {editsCount ? `${editsCount} unsaved change${editsCount > 1 ? 's' : ''}` : 'No draft changes yet'}
              </b>
              <small>Changes remain safely isolated until you publish via reviewable PR.</small>
            </div>
          </div>

          <div className="save-row">
            <button className="save" onClick={onSaveDraft} id="save-draft-btn">
              Save to draft
            </button>
            {selected.value !== selected.originalValue && (
              <button
                className="reset-btn"
                onClick={() => onResetSectionValue(selected.id)}
                title="Revert this section to scanned value"
                id="reset-section-btn"
              >
                Revert
              </button>
            )}
          </div>
        </aside>
      </section>

      {/* Live Page Preview Section with Responsive Viewport & Click-to-Target Inspector */}
      <section className="preview-section" id="live-page-preview-section">
        <header className="module-head preview-toolbar">
          <div>
            <p className="eyebrow">LIVE PAGE PREVIEW & INTERACTIVE INSPECTOR</p>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#10120f]">{currentWebsite.url}</h3>
              <span className="text-xs text-gray-500 font-mono">({currentWebsite.type})</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Click-to-Edit Inspector Toggle */}
            <button
              onClick={() => setInspectorMode(!inspectorMode)}
              className={`text-xs px-3 py-1.5 rounded border transition-all flex items-center gap-1.5 ${
                inspectorMode
                  ? 'bg-[#10120f] text-[#e8ff75] border-[#10120f] font-semibold'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              id="toggle-inspector-mode-btn"
            >
              <Crosshair size={13} />
              {inspectorMode ? 'Inspector Active (Click element)' : 'Inspect Elements'}
            </button>

            {/* Viewport Toggles */}
            <div className="device-toggles" id="device-view-toggles">
              <button
                className={previewViewport === 'desktop' ? 'active' : ''}
                onClick={() => setPreviewViewport('desktop')}
                title="Desktop (100%)"
                id="viewport-btn-desktop"
              >
                <Laptop size={14} /> Desktop
              </button>
              <button
                className={previewViewport === 'tablet' ? 'active' : ''}
                onClick={() => setPreviewViewport('tablet')}
                title="Tablet (768px)"
                id="viewport-btn-tablet"
              >
                <Tablet size={14} /> Tablet
              </button>
              <button
                className={previewViewport === 'mobile' ? 'active' : ''}
                onClick={() => setPreviewViewport('mobile')}
                title="Mobile (375px)"
                id="viewport-btn-mobile"
              >
                <Smartphone size={14} /> Mobile
              </button>
            </div>

            <span className="online">
              <i /> Live snapshot
            </span>
          </div>
        </header>

        {/* Browser Mockup */}
        <div
          className="browser transition-all duration-200"
          style={{
            maxWidth: previewViewport === 'mobile' ? '375px' : previewViewport === 'tablet' ? '768px' : '100%',
          }}
          id="mockup-browser-container"
        >
          <div className="browser-top">
            <i />
            <i />
            <i />
            <span className="truncate">https://{currentWebsite.url}</span>
            {hasCodeEmbed && (
              <span className="text-[10px] text-[#e8ff75] bg-[#1a1c18] px-2 py-0.5 rounded font-mono ml-auto">
                &lt;script&gt; embedded
              </span>
            )}
          </div>

          {/* Interactive Visual Canvas reflecting active draft changes */}
          <div
            className={`site-preview relative transition-colors ${
              inspectorMode ? 'cursor-crosshair' : ''
            }`}
            id="preview-visual-canvas"
            style={{
              borderTop: `4px solid ${brandAccentColor}`,
            }}
          >
            {/* Header Navigation Bar */}
            <div
              className={`w-full flex items-center justify-between pb-4 mb-4 border-b border-gray-800/40 ${
                inspectorMode ? 'hover:outline-2 hover:outline-dashed hover:outline-[#e8ff75]' : ''
              }`}
              onClick={() => {
                if (inspectorMode) {
                  const navSec = sections.find((s) => s.kind === 'Navigation');
                  if (navSec) onSelectSection(navSec.id);
                }
              }}
              title={inspectorMode ? 'Click to edit Navigation Menu' : undefined}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: brandAccentColor }}
                />
                <span className="font-bold tracking-wider text-xs">{currentWebsite.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-gray-400">
                {navItems.map((item, idx) => (
                  <span key={idx} className="hover:text-white transition-colors cursor-pointer">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Main Canvas Body */}
            <div>
              {/* Meta title tag indicator */}
              <span
                className={`block text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 ${
                  inspectorMode ? 'hover:outline-1 hover:outline-dashed hover:outline-[#e8ff75]' : ''
                }`}
                onClick={() => {
                  if (inspectorMode) {
                    const sec = sections.find((s) => s.id === 'meta-title' || s.kind === 'SEO');
                    if (sec) onSelectSection(sec.id);
                  }
                }}
                title={inspectorMode ? 'Click to edit SEO Title tag' : undefined}
              >
                {sections.find((s) => s.id === 'meta-title')?.value ||
                  `${currentWebsite.name} — OFFICIAL PLATFORM`}
              </span>

              {/* Primary Headline */}
              <h2
                className={`text-2xl font-bold leading-tight mb-3 ${
                  inspectorMode ? 'hover:outline-2 hover:outline-dashed hover:outline-[#e8ff75]' : ''
                }`}
                onClick={() => {
                  if (inspectorMode) {
                    const sec = sections.find((s) => s.id === 'hero-title' || s.kind === 'Copy');
                    if (sec) onSelectSection(sec.id);
                  }
                }}
                title={inspectorMode ? 'Click to edit Hero headline' : undefined}
              >
                {sections.find((s) => s.id === 'hero-title')?.value ||
                  'Perception leaves clues. We follow them.'}
              </h2>

              {/* Studio Intro Copy */}
              <p
                className={`text-xs text-gray-300 leading-relaxed max-w-xl mb-4 ${
                  inspectorMode ? 'hover:outline-1 hover:outline-dashed hover:outline-[#e8ff75]' : ''
                }`}
                onClick={() => {
                  if (inspectorMode) {
                    const sec = sections.find((s) => s.id === 'studio-copy');
                    if (sec) onSelectSection(sec.id);
                  }
                }}
                title={inspectorMode ? 'Click to edit Studio introduction' : undefined}
              >
                {sections.find((s) => s.id === 'studio-copy')?.value ||
                  'Brand strategy, creative and digital systems built to align perception, communication and growth.'}
              </p>

              {/* Action Buttons & Commerce Pricing row */}
              <div className="flex items-center gap-3 flex-wrap">
                <a
                  href="#primary-action"
                  onClick={(e) => {
                    e.preventDefault();
                    if (inspectorMode) {
                      const sec = sections.find((s) => s.id === 'hero-cta' || s.kind === 'Link');
                      if (sec) onSelectSection(sec.id);
                    }
                  }}
                  className={`preview-cta-btn ${
                    inspectorMode ? 'hover:outline-2 hover:outline-dashed hover:outline-[#e8ff75]' : ''
                  }`}
                  style={{
                    backgroundColor: brandAccentColor,
                    color: '#10120f',
                  }}
                  title={inspectorMode ? 'Click to edit CTA button & destination' : undefined}
                >
                  {sections.find((s) => s.id === 'hero-cta')?.value.includes('http')
                    ? 'Explore Now ↗'
                    : 'Get Started ↗'}
                </a>

                {/* Commerce Price Pill if present */}
                {commercePrice && (
                  <div
                    className={`px-3 py-1.5 bg-[#1a1c18] border border-gray-700 rounded text-xs font-mono text-[#e8ff75] flex items-center gap-1.5 ${
                      inspectorMode ? 'hover:outline-1 hover:outline-dashed hover:outline-[#e8ff75]' : ''
                    }`}
                    onClick={() => {
                      if (inspectorMode) {
                        const sec = sections.find((s) => s.kind === 'Commerce');
                        if (sec) onSelectSection(sec.id);
                      }
                    }}
                    title={inspectorMode ? 'Click to edit Commerce price' : undefined}
                  >
                    <DollarSign size={13} />
                    <span>Price: {commercePrice}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-6 border-t border-gray-800/30">
              <small>Live DOM reflects current workspace draft state in real time.</small>
              {inspectorMode && (
                <span className="text-[#e8ff75] font-mono">
                  [Click any highlighted element to edit in workspace]
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Add Custom Element Modal */}
      {showAddModal && (
        <AddSectionModal
          websiteName={currentWebsite.name}
          websiteUrl={currentWebsite.url}
          onClose={() => setShowAddModal(false)}
          onAddSection={onAddSection}
        />
      )}
    </div>
  );
};
