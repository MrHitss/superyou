'use client';

import { useState, useEffect } from 'react';
import { ContentBlock } from '@/features/superyou/content-blocks/types';
import type {
  ContentBlockSchedule,
  ContentBlockLock,
  BlockAnimationType,
  BlockLayoutType,
  CarouselCard,
} from '@/features/superyou/content-blocks/types';
import { SortableItem, SortableItemHandle } from '@/components/ui/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  LayoutGrid,
  Sparkles,
  MessageCircle,
  Link2,
  FileInput,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBlockTypeByHandlerKey, getBlockFeatures } from '@/features/superyou/content-blocks/block-type-schema';
import { useBlockTypes } from '@/features/superyou/content-blocks/use-block-types';
import { BlockEditExpandable } from '@/components/superyou/block-edit-expandable';
import { BlockScheduleExpandable } from '@/components/superyou/block-schedule-expandable';
import { BlockLockExpandable } from '@/components/superyou/block-lock-expandable';
import { BlockAnimationExpandable } from '@/components/superyou/block-animation-expandable';
import { BlockLayoutExpandable } from '@/components/superyou/block-layout-expandable';

export type BlockExpandedMode = 'edit' | 'schedule' | 'lock' | 'animation' | 'layout' | null;

export interface ContentBlockRowCallbacks {
  /** When opening edit for WhatsApp block with WhatsApp icon, pass 'whatsapp' to expand that section */
  onEdit?: (block: ContentBlock, expandedGroup?: string) => void;
  /** When provided, WhatsApp icon opens this (e.g. dedicated WhatsApp modal) instead of inline edit */
  onWhatsAppDetailsOpen?: (block: ContentBlock) => void;
  onDelete?: (block: ContentBlock) => void;
  onCopy?: (block: ContentBlock) => void;
  onSchedule?: (block: ContentBlock) => void;
  onLockOpen?: (block: ContentBlock) => void;
  onLayoutOpen?: (block: ContentBlock) => void;
  onAnimationOpen?: (block: ContentBlock) => void;
  onToggleLock?: (block: ContentBlock) => void;
  onToggleFavourite?: (block: ContentBlock) => void;
  onAnalytics?: (block: ContentBlock) => void;
  onDuplicate?: (block: ContentBlock) => void;
  onVisibleChange?: (block: ContentBlock, visible: boolean) => void;
  onHeaderTextChange?: (block: ContentBlock, text: string) => void;
  onAddCard?: (block: ContentBlock) => void;
  onEditCard?: (block: ContentBlock, card: CarouselCard) => void;
  onReorderCards?: (block: ContentBlock) => void;
  onEditSave?: (block: ContentBlock) => void;
  /** Called when user blurs a content field (persist without closing the edit panel). */
  onEditBlur?: (block: ContentBlock) => void;
  onScheduleSave?: (blockId: string, schedule: ContentBlockSchedule) => void;
  onLockSave?: (blockId: string, lock: ContentBlockLock, activated: boolean) => void;
  onAnimationSave?: (blockId: string, animation: BlockAnimationType) => void;
  onLayoutSave?: (blockId: string, layout: BlockLayoutType) => void;
  onExpandClose?: () => void;
}

export interface ContentBlockRowProps extends ContentBlockRowCallbacks {
  block: ContentBlock;
  value?: string;
  /** Which panel is expanded inline */
  expandedMode?: BlockExpandedMode;
  /** When in edit mode, which group to expand (e.g. 'whatsapp') */
  expandedEditGroup?: string;
}

