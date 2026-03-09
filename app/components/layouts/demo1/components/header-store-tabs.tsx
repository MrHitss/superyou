'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { SUPERYOU_STORE_TABS } from '@/features/superyou/layout/config';
import { cn } from '@/lib/utils';

/** Store / Appearance / Analytics / Settings tabs for header when on /orbit/you. */
export function HeaderStoreTabs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'store';

  return (
    <nav className="flex items-stretch gap-0 border-b-0">
      {SUPERYOU_STORE_TABS.map((t) => {
        const href = t.id === 'store' ? '/orbit/you' : `/orbit/you?tab=${t.id}`;
        const isActive = tab === t.id;
        return (
          <Link
            key={t.id}
            href={href}
            className={cn(
              'flex items-center px-4 py-3.5 text-sm font-medium border-b-2 border-transparent -mb-px',
              'hover:text-primary hover:bg-transparent',
              isActive
                ? 'text-primary border-primary bg-transparent'
                : 'text-secondary-foreground',
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
