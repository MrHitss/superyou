/**
 * Profiles API client for superyou-be.
 * Endpoint: PATCH {base}/me/link (profile from JWT; no profile_id in path)
 * Updates profile identity data and/or layout configuration.
 * Requires Authorization: Bearer <token> (session.beeToken).
 */

import { getBaseUrl } from './block-types-api';
import {
  type ProfileUpdatePayload,
  safeParseProfileUpdatePayload,
} from './profile-update-schema';

function authHeaders(token: string): HeadersInit {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export interface UpdateProfileResult {
  success: true;
}

export interface UpdateProfileError {
  success: false;
  message: string;
  validation?: { path: (string | number)[]; message: string }[];
}

/** Map frontend footer_position to backend values (superyou-be: stick_on_scroll | fixed_to_bottom). */
function mapFooterPositionForBackend(value: 'scroll' | 'fixed' | undefined): string | undefined {
  if (value === 'scroll') return 'stick_on_scroll';
  if (value === 'fixed') return 'fixed_to_bottom';
  return undefined;
}

function buildMeLinkPatchBody(payload: ProfileUpdatePayload): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.profile != null && Object.keys(payload.profile).length > 0) {
    body.profile = payload.profile;
  }
  if (payload.layout != null && Object.keys(payload.layout).length > 0) {
    const layout = { ...payload.layout };
    const fp = mapFooterPositionForBackend(layout.footer_position);
    if (fp !== undefined) {
      layout.footer_position = fp;
    }
    body.layout = layout;
  }
  return body;
}

/**
 * Update profile settings for the current user's profile.
 * Calls PATCH {base}/me/link — backend derives profile from JWT.
 *
 * @param token - Bearer token (e.g. session.beeToken)
 * @param _profileId - Unused; kept for compatibility. Backend uses JWT.
 * @param payload - Profile identity and/or layout (validated)
 */
export async function updateProfile(
  token: string,
  _profileId: string,
  payload: ProfileUpdatePayload,
): Promise<UpdateProfileResult | UpdateProfileError> {
  const parsed = safeParseProfileUpdatePayload(payload);
  if (!parsed.success) {
    return {
      success: false,
      message: 'Validation failed',
      validation: parsed.error.errors.map((e) => ({
        path: e.path,
        message: e.message,
      })),
    };
  }

  const base = getBaseUrl();
  if (!base?.trim()) {
    return { success: false, message: 'NEXT_PUBLIC_SUPERYOU_API_BASE is not set' };
  }

  const url = `${base.replace(/\/$/, '')}/me/link`;
  const body = buildMeLinkPatchBody(parsed.data);
  const res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let message: string;
    try {
      const json = JSON.parse(text) as { error?: string; message?: string };
      message = json.error ?? json.message ?? res.statusText;
    } catch {
      message = text || res.statusText;
    }
    return { success: false, message: `Profile update failed: ${message}` };
  }

  return { success: true };
}
