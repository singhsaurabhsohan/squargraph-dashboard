import React, { useState } from 'react';
import { AuditEvent } from '../types';
import { RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface ActivityViewProps {
  auditEvents: AuditEvent[];
  onExecuteRollback: (publishJobId?: string) => Promise<void>;
}

export const ActivityView: React.FC<ActivityViewProps> = ({
  auditEvents,
  onExecuteRollback,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [rollbackCandidate, setRollbackCandidate] = useState<AuditEvent | null>(null);
  const [loadingRollback, setLoadingRollback] = useState(false);

  const filteredEvents = auditEvents.filter((ev) => {
    if (filterType === 'all') return true;
    if (filterType === 'pr') return ev.eventType === 'pr_created';
    if (filterType === 'scan') return ev.eventType === 'scan';
    if (filterType === 'rollback') return ev.eventType === 'rollback';
    return true;
  });

  const confirmRollback = async () => {
    if (!rollbackCandidate) return;
    setLoadingRollback(true);
    try {
      await onExecuteRollback(rollbackCandidate.publishJobId);
      setRollbackCandidate(null);
    } finally {
      setLoadingRollback(false);
    }
  };

  return (
    <section className="activity-view" id="publishing-activity-view">
      <p className="eyebrow">PUBLISHING HISTORY</p>
      <h2>Clear changes. Clear accountability.</h2>
      <p className="subcopy">
        Every website scan, draft modification, pull request generation, and deployment rollback is cryptographically tracked in this immutable audit stream.
      </p>

      {/* Filter Tabs */}
      <div className="activity-filters" id="activity-type-filters">
        <button
          className={filterType === 'all' ? 'active' : ''}
          onClick={() => setFilterType('all')}
        >
          All Events ({auditEvents.length})
        </button>
        <button
          className={filterType === 'pr' ? 'active' : ''}
          onClick={() => setFilterType('pr')}
        >
          Pull Requests
        </button>
        <button
          className={filterType === 'scan' ? 'active' : ''}
          onClick={() => setFilterType('scan')}
        >
          Scans
        </button>
        <button
          className={filterType === 'rollback' ? 'active' : ''}
          onClick={() => setFilterType('rollback')}
        >
          Rollbacks
        </button>
      </div>

      <div className="activity-list" id="audit-activity-list">
        {filteredEvents.map((ev, index) => {
          const isRollback = ev.eventType === 'rollback';
          return (
            <div className="activity-row" key={ev.id} id={`activity-item-${ev.id}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>

              <div>
                <b>{ev.title}</b>
                <small>
                  {ev.websiteName} · {ev.description} · By {ev.actor}
                </small>
              </div>

              <em className={isRollback ? 'rolled-back' : ''}>{ev.status}</em>

              {ev.rollbackAvailable ? (
                <button
                  className="rollback-btn"
                  onClick={() => setRollbackCandidate(ev)}
                  title="Revert this published revision"
                  id={`rollback-btn-${ev.id}`}
                >
                  <RotateCcw size={10} className="inline mr-1" /> Rollback
                </button>
              ) : (
                <div />
              )}

              <time>{ev.timestamp}</time>
            </div>
          );
        })}
      </div>

      {/* Rollback Confirmation Modal */}
      {rollbackCandidate && (
        <div className="modal-backdrop" id="rollback-confirm-modal">
          <div className="modal-card">
            <header>
              <div>
                <p className="eyebrow text-red-700 flex items-center gap-1 font-bold">
                  <AlertTriangle size={12} /> REVERT PUBLISHED REVISION
                </p>
                <h3>Confirm Deployment Rollback</h3>
              </div>
              <button
                className="close-btn"
                onClick={() => setRollbackCandidate(null)}
                disabled={loadingRollback}
              >
                ×
              </button>
            </header>

            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              You are about to revert <b>"{rollbackCandidate.title}"</b> on <b>{rollbackCandidate.websiteName}</b>.
            </p>

            <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 mb-4 space-y-1">
              <p><b>What this rollback will do:</b></p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Create an automated revert commit on the repository.</li>
                <li>Restore previous verified HTML and asset snapshots.</li>
                <li>Redeploy the previous healthy worker/edge build.</li>
                <li>Record the rollback execution in the permanent audit trail.</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel"
                onClick={() => setRollbackCandidate(null)}
                disabled={loadingRollback}
              >
                Cancel
              </button>
              <button
                type="button"
                className="!bg-red-700 hover:!bg-red-800 text-white px-4 py-2 rounded text-xs font-bold"
                onClick={confirmRollback}
                disabled={loadingRollback}
                id="confirm-rollback-btn"
              >
                {loadingRollback ? 'Rolling back…' : 'Execute Safe Rollback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
