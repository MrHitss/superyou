'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getProfileLink,
  fetchProfileBlocks,
  createBlock as createBlockApi,
  updateBlock as updateBlockApi,
  deleteBlock as deleteBlockApi,
  profileBlocksResponseToContentBlocks,
} from './blocks-api';
import { getBaseUrl } from './block-types-api';
import type { ContentBlock } from './types';
import type { ApiBlockPayload } from './api-types';

export interface RefetchOptions {
  invalidatePreview?: boolean;
  /** Delay refetch by this many ms (e.g. 600). Use after mutations so open dropdowns/inputs aren’t closed by the state update. */
  debounceMs?: number;
}

export interface UseProfileBlocksResult {
  blocks: ContentBlock[];
  profileId: string | null;
  profileSlug: string | null;
  isLoading: boolean;
  error: string | null;
  refetch: (options?: RefetchOptions) => Promise<void>;
  apiEnabled: boolean;
  createBlock: (payload: ApiBlockPayload) => Promise<ContentBlock | null>;
  updateBlock: (uuid: string, payload: Partial<ApiBlockPayload>) => Promise<ContentBlock | null>;
  deleteBlock: (uuid: string) => Promise<boolean>;
  reorderBlocks: (orderedBlocks: ContentBlock[]) => Promise<boolean>;
}

const EMPTY_BLOCKS: ContentBlock[] = [];

const ME_LINK_PAGE_QUERY_KEY = ['me_link_page'];

export function useProfileBlocks(initialBlocks: ContentBlock[] = EMPTY_BLOCKS): UseProfileBlocksResult {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const token = (session as { beeToken?: string } | null)?.beeToken ?? null;
  const baseUrl = typeof window !== 'undefined' ? getBaseUrl() : undefined;
  const apiEnabled = Boolean(token && baseUrl?.trim());

  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileSlug, setProfileSlug] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(apiEnabled);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedSlug = useRef(false);
  const initialBlocksRef = useRef(initialBlocks);
  initialBlocksRef.current = initialBlocks;
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performRefetch = useCallback(
    async (opts?: { invalidatePreview?: boolean }) => {
      if (!token) return;
      setIsLoading(true);
      setError(null);
      try {
        if (!hasFetchedSlug.current) {
          const link = await getProfileLink(token);
          setProfileSlug(link.slug);
          hasFetchedSlug.current = true;
        }
        const res = await fetchProfileBlocks(token);
        setProfileId(res.profile_id ?? null);
        setBlocks(profileBlocksResponseToContentBlocks(res));
        if (opts?.invalidatePreview) {
          void queryClient.invalidateQueries({ queryKey: ME_LINK_PAGE_QUERY_KEY });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load blocks');
        setBlocks(initialBlocksRef.current.length ? initialBlocksRef.current : []);
      } finally {
        setIsLoading(false);
      }
    },
    [token, queryClient],
  );

  const refetch = useCallback(
    async (options?: RefetchOptions) => {
      const debounceMs = options?.debounceMs;
      if (debounceMs != null && debounceMs > 0) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
          debounceTimerRef.current = null;
          void performRefetch({ invalidatePreview: options?.invalidatePreview });
        }, debounceMs);
        return;
      }
      await performRefetch(options);
    },
    [performRefetch],
  );

  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (!apiEnabled) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      hasFetchedSlug.current = false;
      setBlocks(initialBlocks.length ? initialBlocks : EMPTY_BLOCKS);
      setProfileId(null);
      setProfileSlug(null);
      setError(null);
      setIsLoading(false);
      return;
    }
    refetchRef.current();
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, [apiEnabled]);

  const REFETCH_DEBOUNCE_MS = 600;

  const createBlock = useCallback(
    async (payload: ApiBlockPayload): Promise<ContentBlock | null> => {
      if (!token) return null;
      try {
        const created = await createBlockApi(token, payload);
        refetch({ invalidatePreview: true, debounceMs: REFETCH_DEBOUNCE_MS });
        return profileBlocksResponseToContentBlocks({ profile_id: '', blocks: [created] })[0] ?? null;
      } catch {
        return null;
      }
    },
    [token, refetch],
  );

  const updateBlock = useCallback(
    async (uuid: string, payload: Partial<ApiBlockPayload>): Promise<ContentBlock | null> => {
      if (!token) return null;
      try {
        const updated = await updateBlockApi(token, uuid, payload);
        refetch({ invalidatePreview: true, debounceMs: REFETCH_DEBOUNCE_MS });
        return profileBlocksResponseToContentBlocks({ profile_id: '', blocks: [updated] })[0] ?? null;
      } catch {
        return null;
      }
    },
    [token, refetch],
  );

  const deleteBlock = useCallback(
    async (uuid: string): Promise<boolean> => {
      if (!token) return false;
      try {
        await deleteBlockApi(token, uuid);
        refetch({ invalidatePreview: true, debounceMs: REFETCH_DEBOUNCE_MS });
        return true;
      } catch {
        return false;
      }
    },
    [token, refetch],
  );

  const reorderBlocks = useCallback(
    async (orderedBlocks: ContentBlock[]): Promise<boolean> => {
      if (!token || orderedBlocks.length === 0) return false;
      try {
        await Promise.all(
          orderedBlocks.map((block, position) =>
            updateBlockApi(token, block.id, { position }),
          ),
        );
        refetch({ invalidatePreview: true, debounceMs: REFETCH_DEBOUNCE_MS });
        return true;
      } catch {
        return false;
      }
    },
    [token, refetch],
  );

  return {
    blocks,
    profileId,
    profileSlug,
    isLoading,
    error,
    refetch,
    apiEnabled,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  };
}
