'use client';

import { useSession } from 'next-auth/react';
import { PreviewPane } from '@/components/superyou';
import { useMeLinkPage } from '@/features/superyou/content-blocks';

export default function OrbitYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const { data: pageData, isLoading } = useMeLinkPage();
  const displayName =
    (session?.user as { name?: string })?.name ?? session?.user?.email ?? 'User';

  return (
    <div className="flex h-full min-h-0 w-full">
      <div className="flex-1 overflow-auto">{children}</div>
      <div className="hidden h-full min-h-0 border-l border-border lg:flex lg:flex-col">
        <PreviewPane
          profileName={displayName}
          profileUrl="superyou.bio/yourhandle"
          welcomeMessage="Welcome to my SuperYou profile! 🚀"
          pageData={isLoading ? undefined : pageData ?? undefined}
        />
      </div>
    </div>
  );
}
