import React from 'react';
import { Workspace, Role } from '../types';

interface NavigationRailProps {
  currentView: 'workspace' | 'sites' | 'integrations' | 'activity';
  onSelectView: (view: 'workspace' | 'sites' | 'integrations' | 'activity') => void;
  activeWorkspace: Workspace;
  onOpenWorkspaceModal: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentView,
  onSelectView,
  activeWorkspace,
  onOpenWorkspaceModal,
}) => {
  return (
    <aside className="rail" id="main-navigation-rail">
      <div>
        <a
          className="wordmark"
          href="#workspace"
          onClick={(e) => {
            e.preventDefault();
            onSelectView('workspace');
          }}
          id="brand-wordmark"
        >
          SQUARGRAPH<span>™</span>
        </a>
        <p className="product">SITE CONTROL</p>

        {/* Multi-tenant workspace switcher */}
        <div
          className="workspace-selector"
          onClick={onOpenWorkspaceModal}
          id="workspace-switcher-btn"
          title="Switch tenancy workspace"
        >
          <label>TENANT WORKSPACE</label>
          <div className="ws-name">
            <span>{activeWorkspace.name}</span>
            <span className="role-tag">{activeWorkspace.currentRole}</span>
          </div>
        </div>
      </div>

      <nav aria-label="Main navigation" id="rail-nav">
        <button
          className={currentView === 'workspace' ? 'active' : ''}
          onClick={() => onSelectView('workspace')}
          id="nav-btn-workspace"
        >
          <b>01</b>Workspace
        </button>
        <button
          className={currentView === 'sites' ? 'active' : ''}
          onClick={() => onSelectView('sites')}
          id="nav-btn-sites"
        >
          <b>02</b>Websites
        </button>
        <button
          className={currentView === 'integrations' ? 'active' : ''}
          onClick={() => onSelectView('integrations')}
          id="nav-btn-integrations"
        >
          <b>03</b>Integrations
        </button>
        <button
          className={currentView === 'activity' ? 'active' : ''}
          onClick={() => onSelectView('activity')}
          id="nav-btn-activity"
        >
          <b>04</b>Activity
        </button>
      </nav>

      <div className="rail-foot" id="rail-user-profile">
        <span className="avatar">SS</span>
        <p>
          <b>Saurabh Singh</b>
          <small>{activeWorkspace.currentRole.toUpperCase()} · Verified</small>
        </p>
      </div>
    </aside>
  );
};
