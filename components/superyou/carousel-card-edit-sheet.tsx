'use client';

import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus } from 'lucide-react';
import type { CarouselCard, CarouselCardBlockType } from '@/features/superyou/content-blocks/types';

export interface CarouselCardEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CarouselCard | null;
  onSave: (card: CarouselCard) => void;
}

function getSheetTitle(blockType: CarouselCardBlockType): string {
  switch (blockType) {
    case 'link':
      return 'Edit link card';
    case 'whatsapp':
      return 'Edit WhatsApp card';
    case 'form':
      return 'Edit form card';
    default:
      return 'Edit card';
  }
}

export function CarouselCardEditSheet({
  open,
  onOpenChange,
  card,
  onSave,
}: CarouselCardEditSheetProps) {
  const blockType: CarouselCardBlockType = card?.blockType ?? 'link';

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [phone_code, setPhoneCode] = useState('');
  const [number, setNumber] = useState('');
  const [prefilled_message, setPrefilledMessage] = useState('');
  const [form_id, setFormId] = useState('');

  useEffect(() => {
    if (card) {
      setTitle(card.title ?? '');
      setUrl(card.url ?? '');
      setShortDescription(card.shortDescription ?? '');
      setCtaText(card.ctaText ?? '');
      setThumbnailUrl(card.thumbnailUrl ?? '');
      setPhoneCode(card.phone_code ?? '');
      setNumber(card.number ?? '');
      setPrefilledMessage(card.prefilled_message ?? '');
      setFormId(card.form_id ?? '');
    }
  }, [card]);

  const handleSave = () => {
    if (!card) return;
    const updated: CarouselCard = {
      ...card,
      blockType,
      title: title || undefined,
      url: url || undefined,
      shortDescription: shortDescription || undefined,
      ctaText: ctaText || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      phone_code: phone_code || undefined,
      number: number || undefined,
      prefilled_message: prefilled_message || undefined,
      form_id: form_id || undefined,
    };
    onSave(updated);
    onOpenChange(false);
  };

  if (!card) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{getSheetTitle(blockType)}</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-title">Title</Label>
            <Input
              id="card-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={blockType === 'link' ? 'Link title' : blockType === 'whatsapp' ? 'WhatsApp' : 'Form title'}
            />
          </div>

          {blockType === 'link' && (
            <>
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded border border-dashed border-muted-foreground/30 bg-muted/30">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt=""
                        className="h-full w-full rounded object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setThumbnailUrl(thumbnailUrl ? '' : 'https://placehold.co/160x160')}
                  >
                    {thumbnailUrl ? 'Remove' : 'Set thumbnail'}
                  </Button>
                </div>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Image URL"
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-url">URL *</Label>
                <Input
                  id="card-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-desc">Short description</Label>
                <Input
                  id="card-desc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Optional description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-cta">CTA Text</Label>
                <Input
                  id="card-cta"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Get it now"
                />
              </div>
            </>
          )}

          {blockType === 'whatsapp' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="card-phone-code">Phone code</Label>
                <Input
                  id="card-phone-code"
                  value={phone_code}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  placeholder="e.g. +1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-number">Phone number</Label>
                <Input
                  id="card-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-prefilled">Prefilled message</Label>
                <Textarea
                  id="card-prefilled"
                  value={prefilled_message}
                  onChange={(e) => setPrefilledMessage(e.target.value)}
                  placeholder="Optional message when user opens WhatsApp"
                  rows={3}
                />
              </div>
            </>
          )}

          {blockType === 'form' && (
            <div className="space-y-2">
              <Label htmlFor="card-form-id">Form ID</Label>
              <Input
                id="card-form-id"
                value={form_id}
                onChange={(e) => setFormId(e.target.value)}
                placeholder="Form identifier"
              />
            </div>
          )}
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
