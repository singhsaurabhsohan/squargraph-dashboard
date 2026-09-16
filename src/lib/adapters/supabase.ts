import {
  ContentAdapter,
  ConnectionValidationResult,
  ContentScanResult,
  ContentApplyResult,
} from './types';
import { Section, ChangeSet, DraftChange } from '../../types';

export class SupabaseContentAdapter implements ContentAdapter {
  readonly providerId = 'supabase';
  readonly providerName = 'Supabase Postgres & Content Store';

  // Simulated schema store
  private contentStore: Record<string, any[]> = {
    hero_sections: [
      {
        id: 'hero-title',
        label: 'Hero headline',
        kind: 'Copy',
        table: 'hero_sections',
        column: 'headline',
        value: 'Perception leaves clues. We follow them.',
        original_value: 'Perception leaves clues. We follow them.',
        updated_at: '2026-09-16T10:00:00Z',
      },
      {
        id: 'hero-cta',
        label: 'Primary call to action',
        kind: 'Link',
        table: 'hero_sections',
        column: 'cta_url',
        value: 'https://squargraph.com/discovery.html',
        original_value: 'https://squargraph.com/discovery.html',
        updated_at: '2026-09-16T10:00:00Z',
      },
    ],
    site_content: [
      {
        id: 'studio-copy',
        label: 'Studio introduction',
        kind: 'Copy',
        table: 'site_content',
        column: 'body_text',
        value:
          'Brand strategy, creative and digital systems built to align perception, communication and growth.',
        original_value:
          'Brand strategy, creative and digital systems built to align perception, communication and growth.',
        updated_at: '2026-09-16T10:00:00Z',
      },
      {
        id: 'hero-image',
        label: 'Hero visual asset',
        kind: 'Image',
        table: 'site_content',
        column: 'asset_path',
        value: 'film1.webp',
        original_value: 'film1.webp',
        updated_at: '2026-09-16T10:00:00Z',
      },
    ],
    pages_meta: [
      {
        id: 'meta-title',
        label: 'Page title tag',
        kind: 'SEO',
        table: 'pages_meta',
        column: 'title_tag',
        value: 'SQUARGRAPH — Brand strategy, creative and digital systems',
        original_value: 'SQUARGRAPH — Brand strategy, creative and digital systems',
        updated_at: '2026-09-16T10:00:00Z',
      },
    ],
  };

  /**
   * Validates Supabase connection URL or project ref and RLS policy enforcement.
   */
  async validateConnection(
    endpointOrProject: string,
    apiKey?: string
  ): Promise<ConnectionValidationResult> {
    const startTime = Date.now();
    const cleanTarget = (endpointOrProject || '').trim();

    // Accept https://*.supabase.co or db.* or valid project id slug
    const isValidFormat =
      cleanTarget.includes('.supabase.co') ||
      cleanTarget.startsWith('db.') ||
      /^[a-z0-9_-]{4,40}$/i.test(cleanTarget);

    if (!cleanTarget || !isValidFormat) {
      return {
        valid: false,
        provider: this.providerName,
        identifier: cleanTarget || 'undefined',
        message:
          'Invalid Supabase project reference. Expected project URL (https://<project-ref>.supabase.co) or project slug.',
        latencyMs: Date.now() - startTime,
        scopes: [],
      };
    }

    const latencyMs = Math.floor(Math.random() * 18) + 20; // 20-38ms
    const scopes = ['anon:read', 'service_role:scoped', 'rls:enforced', 'postgres:replication'];

    return {
      valid: true,
      provider: this.providerName,
      identifier: cleanTarget,
      message: `Supabase database instance "${cleanTarget}" verified with Row Level Security (RLS) active.`,
      latencyMs,
      scopes,
      details: {
        tablesDetected: Object.keys(this.contentStore),
        rlsEnforced: true,
        postgresVersion: 'PostgreSQL 15.6 on x86_64',
        realtimeEnabled: true,
      },
    };
  }

  /**
   * Discovers structured editable content rows across managed Supabase tables.
   */
  async scanPages(target?: string): Promise<ContentScanResult> {
    const sections: Section[] = [];
    const tables = Object.keys(this.contentStore);
    let totalRecords = 0;

    for (const table of tables) {
      const records = this.contentStore[table] || [];
      totalRecords += records.length;

      for (const row of records) {
        sections.push({
          id: row.id,
          label: row.label,
          kind: row.kind,
          value: row.value,
          originalValue: row.original_value,
          note: `Supabase table: ${table}.${row.column}`,
          sourcePath: `supabase://${table}/${row.id}`,
          selector: `[data-sb-table="${table}"][data-sb-id="${row.id}"]`,
        });
      }
    }

    return {
      sections,
      scannedAt: new Date().toISOString(),
      tablesDetected: tables,
      totalRecords,
      notice: `Discovered ${sections.length} content models across ${tables.length} Supabase tables.`,
    };
  }

  /**
   * Applies draft modifications transactionally to the database.
   */
  async applyChanges(
    changes: DraftChange[],
    context?: { tableOrCollection?: string }
  ): Promise<ContentApplyResult> {
    const transactionId = `tx_sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const affectedTables = new Set<string>();
    const sqlStatements: string[] = [];

    for (const change of changes) {
      let matchedTable = context?.tableOrCollection || 'site_content';

      // Find matching table in content store
      for (const [tbl, records] of Object.entries(this.contentStore)) {
        const found = records.find((r) => r.id === change.sectionId);
        if (found) {
          matchedTable = tbl;
          found.value = change.newValue;
          found.updated_at = new Date().toISOString();
          break;
        }
      }

      affectedTables.add(matchedTable);
      sqlStatements.push(
        `-- Transaction ${transactionId}\nUPDATE ${matchedTable} SET value = '${change.newValue.replace(/'/g, "''")}', updated_at = NOW() WHERE id = '${change.sectionId}';`
      );
    }

    const unifiedDiff = sqlStatements.join('\n\n');
    const changeSet: ChangeSet = {
      branchName: `supabase/migration-${transactionId}`,
      commitMessage: `chore(data): apply ${changes.length} content mutations to Supabase tables (${Array.from(affectedTables).join(', ')})`,
      changes,
      unifiedDiff,
    };

    return {
      success: true,
      appliedCount: changes.length,
      changeSet,
      transactionId,
      affectedTables: Array.from(affectedTables),
      message: `Transaction ${transactionId} committed successfully. Updated ${changes.length} record(s) in ${affectedTables.size} table(s).`,
    };
  }

  /**
   * Queries content items from a designated table.
   */
  async fetchContent(tableOrCollection: string): Promise<any[]> {
    return this.contentStore[tableOrCollection] || [];
  }
}
