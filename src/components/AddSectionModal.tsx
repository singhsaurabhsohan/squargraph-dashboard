import React, { useState } from 'react';
import { EditableKind, Section } from '../types';
import { Plus, X, Code, Palette, DollarSign, Menu, Type, Image as ImageIcon, Link as LinkIcon, Search, FileText } from 'lucide-react';

interface AddSectionModalProps {
  websiteName: string;
  websiteUrl: string;
  onClose: () => void;
  onAddSection: (section: Section) => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({
  websiteName,
  websiteUrl,
  onClose,
  onAddSection,
}) => {
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<EditableKind>('Copy');
  const [value, setValue] = useState('');
  const [note, setNote] = useState('Custom Target');
  const [sourcePath, setSourcePath] = useState('');
  const [selector, setSelector] = useState('');
  const [codeLanguage, setCodeLanguage] = useState<'html' | 'javascript' | 'css' | 'json'>('html');

  const kindPresets: Record<EditableKind, { defaultLabel: string; defaultPath: string; defaultVal: string; defaultNote: string }> = {
    Copy: {
      defaultLabel: 'Banner Announcement',
      defaultPath: 'src/components/Banner.tsx:L12',
      defaultVal: 'Special Offer: Get 20% off all bookings this month.',
      defaultNote: 'Header / Global Notice',
    },
    Image: {
      defaultLabel: 'Brand Logo Mark',
      defaultPath: 'public/brand/logo.svg',
      defaultVal: '/assets/logo-mark.svg',
      defaultNote: 'Navbar / Primary Brand Asset',
    },
    Link: {
      defaultLabel: 'Secondary Action Button',
      defaultPath: 'src/components/Hero.tsx:L45',
      defaultVal: `https://${websiteUrl}/case-studies`,
      defaultNote: 'Hero / Secondary CTA',
    },
    SEO: {
      defaultLabel: 'OpenGraph Share Image Tag',
      defaultPath: 'public/index.html:L12',
      defaultVal: `https://${websiteUrl}/og-image.jpg`,
      defaultNote: 'Head Metadata / Social Share Card',
    },
    Code: {
      defaultLabel: 'Analytics / Head Embed Script',
      defaultPath: 'public/index.html:<head>',
      defaultVal: '<script async src="https://www.googletagmanager.com/gtag/js?id=G-METRICS"></script>',
      defaultNote: 'Document Head / Global Telemetry',
    },
    Style: {
      defaultLabel: 'Primary Accent Color Variable',
      defaultPath: 'src/styles/tokens.css:--brand-accent',
      defaultVal: '#e8ff75',
      defaultNote: 'Design Tokens / Brand Accent Palette',
    },
    Navigation: {
      defaultLabel: 'Header Navigation Menu Tree',
      defaultPath: 'src/config/navigation.json',
      defaultVal: 'Home | Services | Work | About | Contact',
      defaultNote: 'Global Header / Desktop & Mobile Menu',
    },
    Commerce: {
      defaultLabel: 'Primary Product Offer Price',
      defaultPath: 'src/data/products.json:item-101.price',
      defaultVal: '$249.00',
      defaultNote: 'Product Catalog / Checkout Price',
    },
    Form: {
      defaultLabel: 'Contact Webhook Endpoint',
      defaultPath: 'src/components/ContactForm.tsx:action',
      defaultVal: `https://api.${websiteUrl}/v1/leads`,
      defaultNote: 'Forms / Lead Capture Webhook',
    },
    Component: {
      defaultLabel: 'Client Testimonials Carousel',
      defaultPath: 'src/components/Testimonials.tsx',
      defaultVal: 'Trusted by over 40+ category-defining brands worldwide.',
      defaultNote: 'Homepage / Social Proof Module',
    },
  };

  const handleKindSelect = (selectedKind: EditableKind) => {
    setKind(selectedKind);
    const preset = kindPresets[selectedKind];
    if (!label || Object.values(kindPresets).some((p) => p.defaultLabel === label)) {
      setLabel(preset.defaultLabel);
    }
    if (!sourcePath || Object.values(kindPresets).some((p) => p.defaultPath === sourcePath)) {
      setSourcePath(preset.defaultPath);
    }
    if (!value || Object.values(kindPresets).some((p) => p.defaultVal === value)) {
      setValue(preset.defaultVal);
    }
    if (!note || Object.values(kindPresets).some((p) => p.defaultNote === note)) {
      setNote(preset.defaultNote);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !value.trim()) return;

    const id = `custom-${kind.toLowerCase()}-${Date.now().toString().slice(-5)}`;
    const newSection: Section = {
      id,
      label: label.trim(),
      kind,
      value: value.trim(),
      originalValue: value.trim(),
      note: note.trim() || 'Custom Added Target',
      sourcePath: sourcePath.trim() || `src/content/${id}.json`,
      selector: selector.trim() || `[data-sc-id="${id}"]`,
      codeLanguage: kind === 'Code' ? codeLanguage : undefined,
    };

    onAddSection(newSection);
    onClose();
  };

  return (
    <div className="modal-backdrop" id="add-section-modal">
      <div className="modal-card max-w-xl" id="add-section-modal-card">
        <header className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <p className="eyebrow !text-gray-500">TARGET ANY ELEMENT</p>
            <h3 className="text-lg font-bold text-[#10120f]">Add Custom Section or Element</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect any DOM node, code script, design token, navigation link, or commerce property on <b>{websiteName}</b>.
            </p>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Kind Selector Pills */}
          <div>
            <label className="field-label !mb-2">Element / Content Kind</label>
            <div className="grid grid-cols-5 gap-1.5" id="kind-selection-grid">
              {(
                [
                  { kind: 'Copy', icon: Type, label: 'Text' },
                  { kind: 'Image', icon: ImageIcon, label: 'Media' },
                  { kind: 'Link', icon: LinkIcon, label: 'Link' },
                  { kind: 'SEO', icon: Search, label: 'SEO' },
                  { kind: 'Code', icon: Code, label: 'Code' },
                  { kind: 'Style', icon: Palette, label: 'Tokens' },
                  { kind: 'Navigation', icon: Menu, label: 'Menu' },
                  { kind: 'Commerce', icon: DollarSign, label: 'Store' },
                  { kind: 'Form', icon: FileText, label: 'Form' },
                  { kind: 'Component', icon: Plus, label: 'Block' },
                ] as const
              ).map((item) => {
                const isChosen = kind === item.kind;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.kind}
                    type="button"
                    onClick={() => handleKindSelect(item.kind as EditableKind)}
                    className={`py-2 px-1 rounded border text-center flex flex-col items-center gap-1 transition-all ${
                      isChosen
                        ? 'bg-[#10120f] text-[#e8ff75] border-[#10120f] shadow-xs'
                        : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    <IconComponent size={14} />
                    <span className="text-[11px] font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="field-label" htmlFor="custom-section-label">
              Element Name / Label
            </label>
            <input
              id="custom-section-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Announcement Bar Headline"
              className="w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-[#10120f]"
              required
            />
          </div>

          {/* Location & Selector in 2 cols */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label" htmlFor="custom-section-note">
                Location Context / Section Note
              </label>
              <input
                id="custom-section-note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Header / Top bar"
                className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs text-[#10120f]"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="custom-section-path">
                Source File Path or API endpoint
              </label>
              <input
                id="custom-section-path"
                type="text"
                value={sourcePath}
                onChange={(e) => setSourcePath(e.target.value)}
                placeholder="e.g. src/components/Header.tsx:L14"
                className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs font-mono text-[#10120f]"
              />
            </div>
          </div>

          {/* If Code kind, choose syntax */}
          {kind === 'Code' && (
            <div>
              <label className="field-label">Script / Code Syntax</label>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value as any)}
                className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-mono"
              >
                <option value="html">HTML / Embed Tag (&lt;script&gt;, &lt;iframe&gt;, &lt;meta&gt;)</option>
                <option value="javascript">JavaScript Snippet</option>
                <option value="css">Custom CSS Stylesheet</option>
                <option value="json">Structured Data / Schema.org JSON-LD</option>
              </select>
            </div>
          )}

          {/* Value input */}
          <div>
            <label className="field-label" htmlFor="custom-section-value">
              {kind === 'Style'
                ? 'Color Hex or CSS Value'
                : kind === 'Code'
                ? 'Code or Embed Script Markup'
                : kind === 'Navigation'
                ? 'Menu Navigation Links (Separated by |)'
                : kind === 'Commerce'
                ? 'Product Price or Stock Parameter'
                : kind === 'Link'
                ? 'Destination Link URL'
                : kind === 'Image'
                ? 'Asset Image Path / CDN URL'
                : 'Content Value'}
            </label>
            {kind === 'Code' || kind === 'Component' || kind === 'Copy' ? (
              <textarea
                id="custom-section-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                rows={3}
                placeholder="Enter initial content or markup..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs font-mono text-[#10120f]"
                required
              />
            ) : kind === 'Style' ? (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={value.startsWith('#') ? value : '#e8ff75'}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="#e8ff75 or rgba(...)"
                  className="flex-1 p-2.5 bg-white border border-gray-300 rounded text-xs font-mono text-[#10120f]"
                  required
                />
              </div>
            ) : (
              <input
                id="custom-section-value"
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded text-xs text-[#10120f]"
                required
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-xs font-semibold rounded text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2 px-5 bg-[#10120f] hover:bg-black text-[#e8ff75] text-xs font-semibold rounded shadow-xs flex items-center gap-1.5"
              id="submit-add-section-btn"
            >
              <Plus size={14} /> Add to Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
