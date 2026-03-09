'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  MessageCircle,
  FileInput,
  LayoutGrid,
  Package,
  Magnet,
  Zap,
  FolderPlus,
  Calendar,
  MessageSquare,
  Rocket,
  Award,
  Lock,
} from 'lucide-react';

/** Blocks shown in Quick Adds (Carousel, WhatsApp, Form). Link is on main screen; rest coming later. */
const QUICK_ADD_BLOCKS = [
  { id: 'carousel', label: 'Carousel', description: 'Container for link/whatsapp/form blocks', icon: LayoutGrid },
  { id: 'whatsapp', label: 'WhatsApp', description: 'DM me on WhatsApp with optional prefilled message', icon: MessageCircle },
  { id: 'form', label: 'Form (Lead Magnet)', description: 'Embed a lead form to capture leads', icon: FileInput },
] as const;

const QUICK_ADD_LINKS = [
  { id: 'existing_products', label: 'Existing Products', icon: Package },
  { id: 'lead_magnet', label: 'Lead Magnet', icon: Magnet },
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

        {/* Quick adds: Carousel, WhatsApp, Form (Lead Magnet) */}
        <div>
          {/* <h3 className="text-sm font-semibold">Quick adds</h3> */}
          <p className="mt-0.5 text-sm text-muted-foreground">
            Add Carousel, WhatsApp, or a lead form to your profile
          </p>
          <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-3">
            {QUICK_ADD_BLOCKS.map((block) => {
              const Icon = block.icon;
              return (
                <Button
                  key={block.id}
                  variant="outline"
                  className="flex h-auto min-w-0 flex-col items-start gap-2 overflow-hidden whitespace-normal p-4 text-left"
                  onClick={() => onSelect?.(block.id)}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="min-w-0 shrink-0 font-medium">{block.label}</span>
                  <span className="w-full min-w-0 break-words text-left text-xs text-muted-foreground">{block.description}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quick add links */}
        {/* <div>
          <h3 className="text-sm font-semibold">Quick add links</h3>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {QUICK_ADD_LINKS.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="flex h-20 flex-col gap-2"
                onClick={() => onSelect?.(item.id)}
              >
                {'iconLabel' in item ? (
                  <span className="text-lg font-bold text-primary">{item.iconLabel}</span>
                ) : (
                  <item.icon className="h-5 w-5" />
                )}
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div> */}

        {/* Create and sell — Coming soon */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Create and sell</h3>
            <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Coming soon
            </span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Make money by selling products and services
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {CREATE_SELL_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                className="relative flex items-start gap-3 rounded-lg border border-border p-3 opacity-60"
              >
                <span className="absolute right-2 top-2 rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Coming soon
                </span>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <opt.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1 pr-20">
                  <p className="font-medium">{opt.title}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
