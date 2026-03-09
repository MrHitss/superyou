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
import { ChevronDown, ChevronUp, Zap } from 'lucide-react';
import type { WhatsAppBlock } from '@/features/superyou/content-blocks/types';

const PREFILLED_MESSAGE_MAX = 116;

export interface WhatsAppChatLinkData {
  phone_code: string;
  number: string;
  prefilled_message?: string;
}

interface WhatsAppChatLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When null, adding new; when provided, editing existing block (standalone) */
  block: WhatsAppBlock | null;
  /** Optional initial values (e.g. when editing a WhatsApp carousel card). Used when block is null. */
  initialData?: WhatsAppChatLinkData;
  /** Called when user clicks Save. Modal closes only after this completes (if it returns a promise). */
  onSave: (data: WhatsAppChatLinkData) => void | Promise<void>;
}

function WhatsAppLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const COUNTRY_CODES = [
  { code: '+91', label: 'India', flag: '🇮🇳' },
  { code: '+1', label: 'US', flag: '🇺🇸' },
  { code: '+44', label: 'UK', flag: '🇬🇧' },
  { code: '+971', label: 'UAE', flag: '🇦🇪' },
  { code: '+61', label: 'Australia', flag: '🇦🇺' },
  { code: '+49', label: 'Germany', flag: '🇩🇪' },
  { code: '+33', label: 'France', flag: '🇫🇷' },
  { code: '+81', label: 'Japan', flag: '🇯🇵' },
  { code: '+86', label: 'China', flag: '🇨🇳' },
  { code: '+55', label: 'Brazil', flag: '🇧🇷' },
];

export function WhatsAppChatLinkModal({
  open,
  onOpenChange,
  block,
  initialData,
  onSave,
}: WhatsAppChatLinkModalProps) {
  const [phoneCode, setPhoneCode] = useState('+91');
  const [number, setNumber] = useState('');
  const [prefilledMessage, setPrefilledMessage] = useState('');
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const isEdit = block != null || (initialData != null && (initialData.phone_code || initialData.number || initialData.prefilled_message));

  useEffect(() => {
    if (open) {
      const data = block
        ? { phone_code: block.phone_code || '+91', number: block.number || '', prefilled_message: block.prefilled_message || '' }
        : initialData
          ? { phone_code: initialData.phone_code || '+91', number: initialData.number || '', prefilled_message: initialData.prefilled_message || '' }
          : null;
      if (data) {
        setPhoneCode(data.phone_code);
        setNumber(data.number);
        setPrefilledMessage(data.prefilled_message || '');
      } else {
        setPhoneCode('+91');
        setNumber('');
        setPrefilledMessage('');
      }
      setLearnMoreOpen(false);
    }
  }, [open, block, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: WhatsAppChatLinkData = {
      phone_code: phoneCode,
      number: number.trim(),
      prefilled_message: prefilledMessage.trim() || undefined,
    };
    setSaving(true);
    try {
      await Promise.resolve(onSave(data));
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b border-border bg-muted/30 px-5 py-4">
          <DialogTitle className="text-base font-semibold">
            {isEdit ? 'Edit WhatsApp chat link' : 'Add a WhatsApp chat link'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Green preview banner */}
          <div className="relative mx-4 mt-4 overflow-hidden rounded-xl bg-[#25D366] p-6">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute left-2 top-2 text-white text-2xl">🎓</div>
              <div className="absolute right-4 top-3 text-white text-xl">✈️</div>
              <div className="absolute bottom-4 left-4 text-white text-xl">📷</div>
              <div className="absolute right-6 bottom-6 text-white text-2xl">⚙️</div>
            </div>
            <div className="relative flex justify-center">
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm">
                <WhatsAppLogoIcon className="h-6 w-6 text-white" />
                <span className="font-medium text-white">Let&apos;s Chat</span>
              </div>
            </div>
          </div>

          {/* Learn more expandable */}
          <div className="mx-4 mt-3">
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-lg bg-[#dcfce7] px-3 py-2.5 text-left text-sm text-[#166534] hover:bg-[#bbf7d0]"
              onClick={() => setLearnMoreOpen((o) => !o)}
            >
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Learn more about this.
              </span>
              {learnMoreOpen ? (
                <ChevronUp className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0" />
              )}
            </button>
            {learnMoreOpen && (
              <div className="mt-2 rounded-lg border border-border bg-muted/20 p-3 text-sm text-muted-foreground">
                Add a WhatsApp chat link so visitors can message you directly. You can set a default
                message that will appear when they open the chat.
              </div>
            )}
          </div>

          {/* Fields: WhatsApp number + Default message */}
          <div className="mt-6 space-y-4 px-5 pb-6">
            <div className="space-y-2">
              <Label htmlFor="wa-number">
                Enter WhatsApp number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <select
                  id="wa-country"
                  className="flex h-10 min-w-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <Input
                  id="wa-number"
                  type="tel"
                  placeholder="Phone number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="flex-1"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wa-message">
                Default message <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="wa-message"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add a message that customers will send to you..."
                value={prefilledMessage}
                onChange={(e) => setPrefilledMessage(e.target.value.slice(0, PREFILLED_MESSAGE_MAX))}
                maxLength={PREFILLED_MESSAGE_MAX}
              />
              <p className="text-right text-xs text-muted-foreground">
                {prefilledMessage.length}/{PREFILLED_MESSAGE_MAX}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-black py-6 text-white hover:bg-black/90"
              disabled={saving}
            >
              {saving ? 'Saving…' : isEdit ? 'Save WhatsApp chat link' : 'Add WhatsApp chat link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
