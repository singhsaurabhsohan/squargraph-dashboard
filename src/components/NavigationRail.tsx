import React from 'react';
import { Workspace, Role, UserAccount } from '../types';
import {
  Code,
  FolderArchive,
  UserCheck,
  CreditCard,
  Layers,
  Globe,
  Activity,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavigationRailProps {
  currentView: 'workspace' | 'code' | 'media' | 'sites' | 'integrations' | 'activity';
  onSelectView: (view: 'workspace' | 'code' | 'media' | 'sites' | 'integrations' | 'activity') => void;
  activeWorkspace: Workspace;
  onOpenWorkspaceModal: () => void;
  currentUser: UserAccount;
  onOpenAccountModal: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  currentView,
  onSelectView,
  activeWorkspace,
  onOpenWorkspaceModal,
  currentUser,
  onOpenAccountModal,
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
        <p className="product">SITE CONTROL & IDE</p>

        {/* Multi-tenant workspace switcher */}
        <div
          className="workspace-selector"
          onClick={onOpenWorkspaceModal}
          id="workspace-switcher-btn"
          title="Switch tenancy workspace"
        >
          <label>TENANT WORKSPACE</label>
          <div className="ws-name">
            <span className="truncate">{activeWorkspace.name}</span>
            <span className="role-tag">{activeWorkspace.currentRole}</span>
          </div>
        </div>
      </div>

      <nav aria-label="Main navigation" id="rail-nav">
        <div className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 px-3 pt-4 pb-1">
          Development Core
        </div>
        <button
          className={currentView === 'workspace' ? 'active' : ''}
          onClick={() => onSelectView('workspace')}
          id="nav-btn-workspace"
        >
          <b>01</b>Visual Editor
        </button>
        <button
          className={currentView === 'code' ? 'active' : ''}
          onClick={() => onSelectView('code')}
          id="nav-btn-code"
        >
          <b>02</b>Code & Config IDE
        </button>
        <button
          className={currentView === 'media' ? 'active' : ''}
          onClick={() => onSelectView('media')}
          id="nav-btn-media"
        >
          <b>03</b>Media & Storage
        </button>

        <div className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 px-3 pt-4 pb-1">
          Cloud & Ecosystem
        </div>
        <button
          className={currentView === 'sites' ? 'active' : ''}
          onClick={() => onSelectView('sites')}
          id="nav-btn-sites"
        >
          <b>04</b>Websites & CDN
        </button>
        <button
          className={currentView === 'integrations' ? 'active' : ''}
          onClick={() => onSelectView('integrations')}
          id="nav-btn-integrations"
        >
          <b>05</b>Integrations Hub
        </button>
        <button
          className={currentView === 'activity' ? 'active' : ''}
          onClick={() => onSelectView('activity')}
          id="nav-btn-activity"
        >
          <b>06</b>Audit & CI Deploys
        </button>
      </nav>

      {/* Account / Subscription Status Card in Rail Foot */}
      <div
        className="rail-foot cursor-pointer hover:bg-[#1b1f17] transition-colors rounded-xl p-2.5 mt-auto border border-[#262c20]"
        id="rail-user-profile"
        onClick={onOpenAccountModal}
        title="Manage User Account, SSO & Subscriptions"
      >
        <div className="flex items-center gap-2.5">
          <span className="avatar shrink-0">{currentUser.avatar || 'SS'}</span>
          <div className="overflow-hidden">
            <b className="truncate block text-white text-xs">{currentUser.name}</b>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 bg-lime-950 text-lime-400 border border-lime-800 rounded font-semibold">
                {currentUser.plan}
              </span>
              <small className="text-[10px] text-neutral-400 capitalize truncate">
                {currentUser.role}
              </small>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
