import React from 'react';
import { Workspace } from '../types';
import { Building, Users, Shield } from 'lucide-react';

interface WorkspaceModalProps {
  workspaces: Workspace[];
  currentWorkspaceId: string;
  onSwitchWorkspace: (workspaceId: string) => void;
  onClose: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  workspaces,
  currentWorkspaceId,
  onSwitchWorkspace,
  onClose,
}) => {
  return (
    <div className="modal-backdrop" id="workspace-modal">
      <div className="modal-card">
        <header>
          <div>
            <p className="eyebrow">MULTI-TENANCY VAULT</p>
            <h3>Workspace Directory</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </header>

        <p className="text-xs text-gray-600 mb-4">
          Each workspace encapsulates isolated website properties, provider connections, cryptographic secret references, and team permissions with Role-Based Access Control (RBAC).
        </p>

        <div className="space-y-3 mb-6">
          {workspaces.map((ws) => {
            const isSelected = ws.id === currentWorkspaceId;
            return (
              <div
                key={ws.id}
                onClick={() => {
                  onSwitchWorkspace(ws.id);
                  onClose();
                }}
                className={`p-3.5 border rounded cursor-pointer transition-all ${
                  isSelected
                    ? 'border-black bg-[#e9eee0]'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Building size={16} className={isSelected ? 'text-black' : 'text-gray-400'} />
                    <div>
                      <b className="text-sm block">{ws.name}</b>
                      <small className="text-gray-500 font-mono text-[10px]">
                        Slug: {ws.slug} · {ws.members.length} members
                      </small>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase px-2 py-1 bg-black/10 rounded">
                    Role: {ws.currentRole}
                  </span>
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users size={12} /> Team: {ws.members.map((m) => m.name.split(' ')[0]).join(', ')}
                  </div>
                  {isSelected && <span className="font-bold text-[#426a0b]">Active Tenant ✓</span>}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-gray-100 rounded text-[11px] text-gray-700 flex items-start gap-2">
          <Shield size={14} className="mt-0.5 text-gray-500 flex-shrink-0" />
          <span>
            <b>Least-Privilege Isolation:</b> Switching tenants rotates scoped API key credentials and audit namespaces.
          </span>
        </div>

        <div className="modal-actions">
          <button type="button" className="confirm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
