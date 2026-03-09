'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { fetchMeLinkPage } from './blocks-api';
import type { MeLinkPageData } from './api-types';
import { getBaseUrl } from './block-types-api';

const QUERY_KEY = ['me_link_page'] as const;

export function useMeLinkPage(): {
  data: MeLinkPageData | null;
  isLoading: boolean;
  refetch: () => void;
} {
  const { data: session } = useSession();
  const token = (session as { beeToken?: string } | null)?.beeToken ?? null;
  const baseUrl = typeof window !== 'undefined' ? getBaseUrl() : undefined;
  const enabled = Boolean(token && baseUrl?.trim());

  const { data, isLoading, refetch } = useQuery({
    queryKey: [...QUERY_KEY, token ?? ''],
    queryFn: async () => (token ? fetchMeLinkPage(token) : null),
    enabled,
    staleTime: 60 * 1000,
  });

  return {
    data: data ?? null,
    isLoading,
    refetch,
  };
}
