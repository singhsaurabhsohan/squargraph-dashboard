export * from './types';
export * from './github';
export * from './supabase';
export * from './wordpress';
export * from './shopify';
export * from './ecosystem';

import { GitHubSourceAdapter } from './github';
import { SupabaseContentAdapter } from './supabase';
import { WordPressContentAdapter } from './wordpress';
import { ShopifyContentAdapter } from './shopify';
import { SourceAdapter, ContentAdapter } from './types';

// Default instantiated singletons for immediate workspace use
export const defaultGitHubAdapter = new GitHubSourceAdapter();
export const defaultSupabaseAdapter = new SupabaseContentAdapter();
export const defaultWordPressAdapter = new WordPressContentAdapter();
export const defaultShopifyAdapter = new ShopifyContentAdapter();

/**
 * Factory function to retrieve or instantiate a SourceAdapter based on provider name.
 */
export function getSourceAdapter(provider = 'github'): SourceAdapter {
  const normalized = provider.toLowerCase();
  if (normalized.includes('git') || normalized.includes('github')) {
    return defaultGitHubAdapter;
  }
  // Default fallback is GitHub
  return defaultGitHubAdapter;
}

/**
 * Factory function to retrieve or instantiate a ContentAdapter based on provider name or website type.
 */
export function getContentAdapter(provider = 'supabase'): ContentAdapter {
  const normalized = provider.toLowerCase();
  if (normalized.includes('word') || normalized.includes('wp')) {
    return defaultWordPressAdapter;
  }
  if (normalized.includes('shop') || normalized.includes('commerce')) {
    return defaultShopifyAdapter;
  }
  if (normalized.includes('supabase') || normalized.includes('postgres')) {
    return defaultSupabaseAdapter;
  }
  return defaultSupabaseAdapter;
}
