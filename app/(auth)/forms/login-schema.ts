import { z } from 'zod';

/** Email or username (or phone) for login */
export const loginIdentifierSchema = z.object({
  emailOrUsername: z.string().min(1, { message: 'Email or username is required.' }),
});

export const loginOtpSchema = z.object({
  otp: z.string().length(6, { message: 'Enter the 6-digit code.' }),
});

export type LoginIdentifierValues = z.infer<typeof loginIdentifierSchema>;
export type LoginOtpValues = z.infer<typeof loginOtpSchema>;
