'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface PreviewPaneProps {
  className?: string;
  profileUrl?: string;
  profileName?: string;
  welcomeMessage?: string;
  children?: React.ReactNode;
}

export function PreviewPane({
  className,
  profileUrl = 'superyou.bio/yourhandle',
  profileName = 'Your Name',
  welcomeMessage = 'Welcome to my SuperYou profile!',
  children,
}: PreviewPaneProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-gradient-to-b from-zinc-900 to-zinc-950 text-white',
        className,
      )}
    >
      {/* Mobile frame header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="truncate text-xs text-white/70">{profileUrl}</span>
        <Button size="sm" variant="ghost" className="h-8 gap-1 text-white hover:bg-white/10">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Profile preview content - scrollable */}
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-white/10 flex items-center justify-center text-3xl text-white/50">
            ?
          </div>
          <h2 className="mt-3 text-lg font-semibold">{profileName}</h2>
          <p className="mt-1 text-sm text-white/80">{welcomeMessage}</p>
        </div>

        {/* Content blocks placeholder */}
        <div className="mt-6 space-y-2">{children}</div>
      </div>
    </aside>
  );
}
