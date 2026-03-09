'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ImagePlus } from 'lucide-react';
import type { SchemaFieldDef } from '@/features/superyou/content-blocks/block-type-schema';

interface SchemaFieldProps {
  fieldKey: string;
  def: SchemaFieldDef;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
  /** Called when user leaves the field (blur). Use to persist without closing the form. */
  onBlur?: () => void;
  /** For select with source (e.g. user_forms), options can be passed when loaded */
  options?: { value: string; label: string }[];
}

export function SchemaField({
  fieldKey,
  def,
  value,
  onChange,
  onBlur,
  options = [],
}: SchemaFieldProps) {
  const label = def.label ?? fieldKey;
  const required = def.required === true;
  const id = `field-${fieldKey}`;

  if (def.type === 'text') {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label}
          {required && ' *'}
        </Label>
        <Input
          id={id}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={label}
          maxLength={def.max_length}
        />
        {def.max_length != null && (
          <p className="text-xs text-muted-foreground">
            {String(value ?? '').length}/{def.max_length}
          </p>
        )}
      </div>
    );
  }

  if (def.type === 'textarea') {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label}
          {required && ' *'}
        </Label>
        <textarea
          id={id}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={label}
        />
      </div>
    );
  }

  if (def.type === 'url') {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label}
          {required && ' *'}
        </Label>
        <Input
          id={id}
          type="url"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="https://..."
        />
      </div>
    );
  }

  if (def.type === 'image') {
    const url = (value as string) ?? '';
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30">
            {url ? (
              <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Input
              value={url}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder="Image URL"
            />
          </div>
        </div>
      </div>
    );
  }

  if (def.type === 'select') {
    const selectOptions: { value: string; label: string }[] =
      options.length > 0 ? options : (def.options ?? []).map((o) => ({ value: o, label: o }));
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {label}
          {required && ' *'}
        </Label>
        <select
          id={id}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={(value as string) ?? def.default ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        >
          {!required && <option value="">Select...</option>}
          {selectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (def.type === 'boolean') {
    const checked = value === true || (value === undefined && def.default === true);
    return (
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor={id} className="font-normal">
          {label}
        </Label>
      </div>
    );
  }

  if (def.type === 'schedule') {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">Use the Schedule panel for this block.</p>
      </div>
    );
  }

  return null;
}
