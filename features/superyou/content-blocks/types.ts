/**
 * Content block types for SuperYou profile (headers, carousels, links, etc.)
 * Each block has capabilities: edit, copy, schedule, locked, favourite, etc.
 */

export type ContentBlockType =
  | 'header'
  | 'carousel'
  | 'link'
  | 'form'
  | 'digital_file'
  | 'lead_magnet'
  | 'whatsapp'
  | 'referral'
  | 'affiliate'
  | 'one_on_one'
  | 'membership'
  | 'event'
  | 'course'
  | 'locked_content';

/** Actions available on blocks (used for 3-dot menu and toolbar) */
export type BlockCapability =
  | 'edit'
  | 'copy'
  | 'schedule'
  | 'lock'
  | 'favourite'
  | 'analytics'
  | 'duplicate'
  | 'delete';

export interface ContentBlockSchedule {
  appearAt?: string; // ISO datetime
  disappearAt?: string;
  timezone?: string;
}

/** Animation style for block entrance/emphasis */
export type BlockAnimationType =
  | 'ring'
  | 'jump'
  | 'grow'
  | 'shake'
  | 'glow'
  | 'shine'
  | 'none';

/** Layout variant for block display. Standard = single minimal row; Featured = card/minimal/outlined/full_width from schema */
export type BlockLayoutType =
  | 'standard'
  | 'featured' /** @deprecated use card/minimal/outlined/full_width */
  | 'card'
  | 'minimal'
  | 'outlined'
  | 'full_width';

/** Lock/access control for a block (code, age, sensitive content) */
export interface ContentBlockLock {
  /** Unlock code visitors must enter */
  code?: string;
  /** Minimum age (e.g. 18) to unlock */
  minAge?: number;
  /** Optional explanation shown to visitors */
  description?: string;
  /** Require acknowledgment of sensitive content */
  sensitiveContent?: boolean;
}

/** Block types allowed as carousel cards (no nested carousel) */
export type CarouselCardBlockType = 'link' | 'whatsapp' | 'form';

export interface CarouselCard {
  id: string;
  /** Type of block this card represents; defaults to 'link' for legacy cards */
  blockType?: CarouselCardBlockType;
  /** Display title (used by link/whatsapp/form) */
  title?: string;
  /** @deprecated use blockType + url */
  imageUrl?: string;
  /** @deprecated use blockType + url */
  link?: string;
  /** Link block fields */
  url?: string;
  thumbnailUrl?: string;
  shortDescription?: string;
  ctaText?: string;
  /** WhatsApp block fields */
  phone_code?: string;
  number?: string;
  prefilled_message?: string;
  /** Form block fields */
  form_id?: string;
}

export interface ContentBlockBase {
  id: string;
  type: ContentBlockType;
  visible: boolean;
  schedule?: ContentBlockSchedule;
  lock?: ContentBlockLock;
  /** Animation style (ring, jump, grow, shake, glow, shine) */
  animation?: BlockAnimationType;
  /** Layout variant (standard, featured) */
  layout?: BlockLayoutType;
  order: number;
  /** Whether this block is locked (visibility/access control) */
  locked?: boolean;
  /** Whether this block is marked as favourite */
  favourite?: boolean;
}

export interface HeaderBlock extends ContentBlockBase {
  type: 'header';
  text: string;
  maxLength?: number;
}

export interface CarouselBlock extends ContentBlockBase {
  type: 'carousel';
  title: string;
  cards: CarouselCard[];
}

export interface LinkBlock extends ContentBlockBase {
  type: 'link';
  title: string;
  url: string;
  thumbnailUrl?: string;
  shortDescription?: string;
  ctaText?: string;
}

export interface WhatsAppBlock extends ContentBlockBase {
  type: 'whatsapp';
  title: string;
  ctaText?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  phone_code: string;
  number: string;
  prefilled_message?: string;
}

export interface FormBlock extends ContentBlockBase {
  type: 'form';
  form_id: string;
  title?: string;
}

export type ContentBlock =
  | HeaderBlock
  | CarouselBlock
  | LinkBlock
  | WhatsAppBlock
  | FormBlock;

/** Default capabilities per block type (all blocks support these unless overridden) */
export const DEFAULT_BLOCK_CAPABILITIES: BlockCapability[] = [
  'edit',
  'copy',
  'schedule',
  'lock',
  'favourite',
  'analytics',
  'duplicate',
  'delete',
];
