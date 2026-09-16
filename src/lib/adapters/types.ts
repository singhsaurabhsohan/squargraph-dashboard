import {
  Section,
  WebsiteManifest,
  ChangeSet,
  PublishResult,
  DraftChange,
  Website,
} from '../../types';

export interface ConnectionValidationResult {
  valid: boolean;
  provider: string;
  identifier: string;
  message: string;
  latencyMs: number;
  scopes?: string[];
  details?: Record<string, any>;
}

export interface BranchCreationResult {
  branchName: string;
  commitSha: string;
  ref: string;
  baseBranch: string;
  createdAt: string;
}

export interface PullRequestParams {
  repo: string;
  baseBranch: string;
  branchName: string;
  title: string;
  description: string;
  changes: DraftChange[];
  reviewer?: string;
  labels?: string[];
}

export interface RollbackResult {
  success: boolean;
  rollbackCommit: string;
  targetBranch: string;
  revertedPrNumber?: number;
  message: string;
  timestamp: string;
}

export interface SourceAdapter {
  readonly providerId: string;
  readonly providerName: string;

  /**
   * Validates repository connection syntax, accessibility, and scopes.
   */
  validateConnection(repo: string, tokenOrKey?: string): Promise<ConnectionValidationResult>;

  /**
   * Retrieves file tree manifest and discoverable sections from source.
   */
  getRepositoryManifest(repo: string, branch?: string): Promise<WebsiteManifest>;

  /**
   * Creates a dedicated Git branch off the base branch for safe revision authoring.
   */
  createBranch(repo: string, baseBranch: string, branchNamePrefix?: string): Promise<BranchCreationResult>;

  /**
   * Formats draft modifications into a unified git diff and commit package.
   */
  createChangeSet(
    draftChanges: DraftChange[],
    options?: { branchName?: string; commitMessage?: string }
  ): Promise<ChangeSet>;

  /**
   * Generates a reviewable Pull Request with automated deployment preview trigger.
   */
  createPullRequest(params: PullRequestParams): Promise<PublishResult>;

  /**
   * Reverts a published commit or PR and restores previous verified revision.
   */
  rollback(repo: string, revisionOrJobId: string): Promise<RollbackResult>;
}

export interface ContentScanResult {
  sections: Section[];
  scannedAt: string;
  tablesDetected?: string[];
  totalRecords?: number;
  notice?: string;
}

export interface ContentApplyResult {
  success: boolean;
  appliedCount: number;
  changeSet: ChangeSet;
  transactionId: string;
  affectedTables: string[];
  message: string;
}

export interface ContentAdapter {
  readonly providerId: string;
  readonly providerName: string;

  /**
   * Validates database/CMS endpoint accessibility, credentials, and RLS policies.
   */
  validateConnection(endpointOrProject: string, apiKey?: string): Promise<ConnectionValidationResult>;

  /**
   * Discovers structured editable content models (tables, schemas, collections).
   */
  scanPages(target?: string): Promise<ContentScanResult>;

  /**
   * Applies draft modifications transactionally to the CMS/database.
   */
  applyChanges(
    changes: DraftChange[],
    context?: { tableOrCollection?: string }
  ): Promise<ContentApplyResult>;

  /**
   * Queries content items from a designated table or collection.
   */
  fetchContent(tableOrCollection: string): Promise<any[]>;
}
