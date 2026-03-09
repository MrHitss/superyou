/**
 * SuperYou BE auth API client.
 * Base URL: NEXT_PUBLIC_SUPERYOU_API_BASE (e.g. https://api.example.com/api/v1)
 * Endpoints: request-otp, login, register (and social login/register via same login/register with tokens).
 */

import type { DevicePayload } from './device-payload';

export function getAuthBaseUrl(): string | undefined {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_SUPERYOU_API_BASE;
  return process.env.NEXT_PUBLIC_SUPERYOU_API_BASE;
}

export interface RequestOtpPayload {
  phone: string;
  purpose: 'register' | 'login';
}

export interface LoginPayloadNumber {
  phone: string;
  otp: string;
  provider: 'number';
  device?: DevicePayload;
}

export interface LoginPayloadEmail {
  email: string;
  otp: string;
  provider?: 'email';
  device?: DevicePayload;
}

export interface LoginPayloadSocial {
  /** Google: id_token; Apple: identity_token */
  id_token?: string;
  identity_token?: string;
  provider: 'google' | 'apple';
  device?: DevicePayload;
}

export type LoginPayload = LoginPayloadNumber | LoginPayloadEmail | LoginPayloadSocial;

export interface RegisterPayload {
  name: string;
  profile_link: string;
  email: string;
  profile_picture?: string;
  default_language?: string;
  phone?: string;
  otp?: string;
  /** Social: pass id_token (Google) or identity_token (Apple) instead of phone/otp */
  id_token?: string;
  identity_token?: string;
  device?: DevicePayload;
}

export interface AuthApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

/** User object returned by login/register APIs. */
export interface AuthUser {
  id: number;
  uuid: string;
  name: string;
  email: string;
  PhoneE164?: string;
  PhoneHash?: string;
  phone_verified_at?: string | null;
  ai_credits?: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/** Login/register API response: token + user (may be top-level or under data). */
export interface AuthTokenResponse {
  token: string;
  user: AuthUser;
}

async function authFetch<T>(
  path: string,
  options: Omit<RequestInit, 'body'> & { body?: object }
): Promise<AuthApiResponse<T>> {
  const base = getAuthBaseUrl();
  if (!base?.trim()) {
    return { success: false, message: 'NEXT_PUBLIC_SUPERYOU_API_BASE is not set' };
  }
  const url = base.replace(/\/$/, '') + path;
  const { body, ...rest } = options;
  const res = await fetch(url, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(rest.headers as Record<string, string>),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const json = (await res.json().catch(() => ({}))) as AuthApiResponse<T> & Partial<AuthTokenResponse>;
  if (!res.ok) {
    return {
      success: false,
      message: (json as AuthApiResponse).message ?? `Request failed: ${res.status} ${res.statusText}`,
      data: (json as AuthApiResponse<T>).data,
    };
  }
  const data = (json as AuthApiResponse<T>).data ?? (json as AuthTokenResponse);
  return { success: true, data: data as T };
}

/** Request OTP for phone (register or login). */
export async function requestOtp(payload: RequestOtpPayload): Promise<AuthApiResponse> {
  return authFetch('/auth/request-otp', { method: 'POST', body: payload });
}

/** Request OTP for email (register or login). Use if BE supports sending OTP to email. */
export async function requestEmailOtp(payload: { email: string; purpose: 'register' | 'login' }): Promise<AuthApiResponse> {
  return authFetch('/auth/request-otp', { method: 'POST', body: payload });
}

/** Login: number (phone+otp), email (email+otp), or social (id_token/identity_token). */
export async function login(payload: LoginPayload): Promise<AuthApiResponse<AuthTokenResponse>> {
  return authFetch('/auth/login', { method: 'POST', body: payload });
}

/** Register: full payload; for social include id_token or identity_token. */
export async function register(payload: RegisterPayload): Promise<AuthApiResponse<AuthTokenResponse>> {
  return authFetch('/auth/register', { method: 'POST', body: payload });
}

/** Logout: invalidate session on BE. Pass the token from the session (session.beeToken). */
export async function logout(token: string): Promise<AuthApiResponse> {
  return authFetch('/auth/logout', { method: 'POST', body: { token } });
}
