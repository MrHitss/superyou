'use client';

import { ContentBlock } from '@/features/superyou/content-blocks/types';
import { SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Calendar,
  Lock,
  Unlock,
  Star,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContentBlockRowCallbacks {
  onEdit?: (block: ContentBlock) => void;
  onDelete?: (block: ContentBlock) => void;
  onCopy?: (block: ContentBlock) => void;
  onSchedule?: (block: ContentBlock) => void;
  onToggleLock?: (block: ContentBlock) => void;
  onToggleFavourite?: (block: ContentBlock) => void;
  onAnalytics?: (block: ContentBlock) => void;
  onDuplicate?: (block: ContentBlock) => void;
  onVisibleChange?: (block: ContentBlock, visible: boolean) => void;
  onAddCard?: (block: ContentBlock) => void;
  onReorderCards?: (block: ContentBlock) => void;
}

interface ContentBlockRowProps extends ContentBlockRowCallbacks {
  block: ContentBlock;
}

function getBlockTitle(block: ContentBlock): string {
  switch (block.type) {
    case 'header':
      return block.text || 'Header';
    case 'carousel':
      return block.title || 'Enter carousel title';
    case 'link':
      return block.title || 'Link';
    default:
      return 'Block';
  }
}

function getBlockSubtitle(block: ContentBlock): string | undefined {
  if (block.type === 'header') {
    const len = (block.text || '').length;
    const max = block.maxLength ?? 35;
    return `${len}/${max}`;
  }
  if (block.type === 'carousel') {
    const count = block.cards?.length ?? 0;
    return `${count} card${count !== 1 ? 's' : ''}`;
  }
  return undefined;
}

export function ContentBlockRow({
  block,
  value,
  onEdit,
  onDelete,
  onCopy,
  onSchedule,
  onToggleLock,
  onToggleFavourite,
  onAnalytics,
  onDuplicate,
  onVisibleChange,
  onAddCard,
  onReorderCards,
}: ContentBlockRowProps) {
  const sortableValue = value ?? block.id;
  const subtitle = getBlockSubtitle(block);
  const title = getBlockTitle(block);
  const isCarousel = block.type === 'carousel';
  const isHeader = block.type === 'header';
  const cards = block.type === 'carousel' ? block.cards : [];

  return (
    <SortableItem value={sortableValue} className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        {/* 6-dot drag handle - left side */}
        <SortableItemHandle className="touch-none shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
          <GripVertical className="h-5 w-5" aria-hidden />
        </SortableItemHandle>

        <div className="min-w-0 flex-1">
          <p className="font-medium">{title}</p>
          {subtitle != null && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {isHeader && (
            <button
              type="button"
              className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => onEdit?.(block)}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          )}
          {isCarousel && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="flex gap-1">
                {cards.slice(0, 3).map((card) => (
                  <div
                    key={card.id}
                    className="h-10 w-16 rounded bg-primary/20 flex items-center justify-center text-xs"
                  >
                    {card.title?.slice(0, 2) || '•'}
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onAddCard?.(block)}>
                + Add New Card
              </Button>
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => onReorderCards?.(block)}
              >
                Re-order Cards
              </button>
            </div>
          )}
          {!isHeader && (
            <div className="mt-2 flex gap-1">
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onEdit?.(block)}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onDuplicate?.(block)}
                title="Duplicate"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onSchedule?.(block)}
                title="Schedule"
              >
                <Calendar className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onAnalytics?.(block)}
                title="Analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
              <button
                type="button"
                className={cn(
                  'rounded p-1 hover:bg-accent',
                  block.favourite ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => onToggleFavourite?.(block)}
                title="Favourite"
              >
                <Star className={cn('h-4 w-4', block.favourite && 'fill-current')} />
              </button>
              {block.locked && (
                <button
                  type="button"
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  title="Locked"
                >
                  <Lock className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <Switch
          checked={block.visible}
          onCheckedChange={(checked) => onVisibleChange?.(block, checked)}
          className="shrink-0"
        />

        {/* Three dots menu - Edit, Delete, etc. */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Block options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => onEdit?.(block)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate?.(block)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCopy?.(block)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSchedule?.(block)}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavourite?.(block)}>
              <Star className={cn('mr-2 h-4 w-4', block.favourite && 'fill-current')} />
              {block.favourite ? 'Remove from favourites' : 'Add to favourites'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleLock?.(block)}>
              {block.locked ? (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Unlock
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock
                </>
              )}
            </DropdownMenuItem>
            {!isHeader && (
              <DropdownMenuItem onClick={() => onAnalytics?.(block)}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete?.(block)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </SortableItem>
  );
}
