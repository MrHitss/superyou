/**
 * Blocks API client for superyou-be.
 * Base URL: NEXT_PUBLIC_SUPERYOU_API_BASE (e.g. https://api.example.com/api/v1).
 * Endpoints: GET/POST /me/link/blocks, GET/PATCH/DELETE /me/link/blocks/:uuid.
 * All block routes require Authorization: Bearer <token> (session.beeToken).
 */

import type {
  ApiBlockPayload,
  ApiBlockResponse,
  ApiBlockSchedule,
  ProfileBlocksResponse,
  MeLinkPageData,
  MeLinkPageResponse,
} from './api-types';
import type {
  ContentBlock,
  HeaderBlock,
  LinkBlock,
  WhatsAppBlock,
  FormBlock,
  CarouselBlock,
  CarouselCard,
  ContentBlockSchedule,
} from './types';
import { getBaseUrl } from './block-types-api';

// ---------- API response -> ContentBlock (for FE state) ----------

function apiScheduleToFe(schedule?: ApiBlockSchedule): ContentBlockSchedule | undefined {
  if (!schedule?.start_at && !schedule?.end_at) return undefined;
  return {
    appearAt: schedule.start_at,
    disappearAt: schedule.end_at,
  };
}

function apiBlockToContentBlock(api: ApiBlockResponse, position: number): ContentBlock {
  const base = {
    id: api.uuid,
    type: api.block_type,
    visible: api.is_active,
    order: position,
  };
  const schedule = apiScheduleToFe(
    (api.settings_json as { schedule?: ApiBlockSchedule })?.schedule,
  );
  const layout = (api.settings_json as { layout?: string })?.layout;
  const animation = (api.settings_json as { animation?: string })?.animation;

  switch (api.block_type) {
    case 'header': {
      const c = api.content_json as { title: string };
      return {
        ...base,
        type: 'header',
        text: c.title ?? '',
        schedule,
        layout: layout as HeaderBlock['layout'],
        animation: animation as HeaderBlock['animation'],
      } as HeaderBlock;
    }
    case 'link': {
      const c = api.content_json as { title: string; description?: string; thumbnail?: string; cta?: string; url: string };
      const isHighlight = (api.settings_json as { is_highlight?: boolean })?.is_highlight ?? false;
      return {
        ...base,
        type: 'link',
        title: c.title ?? '',
        url: c.url ?? '#',
        shortDescription: c.description,
        thumbnailUrl: c.thumbnail ?? api.thumbnail_url ?? undefined,
        ctaText: c.cta,
        schedule,
        layout: layout as LinkBlock['layout'],
        animation: animation as LinkBlock['animation'],
        is_highlight: isHighlight,
        favourite: isHighlight,
      } as LinkBlock & { is_highlight?: boolean };
    }
    case 'whatsapp': {
      const c = api.content_json as {
        title: string;
        description?: string;
        thumbnail?: string;
        cta?: string;
        phone_code: string;
        number: string;
        prefilled_message?: string;
      };
      return {
        ...base,
        type: 'whatsapp',
        title: c.title ?? '',
        phone_code: c.phone_code ?? '',
        number: c.number ?? '',
        shortDescription: c.description,
        thumbnailUrl: c.thumbnail ?? api.thumbnail_url ?? undefined,
        ctaText: c.cta,
        prefilled_message: c.prefilled_message,
        schedule,
        layout: layout as WhatsAppBlock['layout'],
        animation: animation as WhatsAppBlock['animation'],
      } as WhatsAppBlock;
    }
    case 'form': {
      const c = api.content_json as { form_id: string };
      return {
        ...base,
        type: 'form',
        form_id: c.form_id ?? '',
        schedule,
        layout: layout as FormBlock['layout'],
        animation: animation as FormBlock['animation'],
      } as FormBlock;
    }
    case 'carousel': {
      const c = api.content_json as { title: string };
      const children = api.children ?? [];
      const cards: CarouselCard[] = children.map((child, i) => apiChildToCarouselCard(child, i));
      return {
        ...base,
        type: 'carousel',
        title: c.title ?? 'Enter carousel title',
        cards,
        schedule,
        animation: animation as CarouselBlock['animation'],
      } as CarouselBlock;
    }
    default:
      return base as ContentBlock;
  }
}

function apiChildToCarouselCard(api: ApiBlockResponse, index: number): CarouselCard {
  const blockType = api.block_type as 'link' | 'whatsapp' | 'form';
  const base = { id: api.uuid };
  if (blockType === 'link') {
    const c = api.content_json as { title: string; description?: string; thumbnail?: string; cta?: string; url: string };
    return {
      ...base,
      blockType: 'link',
      title: c.title,
      url: c.url,
      shortDescription: c.description,
      thumbnailUrl: c.thumbnail ?? undefined,
      ctaText: c.cta,
    };
  }
  if (blockType === 'whatsapp') {
    const c = api.content_json as {
      title: string;
      phone_code: string;
      number: string;
      prefilled_message?: string;
    };
    return {
      ...base,
      blockType: 'whatsapp',
      title: c.title,
      phone_code: c.phone_code,
      number: c.number,
      prefilled_message: c.prefilled_message,
    };
  }
  const c = api.content_json as { form_id: string };
  return { ...base, blockType: 'form', title: 'Form', form_id: c.form_id };
}

