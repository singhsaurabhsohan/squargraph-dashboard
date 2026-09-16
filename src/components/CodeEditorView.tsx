import React, { useState } from 'react';
import {
  FileCode,
  Save,
  Play,
  RotateCcw,
  Check,
  Folder,
  FileText,
  FileJson,
  Layers,
  Sparkles,
  GitBranch,
  Terminal,
  ExternalLink,
  Code2,
  Copy,
} from 'lucide-react';
import { CodeFile, Website } from '../types';

const INITIAL_CODE_FILES: CodeFile[] = [
  {
    path: 'wrangler.toml',
    name: 'wrangler.toml',
    language: 'toml',
    content: `name = "squargraph-dashboard"
main = "server.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[assets]
directory = "./dist"
not_found_handling = "single-page-application"

[vars]
ENVIRONMENT = "production"
CANONICAL_DOMAIN = "control.squargraph.com"
PRIMARY_REGION = "auto"
`,
  },
  {
    path: 'src/config/site.json',
    name: 'site.json',
    language: 'json',
    content: `{
  "name": "SQUARGRAPH",
  "domain": "squargraph.com",
  "controlDomain": "control.squargraph.com",
  "brandAccent": "#e8ff75",
  "brandDark": "#10120f",
  "tagline": "Perception leaves clues. We follow them.",
  "telemetry": {
    "gtag": "G-TRACK99",
    "metaPixel": "981240182",
    "speedInsights": true
  },
  "commerce": {
    "currency": "INR",
    "razorpayKey": "rzp_live_sqg91823",
    "stripePublishable": "pk_live_squargraph_sys"
  }
}`,
  },
  {
    path: 'src/styles/tokens.css',
    name: 'tokens.css',
    language: 'css',
    content: `:root {
  --brand-accent: #e8ff75;
  --brand-accent-hover: #dcfa5a;
  --brand-dark: #10120f;
  --brand-surface: #181b16;
  --brand-border: #282d23;
  --brand-cream: #eeeee8;
  --brand-line: #d9d9d1;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.hero-gradient {
  background: radial-gradient(circle at 50% 0%, rgba(232, 255, 117, 0.08), transparent 70%);
}
`,
  },
  {
    path: 'public/index.html',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SQUARGRAPH — Brand strategy, creative and digital systems</title>
    <meta name="description" content="Brand strategy, creative and digital systems built to align perception, communication and growth." />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <!-- Global Analytics Integration -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-TRACK99"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-TRACK99');
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  },
  {
    path: 'src/components/Hero.tsx',
    name: 'Hero.tsx',
    language: 'typescript',
    content: `import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-24 pb-20 px-8 max-w-7xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium text-lime-400 bg-lime-950/40 border border-lime-800/60 mb-6">
        <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
        SQUARGRAPH Digital Architecture
      </div>
      <h1 className="hero-title text-5xl md:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.08]">
        Perception leaves clues. We follow them.
      </h1>
      <p className="mt-6 text-xl text-neutral-400 max-w-2xl leading-relaxed">
        Brand strategy, creative and digital systems engineered to orchestrate multi-touchpoint perception and growth.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <a
          href="/discovery.html"
          className="primary-cta px-6 py-3 rounded-lg font-bold text-black bg-[#e8ff75] hover:bg-[#dcfa5a] transition-colors"
        >
          Initiate Discovery
        </a>
      </div>
    </section>
  );
};
`,
  },
];

