export type EditableKind =
  | 'Copy'
  | 'Image'
  | 'Link'
  | 'SEO'
  | 'Code'
  | 'Style'
  | 'Navigation'
  | 'Commerce'
  | 'Form'
  | 'Component';

export interface Section {
  id: string;
  label: string;
  kind: EditableKind;
  value: string;
  originalValue: string;
  note: string;
  sourcePath?: string;
  selector?: string;
  discoverableOnly?: boolean;
  codeLanguage?: 'html' | 'javascript' | 'css' | 'json';
  category?: string;
  options?: string[];
  meta?: Record<string, any>;
}

export type WebsiteType =
  | 'Static / Custom Code'
  | 'Headless CMS'
  | 'WordPress'
  | 'Shopify / WooCommerce'
  | 'SaaS / Custom App';

export interface WebsiteConnections {
  sourceProviderId?: string; // 'github', 'gitlab', etc.
  sourceRepo?: string;       // e.g. 'squargraph/studio-web'
  sourceBranch?: string;     // e.g. 'main'
  deployProviderId?: string; // 'cloudflare', 'vercel', etc.
  deployProject?: string;    // e.g. 'squargraph-worker'
  cmsProviderId?: string;    // 'sanity', 'strapi', etc.
}

export interface Website {
  id: string;
  name: string;
  url: string;
  state: 'Connected' | 'Needs connection' | 'Configuring';
  color: string;
  type: WebsiteType;
  environment: 'production' | 'staging' | 'preview';
  connections: WebsiteConnections;
  lastScanAt?: string;
  detectedStack?: string[];
}

export type Role = 'owner' | 'admin' | 'editor' | 'reviewer' | 'viewer';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  currentRole: Role;
  members: Member[];
}

export interface ProviderConnection {
  id: string;
  name: string;
  category: 'Source & delivery' | 'Data & content' | 'Communication' | 'Commerce' | 'Operations & insights';
  providers: string[];
  purpose: string;
  status: 'connected' | 'needs_auth' | 'pending';
  connectedProvider?: string;
  repoOrAccount?: string;
  scopes?: string[];
  lastVerified?: string;
  isEncrypted: boolean;
}

export interface DraftChange {
  sectionId: string;
  label: string;
  kind: EditableKind;
  oldValue: string;
  newValue: string;
  sourcePath: string;
  timestamp: string;
}

export interface PublishJob {
  id: string;
  websiteId: string;
  websiteName: string;
  branchName: string;
  baseBranch: string;
  prNumber: number;
  prUrl: string;
  prTitle: string;
  prDescription: string;
  previewUrl: string;
  status: 'open' | 'merged' | 'closed' | 'rolled_back';
  commitHash: string;
  actorName: string;
  createdAt: string;
  changes: DraftChange[];
  rolledBackAt?: string;
}

export interface AuditEvent {
  id: string;
  eventType: 'scan' | 'draft_save' | 'pr_created' | 'deploy_preview' | 'rollback' | 'provider_connect' | 'workspace_switch';
  title: string;
  description: string;
  websiteName: string;
  actor: string;
  timestamp: string;
  status: 'Live' | 'Ready' | 'Pending' | 'Rolled back' | 'Verified';
  rollbackAvailable?: boolean;
  publishJobId?: string;
  meta?: Record<string, any>;
}

// Adapter Contracts as specified in specification
export interface WebsiteManifest {
  siteUrl: string;
  defaultBranch: string;
  detectedFiles: string[];
  supportedSections: string[];
}

export interface ChangeSet {
  branchName: string;
  commitMessage: string;
  changes: DraftChange[];
  unifiedDiff: string;
}

export interface PublishResult {
  success: boolean;
  jobId: string;
  prNumber: number;
  prUrl: string;
  branchName: string;
  previewUrl: string;
  message: string;
}

export interface DeploymentStatus {
  service: string;
  environment: string;
  status: 'healthy' | 'deploying' | 'error';
  lastDeployedRevision: string;
  previewUrl: string;
}