function getBlockTitle(block: ContentBlock): string {
  switch (block.type) {
    case 'header':
      return block.text || 'Header';
    case 'carousel':
      return block.title || 'Enter carousel title';
    case 'link':
      return block.title || 'Link';
    case 'whatsapp':
      return block.title || 'WhatsApp';
    case 'form':
      return block.title ?? 'Form';
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
  if (block.type === 'whatsapp') {
    const num = block.phone_code && block.number ? `${block.phone_code} ${block.number}` : null;
    return num ?? undefined;
  }
  return undefined;
}

function HeaderTextInput({
  block,
  onBlur,
}: {
  block: ContentBlock & { type: 'header' };
  onBlur?: (block: ContentBlock, text: string) => void;
}) {
  const [localText, setLocalText] = useState(block.text ?? '');
  useEffect(() => {
    setLocalText(block.text ?? '');
  }, [block.id, block.text]);

  return (
    <div className="flex items-center gap-2">
      <Input
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={() => onBlur?.(block, localText)}
        placeholder="Header text"
        maxLength={block.maxLength ?? 35}
        className="h-8 max-w-[200px] font-medium"
      />
      <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
      <span className="text-xs text-muted-foreground shrink-0">
        {localText.length}/{block.maxLength ?? 35}
      </span>
    </div>
  );
}

export function ContentBlockRow({
  block,
  value,
  expandedMode = null,
  expandedEditGroup,
  onEdit,
  onWhatsAppDetailsOpen,
  onDelete,
  onCopy,
  onSchedule,
  onLockOpen,
  onLayoutOpen,
  onAnimationOpen,
  onToggleLock,
  onToggleFavourite,
  onAnalytics,
  onDuplicate,
  onVisibleChange,
  onHeaderTextChange,
  onAddCard,
  onEditCard,
  onReorderCards,
  onEditSave,
  onEditBlur,
  onScheduleSave,
  onLockSave,
  onAnimationSave,
  onLayoutSave,
  onExpandClose,
}: ContentBlockRowProps) {
  const sortableValue = value ?? block.id;
  const subtitle = getBlockSubtitle(block);
  const title = getBlockTitle(block);
  const { blockTypes } = useBlockTypes();
  const blockDef = getBlockTypeByHandlerKey(block.type, blockTypes);
  const features = getBlockFeatures(blockDef);

  const isCarousel = block.type === 'carousel';
  const isHeader = block.type === 'header';
  const isWhatsapp = block.type === 'whatsapp';
  const cards = block.type === 'carousel' ? block.cards : [];

  return (
    <SortableItem value={sortableValue} className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3 p-4">
        {/* 6-dot drag handle - left side */}
        <SortableItemHandle className="touch-none shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
          <GripVertical className="h-5 w-5" aria-hidden />
        </SortableItemHandle>

        <div className="min-w-0 flex-1">
          {isHeader ? (
            <>
              <HeaderTextInput
                block={block}
                onBlur={onHeaderTextChange}
              />
            </>
          ) : (
            <>
              <p className="font-medium">{title}</p>
              {subtitle != null && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </>
          )}
          {isCarousel && (
            <div className="mt-2 space-y-2">
              {cards.length === 0 ? (
                <>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-16 w-24 flex-shrink-0 rounded-t-lg rounded-b border-2 border-dashed border-muted-foreground/30 bg-muted/30 flex flex-col items-center justify-center gap-1 p-2"
                      >
                        <LayoutGrid className="h-6 w-6 text-muted-foreground/60" />
                        <div className="h-1.5 w-8 rounded bg-muted-foreground/30" />
                        <div className="h-1.5 w-6 rounded bg-muted-foreground/30" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Include external links, SuperProfile products, and affiliate links as cards in your carousel.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-dashed"
                    onClick={() => onAddCard?.(block)}
                  >
                    + Add New Card
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {cards.length} card{cards.length !== 1 ? 's' : ''}
                    </span>
                    <button
                      type="button"
                      className="text-sm text-primary hover:underline"
                      onClick={() => onAddCard?.(block)}
                    >
                      + Add New Card
                    </button>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                      onClick={() => onReorderCards?.(block)}
                    >
                      Re-order Cards
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cards.map((card) => {
                      const cardType = card.blockType ?? 'link';
                      const CardIcon =
                        cardType === 'whatsapp'
                          ? MessageCircle
                          : cardType === 'form'
                            ? FileInput
                            : Link2;
                      const cardTitle =
                        card.title ||
                        (cardType === 'link' && card.url
                          ? card.url.replace(/^https?:\/\//, '').slice(0, 30)
                          : cardType === 'form'
                            ? 'Form'
                            : cardType === 'whatsapp'
                              ? 'WhatsApp'
                              : 'New card');
                      return (
                        <div
                          key={card.id}
                          className="group relative flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-background p-2 shadow-sm"
                        >
                          <button
                            type="button"
                            className="absolute right-1 top-1 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground group-hover:opacity-100"
                            onClick={() => onEditCard?.(block, card)}
                            title="Edit card"
                            aria-label="Edit card"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <div className="flex flex-col items-center gap-1.5 text-center">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <CardIcon className="h-4 w-4" />
                            </div>
                            <span className="line-clamp-2 min-w-0 text-xs font-medium text-foreground">
                              {cardTitle}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
          {!isHeader && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {features.showEdit && (
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1.5 rounded-md transition-colors',
                    expandedMode === 'edit'
                      ? 'bg-muted px-2 py-1.5 text-sm font-medium text-foreground'
                      : 'rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                  onClick={() => onEdit?.(block)}
                  title="Edit"
                >
                  <Pencil className="h-4 w-4 shrink-0" />
                  {expandedMode === 'edit' && <span>Edit</span>}
                </button>
              )}
              {features.showWhatsApp && (
                <button
                  type="button"
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => (onWhatsAppDetailsOpen ? onWhatsAppDetailsOpen(block) : onEdit?.(block, 'whatsapp'))}
                  title="WhatsApp details"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-green-600" />
                </button>
              )}
              {features.showCopy && (
                <button
                  type="button"
                  className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                  onClick={() => onDuplicate?.(block)}
                  title="Duplicate"
                >
                  <Copy className="h-4 w-4" />
                </button>
              )}
              {features.showLayout && (
                <button
                  type="button"
                  className={cn(
                    'flex items-center gap-1.5 rounded-md transition-colors',
                    expandedMode === 'layout'
                      ? 'bg-muted px-2 py-1.5 text-sm font-medium text-foreground'
                      : 'rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                  onClick={() => onLayoutOpen?.(block)}
                  title="Layout"
                >
                  <LayoutGrid className="h-4 w-4 shrink-0" />
                  {expandedMode === 'layout' && <span>Layouts</span>}
                </button>
              )}
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 rounded-md transition-colors',
                  expandedMode === 'animation'
                    ? 'bg-muted px-2 py-1.5 text-sm font-medium text-foreground'
                    : 'rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                onClick={() => onAnimationOpen?.(block)}
                title="Animation"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                {expandedMode === 'animation' && <span>Animation</span>}
              </button>
              {features.showFavourite && (
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
              )}
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 rounded-md transition-colors',
                  expandedMode === 'schedule'
                    ? 'bg-muted px-2 py-1.5 text-sm font-medium text-foreground'
                    : 'rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
                onClick={() => onSchedule?.(block)}
                title="Schedule"
              >
                <Calendar className="h-4 w-4 shrink-0" />
                {expandedMode === 'schedule' && <span>Schedule</span>}
              </button>
              <button
                type="button"
                className={cn(
                  'flex items-center gap-1.5 rounded-md transition-colors',
                  expandedMode === 'lock'
                    ? 'bg-muted px-2 py-1.5 text-sm font-medium text-foreground'
                    : 'rounded p-1 hover:bg-accent',
                  block.locked && expandedMode !== 'lock' && 'text-primary',
                  !block.locked && expandedMode !== 'lock' && 'text-muted-foreground hover:text-foreground',
                )}
                onClick={() => onLockOpen?.(block) ?? onToggleLock?.(block)}
                title="Lock"
              >
                <Lock className="h-4 w-4 shrink-0" />
                {expandedMode === 'lock' && <span>Lock</span>}
              </button>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => onAnalytics?.(block)}
                title="Analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </button>
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
            {features.showEdit && (
              <DropdownMenuItem onClick={() => onEdit?.(block)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {features.showWhatsApp && (
              <DropdownMenuItem onClick={() => onWhatsAppDetailsOpen?.(block)}>
                <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
                WhatsApp details
              </DropdownMenuItem>
            )}
            {!isHeader && (
              <>
                {features.showLayout && (
                  <DropdownMenuItem onClick={() => onLayoutOpen?.(block)}>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Layout
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onAnimationOpen?.(block)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Animation
                </DropdownMenuItem>
              </>
            )}
            {features.showCopy && (
              <>
                <DropdownMenuItem onClick={() => onDuplicate?.(block)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCopy?.(block)}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem onClick={() => onSchedule?.(block)}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </DropdownMenuItem>
            {features.showFavourite && (
              <DropdownMenuItem onClick={() => onToggleFavourite?.(block)}>
                <Star className={cn('mr-2 h-4 w-4', block.favourite && 'fill-current')} />
                {block.favourite ? 'Remove from favourites' : 'Add to favourites'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                block.locked ? onToggleLock?.(block) : onLockOpen?.(block) ?? onToggleLock?.(block)
              }
            >
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
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expandedMode ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          {expandedMode === 'edit' && onEditSave && onExpandClose && (
            <BlockEditExpandable
              block={block}
              onSave={onEditSave}
              onClose={onExpandClose}
              onBlurUpdate={onEditBlur}
              initialExpandedGroup={expandedEditGroup}
            />
          )}
          {expandedMode === 'schedule' && onScheduleSave && onExpandClose && (
            <BlockScheduleExpandable
              block={block}
              onSave={onScheduleSave}
              onClose={onExpandClose}
            />
          )}
          {expandedMode === 'lock' && onLockSave && onExpandClose && (
            <BlockLockExpandable
              block={block}
              onSave={onLockSave}
              onClose={onExpandClose}
            />
          )}
          {expandedMode === 'animation' && onAnimationSave && onExpandClose && (
            <BlockAnimationExpandable
              block={block}
              onSave={onAnimationSave}
              onClose={onExpandClose}
            />
          )}
          {expandedMode === 'layout' && onLayoutSave && onExpandClose && (
            <BlockLayoutExpandable
              block={block}
              onSave={onLayoutSave}
              onClose={onExpandClose}
            />
          )}
        </div>
      </div>
    </SortableItem>
  );
}
