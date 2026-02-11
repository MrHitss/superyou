import type { LucideIcon } from 'lucide-react';
import {
  Instagram,
  Paperclip,
  Magnet,
} from 'lucide-react';

/** Theme sidebar menu is driven by config/menu.config.tsx MENU_SIDEBAR (Dashboard, Store, Payments, Learn, Audience, Refer & Earn). */

export interface SuperYouAppItem {
  title: string;
  icon: LucideIcon;
  active?: boolean;
}

export const SUPERYOU_APPS: SuperYouAppItem[] = [
  { title: 'AutoDM', icon: Instagram },
  { title: 'SuperLinks', icon: Paperclip },
  { title: 'Lead Magnet', icon: Magnet, active: true },
];

export const SUPERYOU_STORE_TABS = [
  { id: 'store', label: 'Store' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
] as const;