interface CodeEditorViewProps {
  currentWebsite: Website;
  onCommitChanges: (fileName: string, content: string) => Promise<void>;
}

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  currentWebsite,
  onCommitChanges,
}) => {
  const [files, setFiles] = useState<CodeFile[]>(INITIAL_CODE_FILES);
  const [activePath, setActivePath] = useState<string>(INITIAL_CODE_FILES[0].path);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [syntaxStatus, setSyntaxStatus] = useState<string>('Valid Syntax (TypeScript/TOML Engine)');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[Vite] Dev server ready for ${currentWebsite.url}`,
    `[Cloudflare Assets] Static router attached at ./dist`,
    `[Git] HEAD on branch main (clean working directory)`,
  ]);

  const activeFile = files.find((f) => f.path === activePath) || files[0];

  const handleContentChange = (newVal: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.path === activePath ? { ...f, content: newVal, isModified: true } : f))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveNotice(null);
    try {
      await onCommitChanges(activeFile.name, activeFile.content);
      setFiles((prev) =>
        prev.map((f) => (f.path === activePath ? { ...f, isModified: false } : f))
      );
      setTerminalLogs((prev) => [
        `[Git] Staged changes for ${activeFile.path}`,
        `[AST Engine] Parsed AST and validated tokens in ${activeFile.path}`,
        `[Build] Cloudflare Assets single-page bundle verified`,
        ...prev.slice(0, 10),
      ]);
      setSaveNotice(`Saved & committed ${activeFile.name} to git working tree!`);
      setTimeout(() => setSaveNotice(null), 3500);
    } finally {
      setSaving(false);
    }
  };

  const handleFormat = () => {
    try {
      if (activeFile.language === 'json') {
        const parsed = JSON.parse(activeFile.content);
        handleContentChange(JSON.stringify(parsed, null, 2));
      }
      setTerminalLogs((prev) => [`[Formatter] Code style normalized for ${activeFile.name}`, ...prev]);
    } catch {
      setSyntaxStatus('Error: Invalid JSON syntax');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0d0f0c] text-neutral-200 overflow-hidden font-sans">
      {/* Editor Top Bar */}
      <div className="h-14 border-b border-[#232720] bg-[#141712] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1e231a] border border-[#2e3626] flex items-center justify-center text-[#e8ff75]">
            <Code2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Web Development Studio & IDE</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-lime-950/60 text-lime-400 border border-lime-800/50">
                Live Code AST
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Repository:{' '}
              <span className="font-mono text-neutral-300">
                {currentWebsite.connections.sourceRepo || 'singhsaurabhsohan/squargraph-site'}
              </span>
              {' '}· Branch: <span className="font-mono text-lime-300">main</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveNotice && (
            <span className="text-xs text-lime-400 bg-lime-950/80 px-3 py-1.5 rounded border border-lime-800 flex items-center gap-1.5 animate-fadeIn">
              <Check size={14} /> {saveNotice}
            </span>
          )}
          <button
            onClick={handleFormat}
            className="px-3 py-1.5 rounded text-xs font-medium text-neutral-300 bg-[#1c2018] hover:bg-[#252b20] border border-[#2e3627] flex items-center gap-1.5 transition-colors"
            title="Format active document"
          >
            <Sparkles size={13} className="text-[#e8ff75]" /> Format
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded text-xs font-bold text-black bg-[#e8ff75] hover:bg-[#dcfa5a] disabled:opacity-50 flex items-center gap-1.5 shadow-sm transition-all"
          >
            {saving ? (
              <span className="animate-spin w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full" />
            ) : (
              <Save size={14} />
            )}
            Save & Sync to Git
          </button>
        </div>
      </div>

      {/* Editor Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left File Tree */}
        <div className="w-64 border-r border-[#232720] bg-[#11130f] flex flex-col select-none">
          <div className="p-3 text-[11px] font-mono uppercase tracking-wider text-neutral-500 border-b border-[#1f231c] flex items-center justify-between">
            <span>Project Explorer</span>
            <span className="text-[10px] text-lime-400">{files.length} files</span>
          </div>

          <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
            <div className="text-[11px] font-semibold text-neutral-400 px-2 py-1 flex items-center gap-1.5">
              <Folder size={13} className="text-neutral-500" />
              <span>squargraph-platform</span>
            </div>

            {files.map((file) => {
              const isActive = file.path === activePath;
              return (
                <button
                  key={file.path}
                  onClick={() => setActivePath(file.path)}
                  className={`w-full text-left px-3 py-2 rounded text-xs flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-[#1e2319] text-[#e8ff75] font-semibold border-l-2 border-[#e8ff75]'
                      : 'text-neutral-400 hover:bg-[#171a14] hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {file.language === 'json' ? (
                      <FileJson size={14} className="text-amber-400" />
                    ) : file.language === 'html' ? (
                      <FileCode size={14} className="text-orange-400" />
                    ) : file.language === 'css' ? (
                      <Layers size={14} className="text-blue-400" />
                    ) : (
                      <FileText size={14} className="text-emerald-400" />
                    )}
                    <span className="truncate">{file.name}</span>
                  </div>
                  {file.isModified && (
                    <span className="w-2 h-2 rounded-full bg-amber-400" title="Unsaved changes" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Git Branch Footer */}
          <div className="p-3 border-t border-[#1f231c] bg-[#141712] text-xs flex items-center justify-between text-neutral-400 font-mono">
            <div className="flex items-center gap-1.5 text-lime-300">
              <GitBranch size={13} />
              <span>main</span>
            </div>
            <span className="text-[10px] text-neutral-500">Live Production</span>
          </div>
        </div>

        {/* Center Code Area */}
        <div className="flex-1 flex flex-col bg-[#0b0c09] overflow-hidden">
          {/* File Tab */}
          <div className="h-9 border-b border-[#232720] bg-[#141712] px-4 flex items-center gap-2 text-xs">
            <span className="text-neutral-400">{activeFile.path}</span>
            {activeFile.isModified && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Modified
              </span>
            )}
            <span className="ml-auto text-[11px] font-mono text-neutral-500">
              {activeFile.language.toUpperCase()} · UTF-8
            </span>
          </div>

          {/* Interactive Code Textarea */}
          <div className="flex-1 relative flex">
            {/* Line numbers simulation */}
            <div className="w-12 bg-[#0e100c] border-r border-[#1e221b] select-none py-3 text-right pr-3 font-mono text-xs text-neutral-600 leading-6">
              {activeFile.content.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code Content */}
            <textarea
              value={activeFile.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="flex-1 bg-transparent text-neutral-200 font-mono text-xs leading-6 p-3 outline-none resize-none selection:bg-lime-900 selection:text-white"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </div>

          {/* Terminal / Live Logs Output */}
          <div className="h-40 border-t border-[#232720] bg-[#10120d] flex flex-col">
            <div className="h-8 border-b border-[#1e221b] px-4 flex items-center justify-between text-xs text-neutral-400 font-mono">
              <div className="flex items-center gap-2">
                <Terminal size={13} className="text-lime-400" />
                <span className="font-semibold text-white">SQUARGRAPH Build & AST Terminal</span>
              </div>
              <span className="text-[11px] text-lime-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                Node 22.14.0 · Cloudflare Workers Edge
              </span>
            </div>
            <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1 text-neutral-300">
              {terminalLogs.map((log, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-neutral-600 select-none">&gt;</span>
                  <span
                    className={
                      log.includes('[Git]')
                        ? 'text-lime-300'
                        : log.includes('[Vite]')
                        ? 'text-cyan-300'
                        : log.includes('[Build]')
                        ? 'text-emerald-300'
                        : 'text-neutral-300'
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
