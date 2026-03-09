'use client';

import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  AlertTriangle,
  BookOpen,
  Check,
  FolderOpen,
  GraduationCap,
  Link2,
  Play,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID';

export function AccountDashboardContent() {
  const { data: session } = useSession();
  const userName =
    (session?.user as { name?: string })?.name ?? session?.user?.email ?? 'User';

  const roadmapSteps = [
    {
      id: 'autodm',
      title: 'Setup automation on AutoDM',
      description:
        'Turn your IG engagement to potential leads with 100% automations.',
      completed: false,
      action: 'Set up',
    },
    {
      id: 'store',
      title: 'Launch your Store',
      description:
        "Make sure your social bio has it all - the only link-in-bio store you'll need",
      completed: true,
    },
    {
      id: 'product',
      title: 'Create a product',
      description:
        'Launch Digital Products, Webinars, Courses, 1:1 coaching, and more.',
      completed: true,
    },
  ];

  const exploreApps = [
    {
      icon: Link2,
      title: 'Create SuperLinks',
      description:
        'Create Short Links or deep links which open-in-app - best Bitly alternative.',
      iconClass: 'text-amber-500',
    },
    {
      icon: FolderOpen,
      title: 'Sell Digital Products',
      description: 'Sell videos, photos, documents, and more in seconds.',
      iconClass: 'text-amber-500',
    },
    {
      icon: BookOpen,
      title: 'Launch your course',
      description:
        'Create and sell full-length courses with lots of customization.',
      iconClass: 'text-pink-500',
    },
  ];

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* 1. Free Plan banner */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-green-50 px-4 py-3 border border-green-100">
        <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-medium text-white">
          You&apos;re on Free Plan
        </span>
        <span className="text-sm text-foreground">
          Unlock unlimited access to all features and get paid.
        </span>
        <Link
          href="#"
          className="text-sm font-medium text-blue-600 hover:underline ml-auto"
        >
          Upgrade now
        </Link>
      </div>

      {/* 2. Greeting */}
      <h1 className="text-2xl font-bold text-foreground">
        Hello, {userName}!
      </h1>

      {/* 3. Grow your Instagram card */}
      <div className="rounded-xl bg-white border shadow-sm overflow-hidden flex flex-col sm:flex-row">
        <div className="relative sm:w-2/5 min-h-[200px] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg">
            <Play className="h-7 w-7 ml-1" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1 p-6 flex flex-col justify-center">
          <h2 className="text-lg font-semibold text-foreground">
            Grow your Instagram
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Here&apos;s how our creators grew to 100k followers in just one week,
            explained in a quick two-minute video.
          </p>
          <Button
            className="mt-4 w-full sm:w-auto bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white border-0 rounded-lg px-6"
            size="default"
          >
            Unlock Feature
          </Button>
        </div>
      </div>

      {/* 4. Learn how to grow and sell card */}
      <Link
        href="#"
        className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-amber-800 to-amber-900 px-6 py-4 text-white hover:opacity-95 transition-opacity"
      >
        <span className="text-base font-medium">
          Learn how to grow and sell with SuperProfile
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <GraduationCap className="h-5 w-5" />
          Go to Learn
        </span>
      </Link>

      {/* 5. Unpublished products alert */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-amber-50 border border-amber-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-sm text-foreground">
            Uh oh...you have unpublished products!{' '}
            <Link href="#" className="text-blue-600 hover:underline font-medium">
              Upgrade now
            </Link>{' '}
            to publish these and start earning.
          </p>
        </div>
        <Button variant="mono" className="rounded-lg shrink-0">
          Start Earning
        </Button>
      </div>

      {/* 6. Roadmap to making ₹₹₹ */}
      <div className="rounded-xl bg-white border shadow-sm p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Roadmap to making ₹₹₹
          </h3>
          <span className="text-sm text-muted-foreground">2/3 completed</span>
        </div>
        <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: '66.67%' }}
          />
        </div>
        <div className="mt-6 relative pl-0">
          {/* Dotted connector line from first to last circle */}
          <div
            className="absolute left-[11px] top-3 bottom-3 w-px border-l-2 border-dashed border-gray-200"
            aria-hidden
          />
          {roadmapSteps.map((step) => (
            <div key={step.id} className="flex gap-4 relative z-10">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5">
                {step.completed ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300 bg-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {step.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {step.description}
                    </div>
                  </div>
                  {step.action && (
                    <Button
                      variant="mono"
                      size="sm"
                      className="rounded-lg shrink-0 self-start sm:self-center"
                    >
                      {step.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. Explore more apps */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-semibold text-foreground">
            Explore more apps
          </h4>
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View all 10+ apps
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-red-400 to-blue-500 opacity-80" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {exploreApps.map((app) => (
            <div
              key={app.title}
              className="rounded-xl border bg-white p-4 shadow-sm hover:shadow transition-shadow"
            >
              <app.icon
                className={cn('h-8 w-8 mb-3', app.iconClass)}
                strokeWidth={1.5}
              />
              <div className="text-sm font-semibold text-foreground">
                {app.title}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {app.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Bug Report or Feature Request */}
      <div className="rounded-xl border bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <span className="text-2xl font-bold">?</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              Bug Report or Feature Request
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Let us know what can make your SuperProfile experience even
              better.
            </div>
          </div>
        </div>
        <a
          href={GOOGLE_SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100 text-sm font-medium text-foreground"
        >
          Report
        </a>
      </div>
    </div>
  );
}
