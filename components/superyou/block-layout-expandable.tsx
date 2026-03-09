'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentBlock } from '@/features/superyou/content-blocks/types';
import type { BlockLayoutType } from '@/features/superyou/content-blocks/types';

interface BlockLayoutExpandableProps {
  block: ContentBlock;
  onSave: (blockId: string, layout: BlockLayoutType) => void;
  onClose: () => void;
}

/** Standard: single minimal row (horizontal pill/oval) */
function StandardThumb() {
  return (
    <div className="flex h-[72px] w-full items-center justify-center rounded-lg border border-border bg-muted/20 p-2">
      <div className="flex w-full items-center justify-center">
        <div className="h-8 w-24 rounded-full bg-muted-foreground/20" />
      </div>
    </div>
  );
}

/** Featured – Card: icon/thumb left, title+desc, CTA bar at bottom */
function CardThumb() {
  return (
    <div className="flex h-[72px] w-full flex-col rounded-lg border border-border bg-muted/20 p-2">
      <div className="flex flex-1 gap-2">
        <div className="h-8 w-8 shrink-0 rounded-md bg-muted-foreground/30" />
        <div className="flex flex-1 flex-col justify-center gap-1">
          <div className="h-1.5 w-12 rounded bg-muted-foreground/20" />
          <div className="h-1.5 w-8 rounded bg-muted-foreground/15" />
        </div>
      </div>
      <div className="mt-1.5 h-2 w-full rounded bg-foreground/80" />
    </div>
  );
}

/** Featured – Minimal: large rect on top, two lines below */
function MinimalThumb() {
  return (
    <div className="flex h-[72px] w-full flex-col gap-1.5 rounded-lg border border-border bg-muted/20 p-2">
      <div className="h-7 w-full rounded bg-muted-foreground/20" />
      <div className="flex gap-1">
        <div className="h-1.5 flex-1 rounded bg-muted-foreground/15" />
        <div className="h-1.5 flex-1 rounded bg-muted-foreground/15" />
      </div>
    </div>
  );
}

/** Featured – Outlined: single wide pill / minimal block */
function OutlinedThumb() {
  return (
    <div className="flex h-[72px] w-full items-center justify-center rounded-lg border-2 border-border bg-muted/20 p-2">
      <div className="h-6 w-3/4 rounded-full bg-muted-foreground/20" />
    </div>
  );
}

/** Featured – Full width: header line, large image area, line below */
function FullWidthThumb() {
  return (
    <div className="flex h-[72px] w-full flex-col gap-1 rounded-lg border border-border bg-muted/20 p-2">
      <div className="h-1.5 w-16 rounded bg-muted-foreground/20" />
      <div className="flex-1 rounded bg-muted-foreground/25" />
      <div className="h-1.5 w-20 rounded bg-muted-foreground/15" />
    </div>
  );
}

const LAYOUT_OPTIONS: {
  value: BlockLayoutType;
  label: string;
  category: 'standard' | 'featured';
  Thumb: React.ComponentType;
}[] = [
  { value: 'standard', label: 'Standard', category: 'standard', Thumb: StandardThumb },
  { value: 'card', label: 'Card', category: 'featured', Thumb: CardThumb },
  { value: 'minimal', label: 'Minimal', category: 'featured', Thumb: MinimalThumb },
  { value: 'outlined', label: 'Outlined', category: 'featured', Thumb: OutlinedThumb },
  { value: 'full_width', label: 'Full width', category: 'featured', Thumb: FullWidthThumb },
];

const STANDARD_LAYOUTS = LAYOUT_OPTIONS.filter((l) => l.category === 'standard');
const FEATURED_LAYOUTS = LAYOUT_OPTIONS.filter((l) => l.category === 'featured');

export function BlockLayoutExpandable({
  block,
  onSave,
  onClose,
}: BlockLayoutExpandableProps) {
  const rawLayout = block.layout ?? 'standard';
  const currentLayout: BlockLayoutType =
    rawLayout === 'featured' ? 'card' : rawLayout;
  const [selected, setSelected] = useState<BlockLayoutType>(currentLayout);

  useEffect(() => {
    setSelected(currentLayout);
  }, [currentLayout]);

  const handleSave = () => {
    onSave(block.id, selected);
    onClose();
  };

  const handleLayoutSelect = (layout: BlockLayoutType) => {
    setSelected(layout);
    onSave(block.id, layout);
  };

  return (
    <div className="border-t border-border bg-muted/20">
      <div className="flex items-center justify-between bg-muted px-4 py-3">
        <h4 className="text-sm font-semibold">Layout options</h4>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={handleSave}
          aria-label="Save and close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-5 px-4 py-4">
        {STANDARD_LAYOUTS.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Standard</p>
            <div className="grid gap-2">
              {STANDARD_LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => handleLayoutSelect(l.value)}
                  className={cn(
                    'rounded-lg border-2 p-2 transition-colors text-left',
                    selected === l.value
                      ? 'border-foreground bg-muted/50'
                      : 'border-border hover:border-muted-foreground/30',
                  )}
                >
                  <l.Thumb />
                </button>
              ))}
            </div>
          </div>
        )}
        {FEATURED_LAYOUTS.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Featured</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FEATURED_LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => handleLayoutSelect(l.value)}
                  className={cn(
                    'rounded-lg border-2 p-2 transition-colors text-left',
                    selected === l.value
                      ? 'border-foreground bg-muted/50'
                      : 'border-border hover:border-muted-foreground/30',
                  )}
                >
                  <l.Thumb />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
