import React, { useState } from 'react';
import { Website, Section, DraftChange } from '../types';
import { GitPullRequest, GitBranch, ShieldAlert, CheckCircle2, ArrowUpRight, ExternalLink } from 'lucide-react';

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
  const [publishing, setPublishing] = useState(false);
  const [publishedResult, setPublishedResult] = useState<any | null>(null);

  const editedSections = sections.filter((s) => s.value !== s.originalValue);

  const [prTitle, setPrTitle] = useState(
    editedSections.length > 0
      ? `[Site Control] Update ${editedSections.map((s) => s.label).slice(0, 2).join(', ')}${editedSections.length > 2 ? ` and ${editedSections.length - 2} more` : ''}`
      : `[Site Control] Content updates on ${website.name}`
  );

  const [prDescription, setPrDescription] = useState(
    `Automated reviewable changeset submitted through SQUARGRAPH Site Control.\n\nModified sections:\n${editedSections
      .map((s) => `- ${s.label} (${s.kind}): "${s.value.slice(0, 60)}${s.value.length > 60 ? '...' : ''}"`)
      .join('\n')}`
  );

  const [reviewer, setReviewer] = useState('Priya Verma (Reviewer)');

  // Deliberate safety gate check
  const isRepositoryConnected = website.state === 'Connected' && !!website.connections.sourceRepo;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRepositoryConnected) return;

    setPublishing(true);
    try {
      const changes: DraftChange[] = editedSections.map((s) => ({
        sectionId: s.id,
        label: s.label,
        kind: s.kind,
        oldValue: s.originalValue,
        newValue: s.value,
        sourcePath: s.sourcePath || 'src/content/site.json',
        timestamp: new Date().toLocaleTimeString(),
      }));

      const res = await onConfirmPublish({
        prTitle,
        prDescription,
        reviewer,
        changes,
      });

      setPublishedResult(res);
    } catch (err: any) {
      console.error(err);
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
              {publishedResult ? 'Pull Request & Preview Created' : 'Review & Publish Changes'}
            </h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </header>

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
              <button type="button" className="confirm" onClick={onClose}>
                Done & Return to Workspace
              </button>
            </div>
          </div>
        ) : (
          isRepositoryConnected && (
            <form onSubmit={handlePublish}>
              {/* Git Diff viewer */}
              <div>
                <label className="field-label">Unified Git Diff ({editedSections.length} changes)</label>
                <div className="diff-box">
                  {editedSections.length === 0 ? (
                    <div className="text-gray-400">No modifications in current draft. Edit a section to generate diff.</div>
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
                    <option value="Priya Verma (Reviewer)">Priya Verma (Reviewer)</option>
                    <option value="Saurabh Singh (Owner)">Saurabh Singh (Owner)</option>
                    <option value="Dev Team Lead (Editor)">Dev Team Lead (Editor)</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 bg-gray-100 rounded text-[11px] text-gray-600 mb-4 flex items-center justify-between">
                <span>Deploy Provider: Cloudflare Worker Edge Preview</span>
                <span className="text-emerald-700 font-bold">Auto-deploy on PR open</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel" onClick={onClose} disabled={publishing}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="confirm flex items-center gap-1.5"
                  disabled={publishing || editedSections.length === 0}
                  id="confirm-create-pr-btn"
                >
                  <GitPullRequest size={13} />
                  {publishing ? 'Pushing Commit & Creating PR…' : 'Create Pull Request & Preview ↗'}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
};
