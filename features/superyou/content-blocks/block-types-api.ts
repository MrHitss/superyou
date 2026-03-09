/**
 * Block types API client for superyou-be.
 * Base URL: NEXT_PUBLIC_SUPERYOU_API_BASE (e.g. https://api.example.com/api/v1)
 * Endpoint: GET {base}/block-types
 */

import type { BlockTypeDefinition } from './block-type-schema';

export interface BlockTypesApiResponse {
  success: boolean;
  message: string;
  data: BlockTypeDefinition[];
}

export function getBaseUrl(): string | undefined {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_SUPERYOU_API_BASE;
  return process.env.NEXT_PUBLIC_SUPERYOU_API_BASE;
}

export async function fetchBlockTypes(): Promise<BlockTypeDefinition[]> {
  const base = getBaseUrl();
  if (!base?.trim()) {
    return Promise.reject(new Error('NEXT_PUBLIC_SUPERYOU_API_BASE is not set'));
  }
  const url = base.replace(/\/$/, '') + '/block-types';
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`Block types API error: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as BlockTypesApiResponse;
  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(json.message ?? 'Invalid block types response');
  }
  return json.data;
}
