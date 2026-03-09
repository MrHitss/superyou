'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageCircle, FileInput, Link2 } from 'lucide-react';
import type { CarouselCardBlockType } from '@/features/superyou/content-blocks/types';

/** Block types that can be added as carousel cards (carousel cannot be nested) */
const CAROUSEL_CARD_BLOCKS: {
  id: CarouselCardBlockType;
  label: string;
  description: string;
  icon: typeof Link2;
}[] = [
  {
    id: 'link',
    label: 'Link',
    description: 'External link, product, or affiliate link',
    icon: Link2,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'DM me on WhatsApp with optional prefilled message',
    icon: MessageCircle,
  },
  {
    id: 'form',
    label: 'Form (Lead Magnet)',
    description: 'Embed a lead form to capture leads',
    icon: FileInput,
  },
];

export interface CarouselAddCardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (blockType: CarouselCardBlockType) => void;
}

export function CarouselAddCardModal({
  open,
  onOpenChange,
  onSelect,
}: CarouselAddCardModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add card to carousel</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Include external links, SuperProfile products, and affiliate links as cards in your carousel.
        </p>
        <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
          {CAROUSEL_CARD_BLOCKS.map((block) => {
            const Icon = block.icon;
            return (
              <Button
                key={block.id}
                variant="outline"
                className="flex h-auto min-w-0 flex-col items-start gap-2 overflow-hidden whitespace-normal p-4 text-left"
                onClick={() => {
                  onSelect(block.id);
                  onOpenChange(false);
                }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="min-w-0 shrink-0 font-medium">{block.label}</span>
                <span className="w-full min-w-0 break-words text-left text-xs text-muted-foreground">
                  {block.description}
                </span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
