/**
 * Profile settings update payload – PATCH /profiles/{profile_id}
 * Separates profile identity data from layout configuration.
 * Unknown fields are ignored; partial updates supported.
 */

import { z } from 'zod';

// --- Profile identity (who the user is) ---

const ProfileIdentitySchema = z
  .object({
    display_name: z
      .string()
      .max(60, 'display_name must be at most 60 characters')
      .optional(),
    bio: z
      .string()
      .max(160, 'bio must be at most 160 characters')
      .optional(),
    avatar_url: z.string().url('avatar_url must be a valid URL').optional(),
    seo_title: z
      .string()
      .max(255, 'seo_title must be at most 255 characters')
      .optional(),
    seo_description: z
      .string()
      .max(500, 'seo_description must be at most 500 characters')
      .optional(),
    seo_image: z.string().url('seo_image must be a valid URL').optional(),
  })
  .optional();

export type ProfileIdentityPayload = z.infer<typeof ProfileIdentitySchema>;

// --- Layout configuration (how the profile looks and behaves) ---

const ThemeSchema = z.enum(['classic', 'dawn', 'dusk']).optional();
const FontSchema = z.string().optional(); // e.g. "inter"

const ButtonRadiusSchema = z.enum(['default', 'rounded', 'pill']).optional();
const FilledButtonSchema = z
  .object({
    radius: ButtonRadiusSchema,
    style: z.enum(['default']).optional(),
  })
  .optional();
const OutlineButtonSchema = z
  .object({
    radius: ButtonRadiusSchema,
    text_color: z.string().optional(),
    border_color: z.string().optional(),
  })
  .optional();

const ButtonsSchema = z
  .object({
    filled: FilledButtonSchema,
    outline: OutlineButtonSchema,
  })
  .optional();

const BlocksStyleSchema = z
  .object({
    style: z.enum(['filled', 'outline']).optional(),
    shadow: z.enum(['none', 'soft', 'hard']).optional(),
    block_color: z.string().optional(),
    text_color: z.string().optional(),
  })
  .optional();

const BackgroundSchema = z
  .object({
    type: z.enum(['color', 'gradient', 'image', 'pattern']).optional(),
    value: z.string().optional(), // URL, hex, or CSS gradient
    tint_color: z.string().optional(),
  })
  .optional();

const AnimationSchema = z.enum(['none', 'fade', 'slide_up', 'zoom']).optional();
const LayoutModeSchema = z.enum(['single', 'double']).optional();
const FooterPositionSchema = z.enum(['scroll', 'fixed']).optional();

const LayoutConfigSchema = z
  .object({
    theme: ThemeSchema,
    font: FontSchema,
    buttons: ButtonsSchema,
    blocks: BlocksStyleSchema,
    background: BackgroundSchema,
    animation: AnimationSchema,
    layout_mode: LayoutModeSchema,
    sensitive_content_warning: z.boolean().optional(),
    footer_position: FooterPositionSchema,
  })
  .optional();

export type LayoutConfigPayload = z.infer<typeof LayoutConfigSchema>;

// --- Full PATCH payload ---

export const ProfileUpdatePayloadSchema = z.object({
  profile: ProfileIdentitySchema,
  layout: LayoutConfigSchema,
});

export type ProfileUpdatePayload = z.infer<typeof ProfileUpdatePayloadSchema>;

/**
 * Validate and parse the body for PATCH /profiles/{profile_id}.
 * Returns the payload or throws ZodError with validation details.
 */
export function parseProfileUpdatePayload(
  body: unknown,
): ProfileUpdatePayload {
  return ProfileUpdatePayloadSchema.parse(body);
}

/**
 * Safe parse: returns { success: true, data } or { success: false, error }.
 */
export function safeParseProfileUpdatePayload(body: unknown): z.SafeParseReturnType<unknown, ProfileUpdatePayload> {
  return ProfileUpdatePayloadSchema.safeParse(body);
}
