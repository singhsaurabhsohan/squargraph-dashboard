import React, { useState } from 'react';
import { Website, Section, DraftChange } from '../types';
import { GitPullRequest, GitBranch, ShieldAlert, CheckCircle2, ArrowUpRight, ExternalLink, Rocket, Lock, Check } from 'lucide-react';

interface PublishModalProps {
  website: Website;
  sections: Section[];
  onClose: () => void;
  onConfirmPublish: (details: {
    prTitle: string;
    prDescription: string;
    reviewer: string;
    changes: DraftChange[];
  }) => Promise<any>;
  onNavigateToIntegrations: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({
  website,
  sections,
  onClose,
  onConfirmPublish,
  onNavigateToIntegrations,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'pr'>('upload');
  const [publishing, setPublishing] = useState(false);
  const [publishedResult, setPublishedResult] = useState<any | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Codebase Push State
  const [githubToken, setGithubToken] = useState('');
  const [pushingCodebase, setPushingCodebase] = useState(false);
  const [codebasePushResult, setCodebasePushResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const editedSections = sections.filter((s) => s.value !== s.originalValue);

  const [prTitle, setPrTitle] = useState(
    editedSections.length > 0
      ? `[Site Control] Update ${editedSections.map((s) => s.label).slice(0, 2).join(', ')}${editedSections.length > 2 ? ` and ${editedSections.length - 2} more` : ''}`
      : `[Site Control] Content updates on ${website.name}`
  );

  const [prDescription, setPrDescription] = useState(
    `Automated reviewable changeset submitted through SQUARGRAPH Site Control.\n\nModified sections:\n${(editedSections.length > 0 ? editedSections : sections)
      .map((s) => `- ${s.label} (${s.kind}): "${s.value.slice(0, 60)}${s.value.length > 60 ? '...' : ''}"`)
      .join('\n')}`
  );

  const [reviewer, setReviewer] = useState('Saurabh Singh (Owner)');

  // Deliberate safety gate check
  const isRepositoryConnected = website.state === 'Connected' && !!website.connections.sourceRepo;

  const handlePushCodebase = async () => {
    if (!githubToken.trim()) {
      setCodebasePushResult({
        success: false,
        error: 'Please paste your GitHub Personal Access Token (starts with ghp_...)',
      });
      return;
    }

    setPushingCodebase(true);
    setCodebasePushResult(null);
    try {
      const res = await fetch('/api/bridge/push-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: githubToken.trim(),
          repo: website.connections.sourceRepo || 'singhsaurabhsohan/squargraph-dashboard',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCodebasePushResult({ success: true, message: data.message });
      } else {
        setCodebasePushResult({ success: false, error: data.error || 'Failed to upload files to GitHub repository.' });
      }
    } catch (err: any) {
      setCodebasePushResult({ success: false, error: err.message || 'Network error pushing to GitHub' });
    } finally {
      setPushingCodebase(false);
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRepositoryConnected) return;

    setPublishing(true);
    setPublishError(null);
    try {
      const targetSections = editedSections.length > 0 ? editedSections : sections;
      const changes: DraftChange[] = targetSections.map((s) => ({
        sectionId: s.id,
        label: s.label,
        kind: s.kind,
        oldValue: s.originalValue || s.value,
        newValue: s.value,
        sourcePath: s.sourcePath || 'src/content/site.json',
        timestamp: new Date().toLocaleTimeString(),
      }));

      const res = await onConfirmPublish({
        prTitle: prTitle || `[Site Control] Content sync on ${website.name}`,
        prDescription: prDescription || `Automated changeset generated via SQUARGRAPH Site Control.`,
        reviewer,
        changes,
      });

      setPublishedResult(res);
    } catch (err: any) {
      console.error(err);
      setPublishError(err.message || 'Failed to create pull request. Please check repository permissions.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="modal-backdrop" id="publish-review-modal">
      <div className="modal-card !max-w-[680px]">
        <header>
          <div>
            <p className="eyebrow">SAFE CHANGE WORKFLOW</p>
            <h3>
              {publishedResult
                ? 'Pull Request & Preview Created'
                : 'Publish & Repository Sync'}
            </h3>
          </div>
          <button className="close-btn cursor-pointer" onClick={onClose}>
            ×
          </button>
        </header>

        {/* Tab navigation between Codebase Push and PR review */}
        {!publishedResult && (
          <div className="flex border-b border-gray-200 mb-4 text-xs font-semibold gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'upload'
                  ? 'border-black text-black font-bold'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <Rocket size={13} className={activeTab === 'upload' ? 'text-black' : ''} />
              1. Upload All 29 Files to Repo (os.squargraph.com)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pr')}
              className={`pb-2.5 px-3 flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'pr'
                  ? 'border-black text-black font-bold'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              <GitPullRequest size={13} />
              2. Review & Publish Changes PR
            </button>
          </div>
        )}

        {/* TAB 1: DIRECT UPLOAD ALL 29 FILES TO GITHUB REPO */}
        {activeTab === 'upload' && !publishedResult && (
          <div className="space-y-4 text-xs text-gray-700 py-1">
            <div className="p-3.5 bg-[#10120f] text-[#eeeee8] rounded space-y-2 border border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Rocket size={16} className="text-[#e8ff75]" />
                  <b className="text-white text-sm">Upload Codebase to GitHub</b>
                </div>
                <span className="px-2 py-0.5 bg-[#e8ff75]/20 text-[#e8ff75] text-[10px] font-mono rounded font-bold">
                  29 Files Tracked
                </span>
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                Your repository on GitHub currently has no files uploaded. To deploy your dashboard to <code className="text-[#e8ff75]">os.squargraph.com</code>, push the full project codebase below:
              </p>
              <div className="p-2 bg-black/60 rounded border border-gray-700 flex items-center justify-between font-mono text-xs text-[#e8ff75]">
                <span>https://github.com/{website.connections.sourceRepo || 'singhsaurabhsohan/squargraph-dashboard'}</span>
                <a
                  href={`https://github.com/${website.connections.sourceRepo || 'singhsaurabhsohan/squargraph-dashboard'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-bold text-[#10120f] block text-xs">
                Your GitHub Personal Access Token (starts with <code>ghp_...</code>):
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  className="w-full p-2.5 pr-8 border border-gray-300 rounded font-mono text-xs focus:ring-1 focus:ring-black focus:border-black outline-hidden bg-white"
                />
                <Lock size={13} className="absolute right-2.5 top-3 text-gray-400" />
              </div>
              <p className="text-[11px] text-gray-500">
                GitHub requires write authorization to upload files to your account. Needs <b>repo</b> scope.
              </p>
            </div>

            {codebasePushResult && (
              <div
                className={`p-3 rounded text-xs border ${
                  codebasePushResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {codebasePushResult.success ? (
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  ) : (
                    <ShieldAlert size={16} className="text-red-600 shrink-0" />
                  )}
                  <span>{codebasePushResult.message || codebasePushResult.error}</span>
                </div>
                {codebasePushResult.success && (
                  <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px] space-y-1">
                    <p className="font-bold text-black">Next Steps to launch os.squargraph.com:</p>
                    <ol className="list-decimal pl-4 space-y-1 text-gray-800">
                      <li>Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer" className="underline font-bold">dash.cloudflare.com</a> → <b>Workers & Pages</b> → <b>Create application</b> → <b>Pages</b>.</li>
                      <li>Select your repo: <b>singhsaurabhsohan/squargraph-dashboard</b>.</li>
                      <li>Preset: <b>Vite</b>, Build command: <code>npm run build</code>, Output directory: <code>dist</code>. Click <b>Deploy</b>.</li>
                      <li>In custom domains, add: <b className="text-black">os.squargraph.com</b>!</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions pt-2">
              <button type="button" className="cancel cursor-pointer" onClick={onClose} disabled={pushingCodebase}>
                Cancel
              </button>
              <button
                type="button"
                className="confirm flex items-center gap-1.5 cursor-pointer !bg-[#10120f] !text-[#e8ff75] hover:!bg-black"
                onClick={handlePushCodebase}
                disabled={pushingCodebase}
                id="push-codebase-to-gh-btn"
              >
                <Rocket size={13} />
                {pushingCodebase ? 'Pushing All 29 Files to GitHub…' : '🚀 Push All 29 Files to GitHub Repo'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: REVIEW & PUBLISH CHANGES PR */}
        {activeTab === 'pr' && (
          <div>
            {/* Safety Gate Warning if repository is disconnected */}
            {!isRepositoryConnected && (
              <div className="p-4 bg-[#fdf5e8] border border-[#ecd5a8] rounded mb-5 text-sm text-[#73531b]">
                <div className="flex items-center gap-2 font-bold mb-1.5 text-[#5e4313]">
                  <ShieldAlert size={16} /> Publishing Safety Gate Enforced
                </div>
                <p className="leading-normal mb-3">
                  A live URL alone is not enough to safely update a website. Every editable property must be mapped to an authorised source repository or CMS adapter before publishing.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToIntegrations();
                    }}
                    className="bg-[#10120f] text-white px-3.5 py-2 text-xs font-bold rounded"
                  >
                    Connect Repository in Integrations →
                  </button>
                  <button onClick={onClose} className="text-xs underline font-semibold text-gray-700">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Successful Publish State */}
            {publishedResult ? (
              <div className="py-2">
                <div className="p-4 bg-[#f2f8e6] border border-[#cbdf9b] rounded mb-5 text-xs text-[#315609] space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#274706]">
                    <CheckCircle2 size={18} /> Reviewable Pull Request Created
                  </div>
                  <p>
                    A pull request has been opened with your changes. Direct-to-main is prevented by workspace safety policy.
                  </p>
                  <div className="pt-2 border-t border-[#d8e8b3] space-y-1.5 font-mono text-[11px]">
                    <p>
                      <b>Repository:</b> {website.connections.sourceRepo}
                    </p>
                    <p>
                      <b>Branch:</b> {publishedResult.job?.branchName}
                    </p>
                    <p>
                      <b>PR Link:</b>{' '}
                      <a
                        href={publishedResult.job?.prUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold text-black"
                      >
                        {publishedResult.job?.prUrl} <ExternalLink size={10} className="inline" />
                      </a>
                    </p>
                    <p>
                      <b>Deployment Preview:</b>{' '}
                      <a
                        href={publishedResult.job?.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-bold text-black"
                      >
                        {publishedResult.job?.previewUrl} <ExternalLink size={10} className="inline" />
                      </a>
                    </p>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="confirm cursor-pointer" onClick={onClose}>
                    Done & Return to Workspace
                  </button>
                </div>
              </div>
            ) : (
              isRepositoryConnected && (
                <form onSubmit={handlePublish}>
                  {/* Publish Error Display */}
                  {publishError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-xs mb-3 flex items-start gap-2">
                      <ShieldAlert size={15} className="shrink-0 text-red-600 mt-0.5" />
                      <div>
                        <b className="font-semibold block mb-0.5">Publish Workflow Notice:</b>
                        <span>{publishError}</span>
                      </div>
                    </div>
                  )}

                  {/* Git Diff viewer */}
                  <div>
                    <label className="field-label flex items-center justify-between">
                      <span>Unified Git Diff ({editedSections.length} pending draft edits)</span>
                      {editedSections.length === 0 && (
                        <span className="text-emerald-700 text-[11px] font-medium">Ready to sync workspace</span>
                      )}
                    </label>
                    <div className="diff-box">
                      {editedSections.length === 0 ? (
                        <div className="space-y-1.5 py-1 text-xs">
                          <div className="text-emerald-400 font-mono text-[11px] flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                            Baseline in sync ({sections.length} inventory sections tracked).
                          </div>
                          <p className="text-gray-300 text-[11px] leading-relaxed">
                            Submitting will create a synchronization Pull Request with all active site elements & schemas directly into <code className="text-[#e8ff75]">{website.connections.sourceRepo}</code>.
                          </p>
                        </div>
                      ) : (
                        editedSections.map((sec) => (
                          <div key={sec.id} className="mb-3">
                            <div className="diff-file">
                              diff --git a/{sec.sourcePath || 'src/content/home.json'} b/{sec.sourcePath || 'src/content/home.json'}
                            </div>
                            <span className="diff-rem">- {sec.originalValue}</span>
                            <span className="diff-add">+ {sec.value}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* PR Metadata Form */}
                  <div className="mb-3">
                    <label className="field-label">Pull Request Title</label>
                    <input
                      type="text"
                      value={prTitle}
                      onChange={(e) => setPrTitle(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded text-xs font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="field-label">Target Repository & Branch</label>
                      <div className="p-2 bg-gray-100 border border-gray-200 rounded text-xs font-mono text-gray-700 flex items-center gap-1.5">
                        <GitBranch size={12} /> {website.connections.sourceRepo} : {website.connections.sourceBranch || 'main'}
                      </div>
                    </div>

                    <div>
                      <label className="field-label">Assigned Reviewer</label>
                      <select
                        value={reviewer}
                        onChange={(e) => setReviewer(e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded text-xs"
                      >
                        <option value="Saurabh Singh (Owner)">Saurabh Singh (Owner)</option>
                        <option value="Priya Verma (Reviewer)">Priya Verma (Reviewer)</option>
                        <option value="Dev Team Lead (Editor)">Dev Team Lead (Editor)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 bg-gray-100 rounded text-[11px] text-gray-600 mb-4 flex items-center justify-between">
                    <span>Deploy Provider: Cloudflare Worker Edge Preview</span>
                    <span className="text-emerald-700 font-bold">Auto-deploy on PR open</span>
                  </div>

                  <div className="modal-actions">
                    <button type="button" className="cancel cursor-pointer" onClick={onClose} disabled={publishing}>
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="confirm flex items-center gap-1.5 cursor-pointer"
                      disabled={publishing}
                      id="confirm-create-pr-btn"
                    >
                      <GitPullRequest size={13} />
                      {publishing
                        ? 'Pushing Commit & Creating PR…'
                        : editedSections.length > 0
                        ? 'Create Pull Request & Preview ↗'
                        : 'Sync & Create Pull Request ↗'}
                    </button>
                  </div>
                </form>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