/**
 * Convert API profile blocks response to flat ContentBlock[] (top-level + carousel cards inlined).
 */
export function profileBlocksResponseToContentBlocks(res: ProfileBlocksResponse): ContentBlock[] {
  return (res.blocks ?? []).map((api, position) => apiBlockToContentBlock(api, position));
}

// ---------- ContentBlock -> API payload (for create/update) ----------

function feScheduleToApi(schedule?: ContentBlockSchedule): ApiBlockSchedule | undefined {
  if (!schedule?.appearAt && !schedule?.disappearAt) return undefined;
  return {
    start_at: schedule.appearAt,
    end_at: schedule.disappearAt,
  };
}

/**
 * Build API create/update payload from a ContentBlock.
 * Use for top-level blocks only (parent_id = null). For carousel children use contentBlockToApiPayload with parentId.
 */
export function contentBlockToApiPayload(
  block: ContentBlock,
  profileId: string,
  position: number,
  parentId?: string | null,
): ApiBlockPayload {
  const parent_id = parentId ?? null;
  const schedule = feScheduleToApi(block.schedule);
  const baseSettings = {
    layout: block.layout,
    animation: block.animation,
    ...(schedule && { schedule }),
  };

  switch (block.type) {
    case 'header':
      return {
        uuid: block.id,
        profile_id: profileId,
        block_type: 'header',
        parent_id,
        position,
        thumbnail_url: null,
        content_json: { title: block.text },
        settings_json: { alignment: 'center', ...baseSettings },
        is_active: block.visible,
      };
    case 'link':
      return {
        uuid: block.id,
        profile_id: profileId,
        block_type: 'link',
        parent_id,
        position,
        thumbnail_url: block.thumbnailUrl ?? null,
        content_json: {
          title: block.title,
          description: block.shortDescription,
          thumbnail: block.thumbnailUrl,
          cta: block.ctaText,
          url: block.url,
        },
        settings_json: {
          ...baseSettings,
          is_highlight: (block as LinkBlock & { is_highlight?: boolean }).is_highlight ?? (block as { favourite?: boolean }).favourite ?? false,
        },
        is_active: block.visible,
      };
    case 'whatsapp':
      return {
        uuid: block.id,
        profile_id: profileId,
        block_type: 'whatsapp',
        parent_id,
        position,
        thumbnail_url: block.thumbnailUrl ?? null,
        content_json: {
          title: block.title,
          description: block.shortDescription,
          thumbnail: block.thumbnailUrl,
          cta: block.ctaText,
          phone_code: block.phone_code,
          number: block.number,
          prefilled_message: block.prefilled_message,
        },
        settings_json: baseSettings,
        is_active: block.visible,
      };
    case 'form':
      return {
        uuid: block.id,
        profile_id: profileId,
        block_type: 'form',
        parent_id,
        position,
        thumbnail_url: null,
        content_json: { form_id: block.form_id },
        settings_json: baseSettings,
        is_active: block.visible,
      };
    case 'carousel':
      return {
        uuid: block.id,
        profile_id: profileId,
        block_type: 'carousel',
        parent_id,
        position,
        thumbnail_url: null,
        content_json: { title: block.title },
        settings_json: baseSettings,
        is_active: block.visible,
      };
    default:
      return {
        uuid: block.id,
        profile_id: profileId,
        block_type: 'link',
        parent_id,
        position,
        thumbnail_url: null,
        content_json: { title: (block as LinkBlock).title ?? '', url: (block as LinkBlock).url ?? '#' },
        settings_json: baseSettings,
        is_active: block.visible,
      };
  }
}

/**
 * Build API payload for a carousel child card (link/whatsapp/form).
 */
export function carouselCardToApiPayload(
  card: CarouselCard,
  profileId: string,
  parentBlockId: string,
  position: number,
): ApiBlockPayload {
  const blockType = card.blockType ?? 'link';
  const base = {
    uuid: card.id,
    profile_id: profileId,
    parent_id: parentBlockId,
    position,
    thumbnail_url: (card.thumbnailUrl ?? null) as string | null,
    is_active: true,
  };
  if (blockType === 'link') {
    return {
      ...base,
      block_type: 'link',
      content_json: {
        title: card.title ?? 'New link',
        description: card.shortDescription,
        thumbnail: card.thumbnailUrl,
        cta: card.ctaText,
        url: card.url ?? '#',
      },
      settings_json: { layout: 'minimal', animation: 'none', is_highlight: false },
    };
  }
  if (blockType === 'whatsapp') {
    return {
      ...base,
      block_type: 'whatsapp',
      content_json: {
        title: card.title ?? 'WhatsApp',
        phone_code: card.phone_code ?? '',
        number: card.number ?? '',
        prefilled_message: card.prefilled_message,
      },
      settings_json: { layout: 'card', animation: 'fade' },
    };
  }
  return {
    ...base,
    block_type: 'form',
    thumbnail_url: null,
    content_json: { form_id: card.form_id ?? '' },
    settings_json: { layout: 'card', animation: 'zoom' },
  };
}

