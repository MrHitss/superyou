'use client';

import { useState, useEffect } from 'react';
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
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import type { ContentBlock, ContentBlockLock } from '@/features/superyou/content-blocks/types';

const MIN_AGES = [13, 16, 18, 21, 25].map((n) => ({ value: String(n), label: `${n}+` }));

interface BlockLockExpandableProps {
  block: ContentBlock;
  onSave: (blockId: string, lock: ContentBlockLock, activated: boolean) => void;
  onClose: () => void;
}

export function BlockLockExpandable({
  block,
  onSave,
  onClose,
}: BlockLockExpandableProps) {
  const [code, setCode] = useState('');
  const [minAge, setMinAge] = useState<string>('');
  const [description, setDescription] = useState('');
  const [sensitiveContent, setSensitiveContent] = useState(false);
  const [codeExpanded, setCodeExpanded] = useState(true);
  const [dobExpanded, setDobExpanded] = useState(true);

  useEffect(() => {
    if (block.lock) {
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

  const hasAnyLock = code.trim() !== '' || minAge !== '' || sensitiveContent;

  const handleSave = () => {
    const lock: ContentBlockLock = {
      code: code.trim() || undefined,
      minAge: minAge ? Number(minAge) : undefined,
      description: description.trim() || undefined,
      sensitiveContent: sensitiveContent || undefined,
    };
    onSave(block.id, lock, hasAnyLock);
    onClose();
  };

  return (
    <div className="border-t border-border bg-muted/20">
      <div className="flex items-center justify-between bg-muted px-4 py-3">
        <div>
          <h4 className="text-sm font-semibold">Lock Block</h4>
          <p className="text-xs text-muted-foreground">
            Choose when you want this block to appear or disappear on your Store.
          </p>
        </div>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={handleSave}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 px-4 py-4">
        <div className="space-y-2 rounded-lg border border-border p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left font-medium text-sm"
            onClick={() => setCodeExpanded((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <Checkbox checked={!!code.trim()} onCheckedChange={() => {}} readOnly />
              Code
            </span>
            {codeExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {!code.trim() && <p className="text-xs text-muted-foreground">Not set up</p>}
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

        <div className="space-y-2 rounded-lg border border-border p-3">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left font-medium text-sm"
            onClick={() => setDobExpanded((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <Checkbox checked={!!minAge} onCheckedChange={() => {}} readOnly />
              Date of Birth
            </span>
            {dobExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {!minAge && <p className="text-xs text-muted-foreground">Not set up</p>}
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

        <div className="space-y-2">
          <Label className="text-sm">Explain this lock to your visitors (optional)</Label>
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

        <div className="flex items-start gap-3 rounded-lg border border-border p-3">
          <Checkbox
            id="sensitive-exp"
            checked={sensitiveContent}
            onCheckedChange={(c) => setSensitiveContent(!!c)}
          />
          <div className="space-y-1">
            <Label htmlFor="sensitive-exp" className="font-medium text-sm">
              Sensitive Content
            </Label>
            <p className="text-xs text-muted-foreground">
              Visitors must acknowledge that this block may contain content that is not appropriate
              for all audiences.
            </p>
            {sensitiveContent && <p className="text-xs text-primary">Active</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
