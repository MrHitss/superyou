/**
 * API types for block create/update and profile blocks response.
 * Matches superyou-be block API payloads.
 */

/** Schedule in API (start_at / end_at) */
export interface ApiBlockSchedule {
  start_at?: string; // ISO datetime
  end_at?: string;
}

/** content_json for header block */
export interface ApiHeaderContent {
  title: string;
}

/** content_json for link block (top-level or carousel child) */
export interface ApiLinkContent {
  title: string;
  description?: string;
  thumbnail?: string;
  cta?: string;
  url: string;
}

/** content_json for whatsapp block (top-level or carousel child) */
export interface ApiWhatsAppContent {
  title: string;
  description?: string;
  thumbnail?: string;
  cta?: string;
  phone_code: string;
  number: string;
  prefilled_message?: string;
}

/** content_json for form block */
export interface ApiFormContent {
  form_id: string;
}

/** content_json for carousel block (parent only) */
export interface ApiCarouselContent {
  title: string;
}

export type ApiContentJson =
  | ApiHeaderContent
  | ApiLinkContent
  | ApiWhatsAppContent
  | ApiFormContent
  | ApiCarouselContent;

/** settings_json common + type-specific */
export interface ApiBlockSettingsBase {
  layout?: 'card' | 'minimal' | 'outlined' | 'full_width';
  animation?: string;
  schedule?: ApiBlockSchedule;
}

export interface ApiLinkSettings extends ApiBlockSettingsBase {
  is_highlight?: boolean;
}

export interface ApiHeaderSettings {
  alignment?: 'left' | 'center' | 'right';
}

export type ApiSettingsJson = ApiBlockSettingsBase | ApiLinkSettings | ApiHeaderSettings;

/** Block type as sent/received by API */
export type ApiBlockType = 'header' | 'link' | 'whatsapp' | 'form' | 'carousel';

/**
 * Single block payload for create or update.
 * For create: uuid and profile_id are optional (backend resolves profile from auth).
 */
export interface ApiBlockPayload {
  uuid?: string;
  profile_id?: string;
  block_type: ApiBlockType;
  parent_id: string | null;
  position: number;
  thumbnail_url: string | null;
  content_json: ApiContentJson;
  settings_json: ApiSettingsJson;
  is_active: boolean;
}

/**
 * Block as returned in profile blocks response.
 * Carousel blocks include children array (link/whatsapp children).
 */
export interface ApiBlockResponse extends ApiBlockPayload {
  uuid: string;
  children?: ApiBlockResponse[];
}

export interface ProfileBlocksResponse {
  profile_id: string;
  blocks: ApiBlockResponse[];
}

/** Profile as returned in me/link page (data.profile) */
export interface MeLinkProfile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  is_verified: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_image?: string | null;
}

/** Button radius: default | rounded | pill (spec) */
export type ButtonRadius = 'default' | 'rounded' | 'pill';

/** Filled button config (spec layout.buttons.filled) */
export interface LayoutFilledButton {
  radius?: ButtonRadius;
  style?: 'default';
}

/** Outline button config (spec layout.buttons.outline) */
export interface LayoutOutlineButton {
  radius?: ButtonRadius;
  text_color?: string;
  border_color?: string;
}

/** Buttons config (spec layout.buttons) – overrides theme defaults */
export interface LayoutButtons {
  filled?: LayoutFilledButton;
  outline?: LayoutOutlineButton;
}

/** Block container styling (spec layout.blocks) */
export interface LayoutBlocksStyle {
  style?: 'filled' | 'outline';
  shadow?: 'none' | 'soft' | 'hard';
  block_color?: string;
  text_color?: string;
}

/** Layout as returned in me/link page (data.layout). Supports spec (buttons, blocks, animation) and legacy (button_style). */
export interface MeLinkLayout {
  theme?: string;
  font?: string;
  /** Spec: { type, value, tint_color }; legacy supported */
  background?: { type?: string; value?: string; tint_color?: string };
  /** Legacy: flat radius + shadow; use when layout.buttons not provided */
  button_style?: { radius?: string; shadow?: boolean };
  /** Spec: filled + outline button rules */
  buttons?: LayoutButtons;
  /** Spec: block container style, shadow, colors */
  blocks?: LayoutBlocksStyle;
  /** Block entrance animation: none | fade | slide_up | zoom */
  animation?: 'none' | 'fade' | 'slide_up' | 'zoom';
  /** Desktop column layout: single | double */
  layout_mode?: 'single' | 'double';
  /** Show content warning before store opens */
  sensitive_content_warning?: boolean;
  /** Footer position: scroll (sticks on scroll) | fixed (fixed to bottom) */
  footer_position?: 'scroll' | 'fixed';
}

/** Social link as returned in me/link page (data.social_media) */
export interface MeLinkSocialItem {
  platform: string;
  url: string;
  icon: string;
}

/** Block in me/link page format (data.blocks) - public/shared shape */
export interface MeLinkBlockContent {
  title?: string;
  description?: string;
  cta?: string;
  url?: string;
  form_id?: string;
  phone_code?: string;
  number?: string;
  prefilled_message?: string;
}

export interface MeLinkBlock {
  uuid: string;
  type: string;
  position: number;
  thumbnail_url?: string;
  content: MeLinkBlockContent & Record<string, unknown>;
  settings?: Record<string, unknown>;
  children?: MeLinkBlock[];
}

/** Full me/link page response - API returns { data: MeLinkPageData } */
export interface MeLinkPageData {
  profile: MeLinkProfile;
  layout: MeLinkLayout;
  social_media: MeLinkSocialItem[];
  blocks: MeLinkBlock[];
}

export interface MeLinkPageResponse {
  data: MeLinkPageData;
}