// ---------- API client ----------

function authHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Get current user's profile link (slug).
 * GET {base}/me/link → { link, slug }
 */
export async function getProfileLink(token: string): Promise<{ link: string; slug: string }> {
  const base = getBaseUrl();
  if (!base?.trim()) return Promise.reject(new Error('NEXT_PUBLIC_SUPERYOU_API_BASE is not set'));
  const url = `${base.replace(/\/$/, '')}/me/link`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Profile link API error: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { link?: string; slug?: string };
  const slug = json.slug ?? json.link ?? '';
  return { link: slug, slug };
}

/**
 * Fetch full me/link page data for preview (profile, layout, social_media, blocks).
 * GET {base}/me/link → { data: { profile, layout, social_media, blocks } }
 * Falls back to minimal data if API returns only { link, slug }.
 */
export async function fetchMeLinkPage(token: string): Promise<MeLinkPageData | null> {
  const base = getBaseUrl();
  if (!base?.trim()) return null;
  const url = `${base.replace(/\/$/, '')}/me/link`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders(token) });
  if (!res.ok) return null;
  const json = (await res.json()) as MeLinkPageResponse | MeLinkPageData | { link?: string; slug?: string };
  if (!json || typeof json !== 'object') return null;
  if ('data' in json && json.data && typeof json.data === 'object') {
    return json.data as MeLinkPageData;
  }
  if ('blocks' in json && Array.isArray((json as MeLinkPageData).blocks)) {
    return json as MeLinkPageData;
  }
  return null;
}

/**
 * Fetch blocks for the current user's profile.
 * GET {base}/me/link/blocks → { profile_id, blocks } (tree with children for carousel).
 */
export async function fetchProfileBlocks(token: string): Promise<ProfileBlocksResponse> {
  const base = getBaseUrl();
  if (!base?.trim()) return Promise.reject(new Error('NEXT_PUBLIC_SUPERYOU_API_BASE is not set'));
  const url = `${base.replace(/\/$/, '')}/me/link/blocks`;
  const res = await fetch(url, { method: 'GET', headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Blocks API error: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as ProfileBlocksResponse;
  if (!json.blocks) throw new Error('Invalid blocks response');
  return json;
}

/**
 * Create a block.
 * POST {base}/me/link/blocks — body: block_type, parent_id, position, content_json, settings_json, etc.
 * Response: { profile_id, block }.
 */
export async function createBlock(
  token: string,
  payload: ApiBlockPayload,
): Promise<ApiBlockResponse> {
  const base = getBaseUrl();
  if (!base?.trim()) return Promise.reject(new Error('NEXT_PUBLIC_SUPERYOU_API_BASE is not set'));
  const url = `${base.replace(/\/$/, '')}/me/link/blocks`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Create block error: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { profile_id?: string; block?: ApiBlockResponse };
  if (!json.block) throw new Error('Create block failed');
  return json.block;
}

/**
 * Update a block. PATCH {base}/me/link/blocks/:uuid
 * Body: optional parent_id, position, thumbnail_url, content_json, settings_json, is_active.
 */
export async function updateBlock(
  token: string,
  uuid: string,
  payload: Partial<ApiBlockPayload>,
): Promise<ApiBlockResponse> {
  const base = getBaseUrl();
  if (!base?.trim()) return Promise.reject(new Error('NEXT_PUBLIC_SUPERYOU_API_BASE is not set'));
  const url = `${base.replace(/\/$/, '')}/me/link/blocks/${encodeURIComponent(uuid)}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Update block error: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { profile_id?: string; block?: ApiBlockResponse };
  if (!json.block) throw new Error('Update block failed');
  return json.block;
}

/**
 * Delete a block. DELETE {base}/me/link/blocks/:uuid
 */
export async function deleteBlock(token: string, uuid: string): Promise<void> {
  const base = getBaseUrl();
  if (!base?.trim()) return Promise.reject(new Error('NEXT_PUBLIC_SUPERYOU_API_BASE is not set'));
  const url = `${base.replace(/\/$/, '')}/me/link/blocks/${encodeURIComponent(uuid)}`;
  const res = await fetch(url, { method: 'DELETE', headers: authHeaders(token) });
  if (!res.ok) throw new Error(`Delete block error: ${res.status} ${res.statusText}`);
}
