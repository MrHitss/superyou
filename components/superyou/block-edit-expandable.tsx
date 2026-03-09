'use client';

import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { ContentBlock } from '@/features/superyou/content-blocks/types';
import {
  getBlockTypeByHandlerKey,
  type BlockTypeDefinition,
  type SchemaFieldDef,
} from '@/features/superyou/content-blocks/block-type-schema';
import { useBlockTypes } from '@/features/superyou/content-blocks/use-block-types';
import { SchemaField } from '@/components/superyou/schema-field';

interface BlockEditExpandableProps {
  block: ContentBlock;
  onSave: (block: ContentBlock) => void;
  onClose: () => void;
  /** When provided, called on field blur with current values so parent can persist without closing. */
  onBlurUpdate?: (block: ContentBlock) => void;
  initialExpandedGroup?: string;
}

/** Map block instance to content values keyed by schema field name */
function blockToContentValues(block: ContentBlock, def: BlockTypeDefinition): Record<string, string | number | boolean> {
  const content = def.schema_json.content ?? {};
  const values: Record<string, string | number | boolean> = {};
  for (const key of Object.keys(content)) {
    const fieldDef = content[key];
    const d = fieldDef as SchemaFieldDef;
    if (block.type === 'header' && key === 'title') {
      values[key] = (block as { text?: string }).text ?? '';
    } else if (block.type === 'link') {
      const b = block as { title?: string; url?: string; thumbnailUrl?: string; shortDescription?: string; ctaText?: string };
      if (key === 'title') values[key] = b.title ?? '';
      else if (key === 'url') values[key] = b.url ?? '';
      else if (key === 'thumbnail') values[key] = b.thumbnailUrl ?? '';
      else if (key === 'description') values[key] = b.shortDescription ?? '';
      else if (key === 'cta') values[key] = b.ctaText ?? d.default ?? 'Visit';
      else values[key] = (d.default as string) ?? '';
    } else if (block.type === 'whatsapp') {
      const b = block as {
        title?: string;
        ctaText?: string;
        shortDescription?: string;
        thumbnailUrl?: string;
        phone_code?: string;
        number?: string;
        prefilled_message?: string;
      };
      if (key === 'title') values[key] = b.title ?? '';
      else if (key === 'cta') values[key] = b.ctaText ?? d.default ?? 'DM me on WhatsApp';
      else if (key === 'description') values[key] = b.shortDescription ?? '';
      else if (key === 'thumbnail') values[key] = b.thumbnailUrl ?? '';
      else if (key === 'phone_code') values[key] = b.phone_code ?? '';
      else if (key === 'number') values[key] = b.number ?? '';
      else if (key === 'prefilled_message') values[key] = b.prefilled_message ?? '';
      else values[key] = (d.default as string) ?? '';
    } else if (block.type === 'form') {
      const b = block as { form_id?: string };
      if (key === 'form_id') values[key] = b.form_id ?? '';
      else values[key] = (d.default as string) ?? '';
    } else if (block.type === 'carousel') {
      const b = block as { title?: string };
      if (key === 'title') values[key] = b.title ?? '';
      else values[key] = (d.default as string) ?? '';
    } else {
      values[key] = (d.default as string) ?? '';
    }
  }
  return values;
}

/** Build updated block from content values */
function contentValuesToBlock(
  block: ContentBlock,
  def: BlockTypeDefinition,
  values: Record<string, string | number | boolean>
): ContentBlock {
  if (block.type === 'header') {
    return { ...block, text: String(values.title ?? '') };
  }
  if (block.type === 'link') {
    return {
      ...block,
      title: String(values.title ?? ''),
      url: String(values.url ?? ''),
      thumbnailUrl: values.thumbnail ? String(values.thumbnail) : undefined,
      shortDescription: values.description ? String(values.description) : undefined,
      ctaText: values.cta ? String(values.cta) : undefined,
    };
  }
  if (block.type === 'whatsapp') {
    return {
      ...block,
      title: String(values.title ?? ''),
      ctaText: values.cta ? String(values.cta) : undefined,
      shortDescription: values.description ? String(values.description) : undefined,
      thumbnailUrl: values.thumbnail ? String(values.thumbnail) : undefined,
      phone_code: String(values.phone_code ?? ''),
      number: String(values.number ?? ''),
      prefilled_message: values.prefilled_message ? String(values.prefilled_message) : undefined,
    };
  }
  if (block.type === 'form') {
    return { ...block, form_id: String(values.form_id ?? '') };
  }
  if (block.type === 'carousel') {
    return { ...block, title: String(values.title ?? '') };
  }
  return block;
}

export function BlockEditExpandable({
  block,
  onSave,
  onClose,
  onBlurUpdate,
  initialExpandedGroup,
}: BlockEditExpandableProps) {
  const { blockTypes } = useBlockTypes();
  const def = useMemo(
    () => getBlockTypeByHandlerKey(block.type, blockTypes),
    [block.type, blockTypes]
  );
  const contentSchema = def?.schema_json?.content ?? {};
  const contentEntries = useMemo(
    () => Object.entries(contentSchema) as [string, SchemaFieldDef][],
    [contentSchema]
  );

  const [values, setValues] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    if (def) setValues(blockToContentValues(block, def));
  }, [block, def]);

  const handleChange = (fieldKey: string, value: string | number | boolean) => {
    setValues((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleSave = () => {
    if (!def) return;
    const updated = contentValuesToBlock(block, def, values);
    onSave(updated);
    onClose();
  };

  const handleBlur = () => {
    if (!def || !onBlurUpdate) return;
    const updated = contentValuesToBlock(block, def, values);
    onBlurUpdate(updated);
  };

  const sortByOrder = (entries: [string, SchemaFieldDef][]) =>
    [...entries].sort(([, a], [, b]) => (a.order ?? 999) - (b.order ?? 999));

  const generalFields = sortByOrder(contentEntries.filter(([, d]) => d.group === 'general'));

  if (!def) {
    return (
      <div className="border-t border-border bg-muted/20 px-4 py-4">
        <p className="text-sm text-muted-foreground">Unknown block type.</p>
        <button type="button" className="mt-2 text-sm text-primary hover:underline" onClick={onClose}>
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-muted/20">
      <div className="flex items-center justify-between bg-muted px-4 py-3">
        <h4 className="text-sm font-semibold">Block Details</h4>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={handleSave}
          aria-label="Save and close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="space-y-4 px-4 py-4">
        {generalFields.map(([fieldKey, fieldDef]) => (
          <SchemaField
            key={fieldKey}
            fieldKey={fieldKey}
            def={fieldDef}
            value={values[fieldKey]}
            onChange={(v) => handleChange(fieldKey, v)}
            onBlur={onBlurUpdate ? handleBlur : undefined}
          />
        ))}
      </div>
    </div>
  );
}
