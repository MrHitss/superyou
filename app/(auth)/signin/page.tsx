'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import {
  loginIdentifierSchema,
  loginOtpSchema,
  type LoginIdentifierValues,
  type LoginOtpValues,
} from '../forms/login-schema';
import { login as loginApi, requestEmailOtp } from '@/lib/auth-api';
import { getDevicePayload } from '@/lib/device-payload';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { LoaderCircleIcon } from 'lucide-react';
import { Icons } from '@/components/common/icons';

export default function Page() {
  const router = useRouter();
  const [showOtp, setShowOtp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailOrUsername, setEmailOrUsername] = useState('');

  const formId = useForm<LoginIdentifierValues>({
    resolver: zodResolver(loginIdentifierSchema),
    defaultValues: { emailOrUsername: '' },
  });

  const formOtp = useForm<LoginOtpValues>({
    resolver: zodResolver(loginOtpSchema),
    defaultValues: { otp: '' },
  });

  async function onRequestCode(values: LoginIdentifierValues) {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await requestEmailOtp({
        email: values.emailOrUsername.trim(),
        purpose: 'login',
      });
      if (!res.success) {
        setError(res.message ?? 'Could not send verification code.');
        return;
      }
      setEmailOrUsername(values.emailOrUsername.trim());
      setShowOtp(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function onVerifyOtp(values: LoginOtpValues) {
    setIsProcessing(true);
    setError(null);
    try {
      const device = getDevicePayload();
      const isEmail = emailOrUsername.includes('@');
      const res = await loginApi({
        email: isEmail ? emailOrUsername : undefined,
        otp: values.otp,
        provider: 'email',
        device: Object.keys(device).length > 0 ? device : undefined,
      } as { email: string; otp: string; provider: 'email'; device?: typeof device });
      if (!res.success) {
        setError(res.message ?? 'Login failed.');
        return;
      }
      const data = res.data;
      if (!data?.token || !data?.user) {
        setError('Invalid login response.');
        return;
      }
      const user = data.user as { profile_link?: string | null };
      await signIn('credentials', {
        redirect: false,
        token: data.token,
        email: data.user.email,
        name: data.user.name,
        id: data.user.uuid,
        profile_link: user?.profile_link ?? undefined,
      });
      router.push('/orbit');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  const baseUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPERYOU_API_BASE : undefined;
  const useBeAuth = !!baseUrl?.trim();

  if (!useBeAuth) {
    return (
      <div className="block w-full space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          Sign in
        </h1>
        <Alert>
          <AlertIcon>
            <AlertCircle />
          </AlertIcon>
          <AlertTitle>
            Sign in is not configured. Set NEXT_PUBLIC_SUPERYOU_API_BASE to use the new flow.
          </AlertTitle>
        </Alert>
        <p className="text-sm text-muted-foreground text-center">
          <Link href="/signup" className="font-semibold text-foreground hover:text-primary">
            Sign Up
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="block w-full space-y-5">
      <div className="space-y-1.5 pb-3">
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          Sign in to SuperYou
        </h1>
      </div>

      <div className="flex flex-col gap-3.5">
        <Button
          variant="outline"
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/orbit' })}
        >
          <Icons.googleColorful className="size-5! opacity-100!" /> Sign in with Google
        </Button>
      </div>

      <div className="relative py-1.5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" onClose={() => setError(null)}>
          <AlertIcon>
            <AlertCircle />
          </AlertIcon>
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}

      {!showOtp ? (
        <Form {...formId}>
          <form onSubmit={formId.handleSubmit(onRequestCode)} className="space-y-5">
            <FormField
              control={formId.control}
              name="emailOrUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or username</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com or username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isProcessing} className="w-full">
              {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
              Send code
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...formOtp}>
          <form onSubmit={formOtp.handleSubmit(onVerifyOtp)} className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Code sent to {emailOrUsername}
            </p>
            <FormField
              control={formOtp.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                    >
                      <InputOTPGroup className="justify-center">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setShowOtp(false)}
            >
              Use a different email or username
            </Button>
            <Button type="submit" disabled={isProcessing} className="w-full">
              {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
              Continue
            </Button>
          </form>
        </Form>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-foreground hover:text-primary">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
