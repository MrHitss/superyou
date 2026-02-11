'use client';

import { useSession } from 'next-auth/react';
import { PreviewPane } from '@/components/superyou';

export default function CreateSuperProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const displayName =
    (session?.user as { name?: string })?.name ?? session?.user?.email ?? 'User';

  return (
    <div className="flex h-full min-h-0 w-full">
      <div className="flex-1 overflow-auto">{children}</div>
      <div className="hidden border-l border-border lg:block">
        <PreviewPane
          profileName={displayName}
          profileUrl="superyou.bio/yourhandle"
          welcomeMessage="Welcome to my SuperYou profile! 🚀"
        />
      </div>
    </div>
  );
}
