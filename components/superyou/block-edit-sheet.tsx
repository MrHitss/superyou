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
import type { ContentBlock } from '@/features/superyou/content-blocks/types';

interface BlockEditSheetProps {
  block: ContentBlock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (block: ContentBlock) => void;
}

export function BlockEditSheet({
  block,
  open,
  onOpenChange,
  onSave,
}: BlockEditSheetProps) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  useEffect(() => {
    if (block) {
      if (block.type === 'header') {
        setText(block.text || '');
        setTitle('');
        setUrl('');
        setShortDescription('');
        setCtaText('');
        setThumbnailUrl('');
      } else if (block.type === 'link') {
        setTitle(block.title || '');
        setUrl(block.url || '');
        setShortDescription(block.shortDescription || '');
        setCtaText(block.ctaText || 'Get it now');
        setThumbnailUrl(block.thumbnailUrl || '');
        setText('');
      } else if (block.type === 'carousel') {
        setTitle(block.title || '');
        setText('');
        setUrl('');
        setShortDescription('');
        setCtaText('');
        setThumbnailUrl('');
      } else {
        setTitle('');
        setText('');
        setUrl('');
        setShortDescription('');
        setCtaText('');
        setThumbnailUrl('');
      }
    }
  }, [block]);

  const handleSave = () => {
    if (!block) return;
    if (block.type === 'header') {
      onSave({ ...block, text });
    } else if (block.type === 'link') {
      onSave({
        ...block,
        title,
        url,
        shortDescription: shortDescription || undefined,
        ctaText: ctaText || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
      });
    } else if (block.type === 'carousel') {
      onSave({ ...block, title });
    }
    onOpenChange(false);
  };

  if (!block) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Block Details</SheetTitle>
        </SheetHeader>
        <SheetBody className="space-y-4">
          {block.type === 'header' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-header-text">Header text</Label>
                <Input
                  id="edit-header-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter header text"
                  maxLength={block.maxLength ?? 35}
                />
                <p className="text-xs text-muted-foreground">
                  {text.length}/{block.maxLength ?? 35}
                </p>
              </div>
            </>
          )}
          {(block.type === 'link' || block.type === 'carousel') && (
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={block.type === 'link' ? 'Link title' : 'Carousel title'}
              />
            </div>
          )}
          {block.type === 'link' && (
            <>
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/30 bg-muted/30">
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt=""
                        className="h-full w-full rounded-full object-cover"
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
                <Label htmlFor="edit-url">URL *</Label>
                <Input
                  id="edit-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-short-desc">Short description</Label>
                <Input
                  id="edit-short-desc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Enter description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cta">CTA Text</Label>
                <Input
                  id="edit-cta"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="Get it now"
                />
              </div>
            </>
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
