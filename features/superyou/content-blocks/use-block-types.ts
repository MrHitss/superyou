'use client';

import { useQuery } from '@tanstack/react-query';
import { BLOCK_TYPE_DEFINITIONS, type BlockTypeDefinition } from './block-type-schema';
import { fetchBlockTypes, getBaseUrl } from './block-types-api';

const QUERY_KEY = ['block_types'] as const;

/**
 * Fetches block types from superyou-be when NEXT_PUBLIC_SUPERYOU_API_BASE is set.
 * GET {NEXT_PUBLIC_SUPERYOU_API_BASE}/block_types
 * Falls back to static BLOCK_TYPE_DEFINITIONS when env is unset or the request fails.
 */
export function useBlockTypes(): {
  blockTypes: BlockTypeDefinition[];
  isLoading: boolean;
  error: Error | null;
} {
  const baseUrl = getBaseUrl()?.trim();
  const { data, isLoading, error } = useQuery({
    queryKey: [...QUERY_KEY, baseUrl ?? 'static'],
    queryFn: async () => {
      if (!baseUrl) {
        return BLOCK_TYPE_DEFINITIONS;
      }
      try {
        return await fetchBlockTypes();
      } catch (e) {
        console.warn('Block types API failed, using static definitions', e);
        return BLOCK_TYPE_DEFINITIONS;
      }
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    placeholderData: BLOCK_TYPE_DEFINITIONS,
  });

  return {
    blockTypes: data ?? BLOCK_TYPE_DEFINITIONS,
    isLoading,
    error: error as Error | null,
  };
}
