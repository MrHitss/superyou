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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock } from 'lucide-react';
import type { ContentBlock, ContentBlockSchedule } from '@/features/superyou/content-blocks/types';

/** Common timezones with GMT offset label */
const TIMEZONES = [
  { value: 'Asia/Kolkata', label: '(GMT+05:30) Asia/Kolkata' },
  { value: 'America/New_York', label: '(GMT-05:00) America/New_York' },
  { value: 'America/Los_Angeles', label: '(GMT-08:00) America/Los_Angeles' },
  { value: 'Europe/London', label: '(GMT+00:00) Europe/London' },
  { value: 'Europe/Paris', label: '(GMT+01:00) Europe/Paris' },
  { value: 'Asia/Dubai', label: '(GMT+04:00) Asia/Dubai' },
  { value: 'Asia/Singapore', label: '(GMT+08:00) Asia/Singapore' },
  { value: 'Asia/Tokyo', label: '(GMT+09:00) Asia/Tokyo' },
  { value: 'Australia/Sydney', label: '(GMT+11:00) Australia/Sydney' },
  { value: 'UTC', label: '(GMT+00:00) UTC' },
];

interface BlockScheduleSheetProps {
  block: ContentBlock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (blockId: string, schedule: ContentBlockSchedule) => void;
}

function toDateLocal(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  } catch {
    return '';
  }
}

function toTimeLocal(iso?: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

function fromDateAndTime(dateStr: string, timeStr: string): string | undefined {
  if (!dateStr) return undefined;
  const time = timeStr || '00:00';
  const d = new Date(`${dateStr}T${time}`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export function BlockScheduleSheet({
  block,
  open,
  onOpenChange,
  onSave,
}: BlockScheduleSheetProps) {
  const [appearDate, setAppearDate] = useState('');
  const [appearTime, setAppearTime] = useState('');
  const [disappearDate, setDisappearDate] = useState('');
  const [disappearTime, setDisappearTime] = useState('');
  const [timezone, setTimezone] = useState('');

  useEffect(() => {
    if (block?.schedule) {
      setAppearDate(toDateLocal(block.schedule.appearAt));
      setAppearTime(toTimeLocal(block.schedule.appearAt));
      setDisappearDate(toDateLocal(block.schedule.disappearAt));
      setDisappearTime(toTimeLocal(block.schedule.disappearAt));
      setTimezone(block.schedule.timezone || '');
    } else {
      setAppearDate('');
      setAppearTime('');
      setDisappearDate('');
      setDisappearTime('');
      const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimezone(TIMEZONES.some((t) => t.value === resolved) ? resolved : 'Asia/Kolkata');
    }
  }, [block]);

  const buildSchedule = (tzOverride?: string) => ({
    appearAt: fromDateAndTime(appearDate, appearTime),
    disappearAt: fromDateAndTime(disappearDate, disappearTime),
    timezone: (tzOverride ?? timezone) || undefined,
  });

  const persistSchedule = (tzOverride?: string) => {
    if (!block) return;
    onSave(block.id, buildSchedule(tzOverride));
  };

  const handleSave = () => {
    if (!block) return;
    onSave(block.id, buildSchedule());
    onOpenChange(false);
  };

  if (!block) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Schedule</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Choose when you want this block to appear or disappear on your profile.
          </p>
        </SheetHeader>
        <SheetBody className="space-y-4">
          <div className="space-y-2">
            <Label>Appear</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={appearDate}
                  onChange={(e) => setAppearDate(e.target.value)}
                  onBlur={() => persistSchedule()}
                  className="pl-9"
                />
              </div>
              <div className="relative w-[120px]">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={appearTime}
                  onChange={(e) => setAppearTime(e.target.value)}
                  onBlur={() => persistSchedule()}
                  className="pl-9"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to show immediately.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Disappear</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={disappearDate}
                  onChange={(e) => setDisappearDate(e.target.value)}
                  onBlur={() => persistSchedule()}
                  className="pl-9"
                />
              </div>
              <div className="relative w-[120px]">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={disappearTime}
                  onChange={(e) => setDisappearTime(e.target.value)}
                  onBlur={() => persistSchedule()}
                  className="pl-9"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to show until you remove it.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={timezone || undefined}
              onValueChange={(val) => {
                setTimezone(val);
                persistSchedule(val);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Schedule</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
