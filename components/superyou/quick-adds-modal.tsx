'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  Package,
  Magnet,
  MessageCircle,
  Zap,
  FolderPlus,
  Calendar,
  MessageSquare,
  Rocket,
  Award,
  Lock,
} from 'lucide-react';

const QUICK_ADD_BUTTONS = [
  { id: 'carousel', label: 'Carousel', icon: LayoutGrid },
  { id: 'existing_products', label: 'Existing Products', icon: Package },
  { id: 'lead_magnet', label: 'Lead Magnet', icon: Magnet },
  { id: 'whatsapp', label: 'WhatsApp link', icon: MessageCircle },
  { id: 'referral', label: 'Referral Link', icon: Zap },
  { id: 'cj_affiliate', label: 'CJ Affiliate Link', icon: Zap, iconLabel: 'CJ' },
] as const;

const CREATE_SELL_OPTIONS = [
  {
    id: 'digital_files',
    title: 'Sell Digital Files',
    description: 'Sell E-books, PDF files, Images, videos, and more.',
    icon: FolderPlus,
  },
  {
    id: 'one_on_one',
    title: 'Offer 1-on-1 Session',
    description: 'Set up a new 1-on-1 session to offer to your visitors/audience.',
    icon: Calendar,
  },
  {
    id: 'membership',
    title: 'Recurring Membership',
    description: 'Start a membership business on Telegram or Discord.',
    icon: MessageSquare,
  },
  {
    id: 'event',
    title: 'Host Event or Webinar',
    description: 'Sell live event tickets, coaching appointments, or classes.',
    icon: Rocket,
  },
  {
    id: 'course',
    title: 'Sell a course',
    description: 'Sell access to your video collection or online classes.',
    icon: Award,
  },
  {
    id: 'locked_content',
    title: 'Locked Content',
    description: 'Lock any file for a certain price. Visitors unlock to access.',
    icon: Lock,
  },
] as const;

interface QuickAddsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (id: string) => void;
}

export function QuickAddsModal({ open, onOpenChange, onSelect }: QuickAddsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick adds</DialogTitle>
        </DialogHeader>

        {/* Quick add buttons */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {QUICK_ADD_BUTTONS.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              className="flex h-24 flex-col gap-2"
              onClick={() => onSelect?.(item.id)}
            >
              {'iconLabel' in item ? (
                <span className="text-lg font-bold text-primary">{item.iconLabel}</span>
              ) : (
                <item.icon className="h-6 w-6" />
              )}
              <span className="text-xs">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Create and sell */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold">Create and sell</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Make money by selling products and services
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {CREATE_SELL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className="flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent"
                onClick={() => onSelect?.(opt.id)}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <opt.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{opt.title}</p>
                  <p className="text-sm text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
