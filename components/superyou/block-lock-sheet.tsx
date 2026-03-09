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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { ContentBlock, ContentBlockLock } from '@/features/superyou/content-blocks/types';

const MIN_AGES = [13, 16, 18, 21, 25].map((n) => ({ value: String(n), label: `${n}+` }));

interface BlockLockSheetProps {
  block: ContentBlock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (blockId: string, lock: ContentBlockLock, activated: boolean) => void;
}

export function BlockLockSheet({
  block,
  open,
  onOpenChange,
  onSave,
}: BlockLockSheetProps) {
  const [code, setCode] = useState('');
  const [minAge, setMinAge] = useState<string>('');
  const [description, setDescription] = useState('');
  const [sensitiveContent, setSensitiveContent] = useState(false);
  const [codeExpanded, setCodeExpanded] = useState(true);
  const [dobExpanded, setDobExpanded] = useState(true);

  useEffect(() => {
    if (block?.lock) {
      setCode(block.lock.code || '');
      setMinAge(block.lock.minAge != null ? String(block.lock.minAge) : '');
      setDescription(block.lock.description || '');
      setSensitiveContent(!!block.lock.sensitiveContent);
    } else {
      setCode('');
      setMinAge('');
      setDescription('');
      setSensitiveContent(false);
    }
  }, [block]);

  const hasAnyLock =
    code.trim() !== '' || minAge !== '' || sensitiveContent;

  const handleSave = () => {
    if (!block) return;
    const lock: ContentBlockLock = {
      code: code.trim() || undefined,
      minAge: minAge ? Number(minAge) : undefined,
      description: description.trim() || undefined,
      sensitiveContent: sensitiveContent || undefined,
    };
    onSave(block.id, lock, hasAnyLock);
    onOpenChange(false);
  };

  if (!block) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Lock Block</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Choose when you want this block to appear or disappear on your Store.
          </p>
        </SheetHeader>
        <SheetBody className="space-y-4">
          {/* Code */}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left font-medium"
              onClick={() => setCodeExpanded((v) => !v)}
            >
              <span className="flex items-center gap-2">
                <Checkbox checked={!!code.trim()} onCheckedChange={() => {}} readOnly />
                Code
              </span>
              {codeExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {code.trim() ? null : (
              <p className="text-xs text-muted-foreground">Not set up</p>
            )}
            {codeExpanded && (
              <div className="space-y-2 pt-2">
                <p className="text-xs text-muted-foreground">
                  Visitors need to enter this code to unlock this block.
                </p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <Input
                      key={i}
                      maxLength={1}
                      className="h-10 w-12 text-center text-lg"
                      value={code[i] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value.toUpperCase().replace(/\D/g, '');
                        const arr = code.split('');
                        arr[i] = v.slice(-1);
                        setCode(arr.join(''));
                      }}
                    />
                  ))}
                </div>
                {!code.trim() && (
                  <p className="text-xs text-muted-foreground">Lock not activated</p>
                )}
              </div>
            )}
          </div>

          {/* Date of Birth / Min age */}
          <div className="space-y-2 rounded-lg border border-border p-3">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left font-medium"
              onClick={() => setDobExpanded((v) => !v)}
            >
              <span className="flex items-center gap-2">
                <Checkbox checked={!!minAge} onCheckedChange={() => {}} readOnly />
                Date of Birth
              </span>
              {dobExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {!minAge ? (
              <p className="text-xs text-muted-foreground">Not set up</p>
            ) : null}
            {dobExpanded && (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium">Set minimum age</p>
                <p className="text-xs text-muted-foreground">
                  Visitors need to be over the selected age to unlock this block.
                </p>
                <Select value={minAge || undefined} onValueChange={setMinAge}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    {MIN_AGES.map((a) => (
                      <SelectItem key={a.value} value={a.value}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!minAge && (
                  <p className="text-xs text-muted-foreground">Lock not activated</p>
                )}
              </div>
            )}
          </div>

          {/* Explain to visitors */}
          <div className="space-y-2">
            <Label>Explain this lock to your visitors (optional)</Label>
            <p className="text-xs text-muted-foreground">
              Give a short description about why you have added this lock.
            </p>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              rows={3}
            />
          </div>

          {/* Sensitive Content */}
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <Checkbox
              id="sensitive"
              checked={sensitiveContent}
              onCheckedChange={(c) => setSensitiveContent(!!c)}
            />
            <div className="space-y-1">
              <Label htmlFor="sensitive" className="font-medium">
                Sensitive Content
              </Label>
              <p className="text-xs text-muted-foreground">
                Visitors must acknowledge that this block may contain content that is not
                appropriate for all audiences.
              </p>
              {sensitiveContent && (
                <p className="text-xs text-primary">Active</p>
              )}
            </div>
          </div>
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
