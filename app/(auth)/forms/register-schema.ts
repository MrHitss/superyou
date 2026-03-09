import { z } from 'zod';

const PROFILE_LINK_PREFIX = 'superyou.bio/';

export const registerStep1Schema = z.object({
  email: z
    .string()
    .email({ message: 'Please enter a valid email address.' })
    .min(1, { message: 'Email is required.' }),
});

export const registerStep2Schema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .min(1, { message: 'Name is required.' }),
  profile_link: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' })
    .regex(/^[a-zA-Z0-9_-]+$/, {
      message: 'Username can only contain letters, numbers, underscores and hyphens.',
    })
    .transform((val) => val.toLowerCase().trim()),
});

export const registerStep3Schema = z.object({
  otp: z.string().length(6, { message: 'Enter the 6-digit code.' }),
});

export type RegisterStep1Values = z.infer<typeof registerStep1Schema>;
export type RegisterStep2Values = z.infer<typeof registerStep2Schema>;
export type RegisterStep3Values = z.infer<typeof registerStep3Schema>;

export function formatProfileLinkDisplay(username: string): string {
  const clean = username.replace(/^superyou\.bio\/?/i, '').trim();
  return clean ? `${PROFILE_LINK_PREFIX}${clean}` : PROFILE_LINK_PREFIX;
}

export function getProfileLinkFromInput(input: string): string {
  return input.replace(/^superyou\.bio\/?/i, '').trim();
}

export { PROFILE_LINK_PREFIX };
