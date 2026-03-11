'use client';

import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Share2, ChevronLeft, ChevronRight, Link2 } from 'lucide-react';
import type {
  MeLinkPageData,
  MeLinkBlock,
  MeLinkLayout,
  MeLinkSocialItem,
} from '@/features/superyou/content-blocks';

interface PreviewPaneProps {
  className?: string;
  profileUrl?: string;
  profileName?: string;
  welcomeMessage?: string;
  /** When provided, preview uses API me/link page data (profile, layout, social_media, blocks) */
  pageData?: MeLinkPageData | null;
  children?: React.ReactNode;
}

/** Resolved button style from layout.buttons or layout.button_style (payload-driven) */
export interface ResolvedButtonStyle {
  radius: string;
  radiusClass: string;
  shadow: boolean;
  shadowClass: string;
  filledStyle: 'default';
  outlineTextColor?: string;
  outlineBorderColor?: string;
}

/** Resolved block style from layout.blocks (payload-driven) */
export interface ResolvedBlockStyle {
  style: 'filled' | 'outline';
  shadow: 'none' | 'soft' | 'hard';
  block_color: string;
  text_color: string;
}

/** Props passed to every block renderer - driven by layout payload only */
export interface BlockRendererProps {
  block: MeLinkBlock;
  buttonStyle: ResolvedButtonStyle;
  blockStyle: ResolvedBlockStyle;
  fontFamily?: string;
  /** When true, preview pane has a theme background (dark) – use light text for labels */
  darkTheme?: boolean;
  /** Animation type for block entrance */
  animation?: 'none' | 'fade' | 'slide_up' | 'zoom';
}

/** Layout background shape may include tint_color from API */
type LayoutBackground = { type?: string; value?: string; tint_color?: string };

/** Pattern IDs that map to filenames with different casing in public/media/patterns */
const PATTERN_FILENAME_MAP: Record<string, string> = {
  green: 'Green.svg',
  square: 'Square.svg',
};

/**
 * Resolve pattern value from layout.background (e.g. "pattern-slanted-gradient") to the image URL
 * under public/media/patterns. Files in public/ are served at /media/patterns/{filename}.
 * - "pattern-slanted-gradient" → "/media/patterns/slanted-gradient.svg"
 * - "pattern-green" → "/media/patterns/Green.svg" (via PATTERN_FILENAME_MAP)
 * If value is already a full URL or path (http... or /...), returns it as-is.
 */
export function getPatternImageUrl(value: string): string {
  const v = String(value).trim();
  if (v.startsWith('http') || v.startsWith('/')) return v;
  const slug = v.replace(/^pattern-/, '').replace(/\.(svg|png|jpg)$/i, '');
  const filename = PATTERN_FILENAME_MAP[slug.toLowerCase()] ?? `${slug}.svg`;
  return `/media/patterns/${filename}`;
}

