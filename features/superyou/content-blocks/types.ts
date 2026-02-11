/**
 * Content block types for SuperYou profile (headers, carousels, links, etc.)
 * Each block has capabilities: edit, copy, schedule, locked, favourite, etc.
 */

export type ContentBlockType =
  | 'header'
  | 'carousel'
  | 'link'
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

export interface CarouselCard {
  id: string;
  title?: string;
  imageUrl?: string;
  link?: string;
}

export interface ContentBlockBase {
  id: string;
  type: ContentBlockType;
  visible: boolean;
  schedule?: ContentBlockSchedule;
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
}

export type ContentBlock = HeaderBlock | CarouselBlock | LinkBlock;

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
