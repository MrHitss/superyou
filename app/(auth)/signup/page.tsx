'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import {
  registerStep1Schema,
  registerStep2Schema,
  registerStep3Schema,
  getProfileLinkFromInput,
  PROFILE_LINK_PREFIX,
  type RegisterStep1Values,
  type RegisterStep2Values,
  type RegisterStep3Values,
} from '../forms/register-schema';
import { register as registerApi, requestEmailOtp } from '@/lib/auth-api';
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

type Step = 1 | 2 | 3;

export default function Page() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [profileLink, setProfileLink] = useState('');

  const form1 = useForm<RegisterStep1Values>({
    resolver: zodResolver(registerStep1Schema),
    defaultValues: { email: '' },
  });

  const form2 = useForm<RegisterStep2Values>({
    resolver: zodResolver(registerStep2Schema),
    defaultValues: { name: '', profile_link: '' },
  });

  const form3 = useForm<RegisterStep3Values>({
    resolver: zodResolver(registerStep3Schema),
    defaultValues: { otp: '' },
  });

  async function onStep1Submit(values: RegisterStep1Values) {
    setIsProcessing(true);
    setError(null);
    try {
      const res = await requestEmailOtp({ email: values.email, purpose: 'register' });
      if (!res.success) {
        setError(res.message ?? 'Could not send verification code.');
        return;
      }
      setEmail(values.email);
      setStep(2);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  function onStep2Submit(values: RegisterStep2Values) {
    setName(values.name);
    setProfileLink(values.profile_link);
    setStep(3);
  }

  async function onStep3Submit(values: RegisterStep3Values) {
    setIsProcessing(true);
    setError(null);
    try {
      const device = getDevicePayload();
      const res = await registerApi({
        name,
        profile_link: profileLink,
        email,
        otp: values.otp,
        default_language: typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) ?? 'en' : 'en',
        device: Object.keys(device).length > 0 ? device : undefined,
      });
      if (!res.success) {
        setError(res.message ?? 'Registration failed.');
        return;
      }
      const data = res.data;
      if (data?.token && data?.user) {
        const user = data.user as { profile_link?: string | null };
        await signIn('credentials', {
          redirect: false,
          token: data.token,
          email: data.user.email,
          name: data.user.name,
          id: data.user.uuid,
          profile_link: (user?.profile_link ?? profileLink) || undefined,
        });
      }
      router.push('/orbit');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  function goBack() {
    setError(null);
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  }

  const baseUrl = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPERYOU_API_BASE : undefined;
  const useBeAuth = !!baseUrl?.trim();

  if (!useBeAuth) {
    return (
      <div className="block w-full space-y-5">
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          Sign Up
        </h1>
        <Alert>
          <AlertIcon>
            <AlertCircle />
          </AlertIcon>
          <AlertTitle>
            Sign up is not configured. Set NEXT_PUBLIC_SUPERYOU_API_BASE to use the new flow.
          </AlertTitle>
        </Alert>
        <p className="text-sm text-muted-foreground text-center">
          <Link href="/signin" className="font-semibold text-foreground hover:text-primary">
            Sign In
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="block w-full space-y-5">
      <div className="space-y-1.5 pb-3">
        <h1 className="text-2xl font-semibold tracking-tight text-center">
          {step === 1 && 'Create account'}
          {step === 2 && 'Choose your link'}
          {step === 3 && 'Verify your email'}
        </h1>
      </div>

      <div className="flex flex-col gap-3.5">
        <Button
          variant="outline"
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/orbit' })}
        >
          <Icons.googleColorful className="size-4!" /> Sign up with Google
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

      {step === 1 && (
        <Form {...form1}>
          <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-5">
            <FormField
              control={form1.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isProcessing} className="w-full">
              {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
              Continue
            </Button>
          </form>
        </Form>
      )}

      {step === 2 && (
        <Form {...form2}>
          <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-5">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" mode="icon" size="sm" onClick={goBack} aria-label="Back">
                <ArrowLeft className="size-4" />
              </Button>
              <p className="text-sm text-muted-foreground py-1">{email}</p>
            </div>
            <FormField
              control={form2.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form2.control}
              name="profile_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="flex items-center rounded-md border border-input bg-background">
                      <span className="text-muted-foreground px-3 text-sm border-r border-input">
                        {PROFILE_LINK_PREFIX}
                      </span>
                      <Input
                        placeholder="username"
                        className="border-0 rounded-l-none focus-visible:ring-0"
                        {...field}
                        value={getProfileLinkFromInput(field.value || '')}
                        onChange={(e) => field.onChange(getProfileLinkFromInput(e.target.value))}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Continue</Button>
          </form>
        </Form>
      )}

      {step === 3 && (
        <Form {...form3}>
          <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-5">
            <div className="flex gap-2 items-center">
              <Button type="button" variant="ghost" mode="icon" size="sm" onClick={goBack} aria-label="Back">
                <ArrowLeft className="size-4" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Code sent to {email}
              </p>
            </div>
            <FormField
              control={form3.control}
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
            <Button type="submit" disabled={isProcessing} className="w-full">
              {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
              Create account
            </Button>
          </form>
        </Form>
      )}

      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link href="/signin" className="font-semibold text-foreground hover:text-primary">
          Sign In
        </Link>
      </p>
    </div>
  );
}