/** Resolve CSS background from layout.background (color | gradient | image | pattern). Fills the full pane. */
function getBackgroundStyle(background: LayoutBackground | undefined): React.CSSProperties | undefined {
  if (!background) return undefined;
  const type = (background as Record<string, unknown>).type ?? (background as Record<string, unknown>).Type;
  const value = (background as Record<string, unknown>).value ?? (background as Record<string, unknown>).Value;
  const tint_color = (background as Record<string, unknown>).tint_color as string | undefined;
  if (!value && !type) return undefined;
  const fill = { minHeight: '100%', width: '100%', backgroundAttachment: 'scroll' as const };
  if (type === 'color' && value) {
    return { ...fill, backgroundColor: String(value) };
  }
  if (type === 'gradient' && value) {
    const v = String(value);
    const bg =
      v.startsWith('linear-gradient') || v.startsWith('radial-gradient')
        ? v
        : `linear-gradient(180deg, ${v} 0%, #000 100%)`;
    return { ...fill, background: bg, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  if (type === 'image' && value) {
    return {
      ...fill,
      backgroundImage: `url(${value})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundColor: tint_color ?? '#1a1a1a',
    };
  }
  if (type === 'pattern' && value) {
    const patternUrl = getPatternImageUrl(String(value));
    return {
      ...fill,
      backgroundImage: `url(${patternUrl})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      // backgroundColor: tint_color ?? '#fafafa',
    };
  }
  return undefined;
}

/** Resolve button radius class from spec (default | rounded | pill) or legacy */
function getButtonRadiusClass(radius: string | undefined): string {
  if (radius === 'pill' || radius === 'rounded') return 'rounded-full';
  if (radius === 'default') return 'rounded-xl';
  return 'rounded-xl';
}

/** Resolve button style from layout.buttons (spec) or layout.button_style (legacy). Payload-driven. */
function resolveButtonStyle(layout: MeLinkLayout | undefined): ResolvedButtonStyle {
  const filled = layout?.buttons?.filled;
  const outline = layout?.buttons?.outline;
  const legacy = layout?.button_style;
  const radius = filled?.radius ?? outline?.radius ?? legacy?.radius ?? 'default';
  const shadow = legacy?.shadow ?? true;
  return {
    radius,
    radiusClass: getButtonRadiusClass(radius),
    shadow,
    shadowClass: shadow ? 'shadow-sm' : '',
    filledStyle: 'default',
    outlineTextColor: outline?.text_color,
    outlineBorderColor: outline?.border_color,
  };
}

/** Resolve block style from layout.blocks. Payload-driven; defaults for preview. */
function resolveBlockStyle(layout: MeLinkLayout | undefined): ResolvedBlockStyle {
  const blocks = layout?.blocks;
  return {
    style: blocks?.style ?? 'filled',
    shadow: blocks?.shadow ?? 'soft',
    block_color: blocks?.block_color ?? '#1f1f1f',
    text_color: blocks?.text_color ?? '#ffffff',
  };
}

/** Fallbacks when blockStyle/buttonStyle are missing (e.g. external callers). */
const DEFAULT_BLOCK_STYLE: ResolvedBlockStyle = {
  style: 'filled',
  shadow: 'soft',
  block_color: '#1f1f1f',
  text_color: '#ffffff',
};
const DEFAULT_BUTTON_STYLE: ResolvedButtonStyle = {
  radius: 'default',
  radiusClass: 'rounded-xl',
  shadow: true,
  shadowClass: 'shadow-sm',
  filledStyle: 'default',
};

/** Social icon by platform/icon identifier - payload-driven; unknown icons fallback to link */
function SocialIcon({ platform, icon, className }: { platform: string; icon: string; className?: string }) {
  const key = (icon || platform || '').toLowerCase();
  if (key === 'instagram') {
    return (
      <svg className={cn('size-5', className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    );
  }
  if (key === 'twitter' || key === 'x') {
    return (
      <svg className={cn('size-5', className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (key === 'linkedin') {
    return (
      <svg className={cn('size-5', className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  if (key === 'youtube') {
    return (
      <svg className={cn('size-5', className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }
  if (key === 'tiktok') {
    return (
      <svg className={cn('size-5', className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    );
  }
  if (key === 'whatsapp') {
    return (
      <svg className={cn('size-5', className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }
  return <Link2 className={cn('size-5', className)} aria-hidden />;
}

function WhatsAppBlockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ----- Block renderers (registry entries) -----

type BlockLayoutVariant = 'card' | 'minimal' | 'outlined' | 'full_width' | undefined;

function HeaderBlockRenderer({ block, blockStyle, fontFamily, darkTheme }: BlockRendererProps) {
  const bs = blockStyle ?? DEFAULT_BLOCK_STYLE;
  const title = (block.content?.title ?? block.content?.text ?? '') || 'Untitled';
  return (
    <p
      className={cn('mt-4 first:mt-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-center')}
      style={{
        fontFamily,
        color: darkTheme ? 'rgba(255,255,255,0.8)' : bs.text_color || '#737373',
      }}
    >
      {title}
    </p>
  );
}

function LinkWhatsAppFormBlockRenderer({ block, buttonStyle, blockStyle, fontFamily }: BlockRendererProps) {
  const bs = blockStyle ?? DEFAULT_BLOCK_STYLE;
  const bt = buttonStyle ?? DEFAULT_BUTTON_STYLE;
  const content = block.content ?? {};
  const title = (content.title ?? block.type) as string;
  const desc = (content.description ?? '') as string;
  const cta = (content.cta ?? 'Check it out') as string;
  const thumbnailUrl = block.thumbnail_url;
  const settings = (block.settings ?? {}) as { layout?: BlockLayoutVariant; is_highlight?: boolean };
  const isHighlight = settings.is_highlight ?? false;
  const blockLayout = settings.layout;
  const isMinimal = blockLayout === 'minimal';
  const isOutlined = blockLayout === 'outlined' || bs.style === 'outline';
  const isFullWidth = blockLayout === 'full_width';
  const shadowClass =
    bs.shadow === 'none' ? '' : bs.shadow === 'hard' ? 'shadow-md' : 'shadow-sm';
  const isWhatsApp = block.type === 'whatsapp';
  const isLink = block.type === 'link';
  const cardTopBg = isWhatsApp ? 'bg-[#25D366]' : isLink && !thumbnailUrl ? 'bg-blue-500' : 'bg-neutral-100';
  const bgOrBorder = bs.style === 'outline' ? { borderColor: bs.block_color, borderWidth: 2 } : { backgroundColor: bs.block_color };
  const textColor = bs.text_color;
  const outlineBtnStyle =
    bt.outlineTextColor || bt.outlineBorderColor
      ? {
          color: bt.outlineTextColor ?? textColor,
          borderColor: bt.outlineBorderColor ?? bs.block_color,
          background: 'transparent',
        }
      : undefined;

  if (isMinimal) {
    return (
      <div
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-2xl border py-3 px-4',
          shadowClass,
          isHighlight ? 'text-white' : '',
        )}
        style={{
          ...(fontFamily ? { fontFamily } : {}),
          ...(isHighlight ? { backgroundColor: bs.block_color, borderColor: bs.block_color, color: textColor } : { borderColor: '#e5e5e5', backgroundColor: '#fff', color: '#171717' }),
        }}
      >
        <span className="truncate text-sm font-medium">{title}</span>
        <div
          className={cn('shrink-0 py-1.5 px-3 text-xs font-medium', bt.radiusClass, shadowClass)}
          style={isHighlight ? { background: 'transparent', color: textColor, border: `1px solid ${bt.outlineBorderColor ?? textColor}` } : { backgroundColor: '#171717', color: '#fff' }}
        >
          {cta}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden border',
        shadowClass,
        isFullWidth ? 'rounded-none border-x-0' : 'rounded-2xl',
        isOutlined && 'border-2',
        isHighlight ? 'text-white' : '',
      )}
      style={{
        ...(fontFamily ? { fontFamily } : {}),
        ...(isHighlight ? { ...bgOrBorder, color: textColor } : { borderColor: '#e5e5e5', backgroundColor: '#fff', color: '#171717' }),
      }}
    >
      <div className={cn('flex h-16 w-full items-center justify-center overflow-hidden', cardTopBg)}>
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : isWhatsApp ? (
          <WhatsAppBlockIcon className="h-8 w-8 text-white" />
        ) : isLink ? (
          <span className="text-2xl font-bold text-white">S</span>
        ) : (
          <span className="text-lg font-semibold text-white">F</span>
        )}
      </div>
      <div className="px-4 pt-3 pb-2" style={isHighlight ? { borderColor: 'rgba(255,255,255,0.1)' } : undefined}>
        <p className="font-bold" style={isHighlight ? { color: textColor } : { color: '#171717' }}>
          {title}
        </p>
        {desc && (
          <p className="mt-1 line-clamp-2 text-sm" style={isHighlight ? { color: 'rgba(255,255,255,0.8)' } : { color: '#525252' }}>
            {desc}
          </p>
        )}
      </div>
      <div className="border-t px-4 py-2.5" style={isHighlight ? { borderColor: 'rgba(255,255,255,0.1)' } : undefined}>
        <div
          className={cn('flex items-center justify-center gap-1.5 py-2 px-4 text-sm font-medium', bt.radiusClass, shadowClass)}
          style={isHighlight ? (outlineBtnStyle ?? { backgroundColor: '#fff', color: bs.block_color }) : { backgroundColor: '#171717', color: '#fff' }}
        >
          {cta}
          <ChevronRight className="h-4 w-4 shrink-0" />
        </div>
      </div>
    </div>
  );
}

function CarouselCardPreview({
  child,
  buttonStyle,
  blockStyle,
  fontFamily,
}: {
  child: MeLinkBlock;
  buttonStyle: ResolvedButtonStyle;
  blockStyle: ResolvedBlockStyle;
  fontFamily?: string;
}) {
  const bs = blockStyle ?? DEFAULT_BLOCK_STYLE;
  const bt = buttonStyle ?? DEFAULT_BUTTON_STYLE;
  const content = child.content ?? {};
  const cardTitle = (content.title ?? 'Link') as string;
  const cta = (content.cta ?? 'Get now') as string;
  const childType = child.type;
  const thumbnailUrl = child.thumbnail_url;
  const shadowClass = bs.shadow === 'none' ? '' : bs.shadow === 'hard' ? 'shadow-md' : 'shadow-sm';

  return (
    <div
      className={cn('flex w-[140px] shrink-0 flex-col overflow-hidden rounded-xl border', shadowClass)}
      style={{ fontFamily, backgroundColor: '#fff', borderColor: '#e5e5e5', color: bs.text_color }}
    >
      <div
        className={cn(
          'relative flex h-16 w-full items-center justify-center overflow-hidden',
          childType === 'whatsapp' && 'bg-[#25D366]',
          childType === 'link' && !thumbnailUrl && 'bg-blue-500',
          childType === 'form' && 'bg-violet-500',
        )}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : childType === 'whatsapp' ? (
          <WhatsAppBlockIcon className="h-8 w-8 text-white" />
        ) : childType === 'link' ? (
          <span className="text-2xl font-bold text-white">S</span>
        ) : (
          <span className="text-lg font-semibold text-white">F</span>
        )}
      </div>
      <div className="flex min-h-[44px] items-center px-3 py-2">
        <p className="line-clamp-2 text-xs font-medium" style={{ color: bs.text_color }}>{cardTitle}</p>
      </div>
      <div className="border-t border-neutral-100 px-2 pb-2 pt-1.5">
        <div
          className={cn('flex items-center justify-center gap-1 rounded-lg py-2 px-3', bt.radiusClass, shadowClass)}
          style={{ backgroundColor: bs.block_color, color: bs.text_color }}
        >
          <span className="truncate text-xs font-medium">{cta}</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
        </div>
      </div>
    </div>
  );
}

const CAROUSEL_CARD_WIDTH = 140;
const CAROUSEL_GAP = 12;
const CAROUSEL_SCROLL_AMOUNT = CAROUSEL_CARD_WIDTH + CAROUSEL_GAP;

function CarouselBlockRenderer({ block, buttonStyle, blockStyle, fontFamily, darkTheme }: BlockRendererProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const children = block.children ?? [];
  const content = block.content ?? {};
  const title = (content.title ?? block.content?.title ?? '') || 'Enter carousel title';

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = direction === 'left' ? -CAROUSEL_SCROLL_AMOUNT : CAROUSEL_SCROLL_AMOUNT;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className="mt-4 first:mt-2 min-w-0 space-y-3" style={fontFamily ? { fontFamily } : undefined}>
      <p className={cn('text-center text-sm', darkTheme ? 'text-white/90' : 'text-neutral-500')}>{title}</p>
      {/* Max 2 cards visible; container constrained so carousel doesn't expand pane, rest scroll */}
      <div
        ref={scrollRef}
        className="max-w-[292px] flex gap-3 overflow-x-auto pb-2 scroll-smooth [-webkit-overflow-scrolling:touch]"
      >
        {children.length > 0 ? (
          children.map((child) => (
            <CarouselCardPreview key={child.uuid} child={child} buttonStyle={buttonStyle} blockStyle={blockStyle} fontFamily={fontFamily} />
          ))
        ) : (
          <div className="flex w-[140px] shrink-0 flex-col rounded-xl border border-dashed border-neutral-300 bg-neutral-50 py-8 text-center text-xs text-neutral-400">
            No cards
          </div>
        )}
      </div>
      {children.length > 0 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={() => scroll('left')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll('right')}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm hover:bg-neutral-50"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function FallbackBlockRenderer({ block, blockStyle, fontFamily }: BlockRendererProps) {
  const bs = blockStyle ?? DEFAULT_BLOCK_STYLE;
  const content = block.content ?? {};
  const title = (content.title ?? content.text ?? block.type) as string | undefined;
  return (
    <div
      className="rounded-xl border py-3 px-4 text-sm"
      style={{
        fontFamily,
        backgroundColor: bs.style === 'outline' ? 'transparent' : bs.block_color,
        borderColor: bs.block_color,
        color: bs.text_color,
      }}
    >
      {title ?? block.type}
    </div>
  );
}

/** Block registry: type → renderer. New block types can be added here without changing preview logic. */
const blockRegistry: Record<string, (props: BlockRendererProps) => React.ReactNode> = {
  header: (props) => <HeaderBlockRenderer {...props} />,
  link: (props) => <LinkWhatsAppFormBlockRenderer {...props} />,
  whatsapp: (props) => <LinkWhatsAppFormBlockRenderer {...props} />,
  form: (props) => <LinkWhatsAppFormBlockRenderer {...props} />,
  carousel: (props) => <CarouselBlockRenderer {...props} />,
};

function getBlockRenderer(type: string): (props: BlockRendererProps) => React.ReactNode {
  return blockRegistry[type] ?? ((props) => <FallbackBlockRenderer {...props} />);
}

export function PreviewPane({
  className,
  profileUrl = 'superyou.bio/yourhandle',
  profileName = 'Your Name',
  welcomeMessage = 'Welcome to my SuperYou profile!',
  pageData,
  children,
}: PreviewPaneProps) {
  const profile = pageData?.profile;
  const layout = pageData?.layout;
  const rawBlocks = pageData?.blocks;
  const socialMedia = pageData?.social_media ?? [];
  const blocks = Array.isArray(rawBlocks) ? rawBlocks : [];
  const displayUrl = profile ? `superyou.bio/${profile.username}` : profileUrl;
  const displayName = profile?.display_name ?? profileName;
  const bio = profile?.bio ?? welcomeMessage;
  const avatarUrl = profile?.avatar_url;

  // Normalize background: API may return layout.background or layout.Background with type/value
  const rawLayout = layout as Record<string, unknown> | undefined;
  const background = rawLayout?.background ?? rawLayout?.Background;
  const backgroundPayload = background as LayoutBackground | undefined;
  const backgroundStyle = getBackgroundStyle(backgroundPayload);
  const tintColor = backgroundPayload?.tint_color;
  const darkTheme = Boolean(backgroundStyle);
  const buttonStyle = resolveButtonStyle(layout);
  const blockStyle = resolveBlockStyle(layout);
  const fontFamily = layout?.font;
  const animation = layout?.animation ?? 'none';
  const layoutMode = layout?.layout_mode ?? 'single';
  const showSensitiveWarning = Boolean(layout?.sensitive_content_warning);
  const [sensitiveAccepted, setSensitiveAccepted] = useState(false);
  const showContent = !showSensitiveWarning || sensitiveAccepted;
  const sortedBlocks = [...blocks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const animationClass =
    animation === 'fade'
      ? 'animate-in fade-in duration-300'
      : animation === 'slide_up'
        ? 'animate-in slide-in-from-bottom-4 fade-in duration-300'
        : animation === 'zoom'
          ? 'animate-in zoom-in-95 fade-in duration-300'
          : '';

  return (
    <aside
      className={cn(
        'relative flex h-full min-h-0 w-[320px] shrink-0 flex-col overflow-hidden rounded-xl border border-border',
        !backgroundStyle && 'bg-neutral-100',
        className,
      )}
      style={backgroundStyle ? { ...backgroundStyle } : undefined}
    >
      {/* Tint overlay: semi-transparent layer above background for readability (payload-driven) */}
      {tintColor && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          // style={{ backgroundColor: tintColor }}
          aria-hidden
        />
      )}

      {/* Sensitive content warning: simulate warning screen when layout.sensitive_content_warning is true */}
      {showSensitiveWarning && !showContent && (
        <div className="relative z-20 flex flex-1 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <p className="text-sm font-medium">Sensitive content</p>
            <p className="mt-1 text-xs text-amber-800">This profile may contain content that some viewers find sensitive.</p>
            <button
              type="button"
              onClick={() => setSensitiveAccepted(true)}
              className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Browser-style URL bar */}
      <div className="relative z-1 flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white/95 px-3 py-2 backdrop-blur-sm">
        <span className="truncate text-xs text-neutral-500">{displayUrl}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Settings"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable content on theme background: profile then blocks (payload-driven; hidden when sensitive warning shown) */}
      {showContent && (
      <div
        className="relative z-1 flex-1 min-h-0 overflow-auto px-4 pb-6 pt-4"
        style={fontFamily ? { fontFamily } : undefined}
      >
        {/* 1. Background (already on aside) → 2. Profile: avatar, name, bio, social → 3. Blocks */}
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          {avatarUrl ? (
            <div className={cn('relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 shadow-lg', darkTheme ? 'border-white/20' : 'border-neutral-200')}>
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            </div>
          ) : (
            <div
              className={cn(
                'flex h-20 w-20 shrink-0 items-center justify-center rounded-full border text-3xl shadow-inner',
                darkTheme ? 'bg-white/10 border-white/20 text-white/70' : 'bg-neutral-100 border-neutral-200 text-neutral-400',
              )}
            >
              <span className="sr-only">Avatar</span>
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          )}
          <h2
            className={cn('mt-4 text-lg font-bold', darkTheme ? 'text-white drop-shadow-sm' : 'text-neutral-900')}
            style={darkTheme ? { textShadow: '0 1px 2px rgba(0,0,0,0.5)' } : undefined}
          >
            {displayName}
          </h2>
          <p
            className={cn('mt-1.5 max-w-[260px] text-sm leading-relaxed', darkTheme ? 'text-white/90' : 'text-neutral-600')}
            style={darkTheme ? { textShadow: '0 1px 2px rgba(0,0,0,0.4)' } : undefined}
          >
            {bio}
          </p>
          {socialMedia.length > 0 && (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {socialMedia.map((item: MeLinkSocialItem) => (
                <a
                  key={`${item.platform}-${item.url}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                    darkTheme ? 'bg-white/15 text-white hover:bg-white/25' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                  )}
                  aria-label={item.platform}
                >
                  <SocialIcon platform={item.platform} icon={item.icon} className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic blocks: headers, links, carousels – order and layout_mode from payload */}
        <div
          className={layoutMode === 'double' ? 'grid grid-cols-1 gap-4 sm:grid-cols-2' : 'space-y-4'}
        >
          {sortedBlocks.length > 0 ? (
            sortedBlocks.map((block) => {
              const Renderer = getBlockRenderer(block.type);
              return (
                <div key={block.uuid} className={cn(animationClass && animation !== 'none' ? animationClass : '')}>
                  <Renderer
                    block={block}
                    buttonStyle={buttonStyle}
                    blockStyle={blockStyle}
                    fontFamily={fontFamily}
                    darkTheme={darkTheme}
                    animation={animation}
                  />
                </div>
              );
            })
          ) : (
            children
          )}
        </div>
      </div>
      )}
    </aside>
  );
}
