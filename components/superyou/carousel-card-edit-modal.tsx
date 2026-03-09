'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Calendar, BarChart3, Clock, MoreVertical, X, Link2, FileInput } from 'lucide-react';
import type { CarouselCard, CarouselCardBlockType, CarouselBlock } from '@/features/superyou/content-blocks/types';

function WhatsAppLogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export interface CarouselCardEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: CarouselBlock | null;
  card: CarouselCard | null;
  onSave: (card: CarouselCard) => void;
  onRemove?: (card: CarouselCard) => void;
  /** For WhatsApp card: open the number/prefilled message modal */
  onOpenWhatsAppDetails?: () => void;
}

const TABS = [
  { id: 'edit', label: 'Edit', icon: Pencil },
  { id: 'schedule', label: 'Schedule', icon: Calendar },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'timer', label: 'Timer', icon: Clock },
] as const;

export function CarouselCardEditModal({
  open,
  onOpenChange,
  block,
  card,
  onSave,
  onRemove,
  onOpenWhatsAppDetails,
}: CarouselCardEditModalProps) {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('edit');
  const [title, setTitle] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [visible, setVisible] = useState(true);

  const blockType: CarouselCardBlockType = card?.blockType ?? 'link';

  useEffect(() => {
    if (card) {
      setTitle(card.title ?? '');
      setCtaText(card.ctaText ?? 'Get now');
      setUrl(card.url ?? '');
      setThumbnailUrl(card.thumbnailUrl ?? '');
      setVisible(true);
    }
  }, [card]);

  const handleDone = () => {
    if (!card) return;
    onSave({
      ...card,
      title: title || card.title,
      ctaText: ctaText || card.ctaText || 'Get now',
      url: blockType === 'link' ? (url || card.url) : card.url,
      thumbnailUrl: blockType === 'link' ? (thumbnailUrl || undefined) : card.thumbnailUrl,
    });
    onOpenChange(false);
  };

  const handleRemove = () => {
    if (card && onRemove) {
      onRemove(card);
      onOpenChange(false);
    }
  };

  if (!card) return null;

  const displayTitle = title || (blockType === 'whatsapp' ? 'DM me on WhatsApp' : blockType === 'form' ? 'Form' : 'Link');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-5 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <DialogTitle className="text-base font-semibold shrink-0">
              Edit carousel card
            </DialogTitle>
            <span className="truncate text-sm font-medium text-muted-foreground">
              {displayTitle}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Switch
              checked={visible}
              onCheckedChange={setVisible}
              className="data-[state=checked]:bg-[#25D366]"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="More options"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleRemove} className="text-destructive focus:text-destructive">
                  Remove card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              type="button"
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border px-5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Card Details - Edit tab content */}
        {activeTab === 'edit' && (
          <div className="px-5 py-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Card Details</h3>
            {blockType === 'link' && (
              <div className="mb-4 space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted/30">
                    {thumbnailUrl ? (
                      <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/50 text-muted-foreground">
                        <Link2 className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs w-fit"
                      onClick={() => setThumbnailUrl(thumbnailUrl ? '' : 'https://placehold.co/400x400/14b8a6/ffffff?text=Thumb')}
                    >
                      {thumbnailUrl ? 'Remove thumbnail' : 'Set thumbnail'}
                    </Button>
                    <Input
                      value={thumbnailUrl}
                      onChange={(e) => setThumbnailUrl(e.target.value)}
                      placeholder="Or paste image URL"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
            {blockType !== 'link' && (
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#dcfce7] text-[#25D366]">
                    {blockType === 'whatsapp' ? (
                      <WhatsAppLogoIcon className="h-8 w-8" />
                    ) : (
                      <FileInput className="h-8 w-8" />
                    )}
                  </div>
                  {blockType === 'whatsapp' && onOpenWhatsAppDetails && (
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onOpenWhatsAppDetails}>
                        Change
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleRemove}>
                        Remove
                      </Button>
                    </div>
                  )}
                  {blockType === 'form' && onRemove && (
                    <Button variant="outline" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={handleRemove}>
                      Remove
                    </Button>
                  )}
                </div>
                <div className="flex-1 min-w-0" />
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-edit-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="card-edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={blockType === 'whatsapp' ? 'DM me on WhatsApp' : blockType === 'link' ? 'e.g. Google' : 'Card title'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-edit-cta">
                  CTA Text <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="card-edit-cta"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Check it out"
                />
              </div>
              {blockType === 'link' && (
                <div className="space-y-2">
                  <Label htmlFor="card-edit-url">
                    URL <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="card-edit-url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleDone} className="bg-foreground text-background hover:bg-foreground/90">
                Done
              </Button>
            </div>
          </div>
        )}

        {activeTab !== 'edit' && (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Coming soon
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
