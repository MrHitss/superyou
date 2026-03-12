'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronDown, ChevronUp, Square, Grid3X3, Image as ImageIcon, Undo2, Redo2, X, Sparkles, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMeLinkPage, useProfileBlocks, updateProfile } from '@/features/superyou/content-blocks';
import type { LayoutConfigPayload } from '@/features/superyou/content-blocks';

export interface AppearanceState {
  themeColor: string;
  themeType: 'solid' | 'gradient' | 'theme' | 'image' | 'animated';
  filledButtonStyle: string;
  outlineButtonStyle: string;
  buttonColor: string;
  buttonTextColor: string;
  blockStyle: 'filled' | 'outline';
  blockShadow: 'hard' | 'soft';
  blockColor: string;
  blockTextColor: string;
  socialStyle: 'original' | 'custom';
  font: string;
  pageFontColor: string;
  backgroundType: 'solid' | 'pattern' | 'image';
  backgroundValue: string;
}

const DEFAULT_APPEARANCE: AppearanceState = {
  themeColor: '#dc2626',
  themeType: 'gradient',
  filledButtonStyle: 'default',
  outlineButtonStyle: 'default',
  buttonColor: '#000000',
  buttonTextColor: '#FFFFFF',
  blockStyle: 'filled',
  blockShadow: 'hard',
  blockColor: '#FFFFFF',
  blockTextColor: '#484848',
  socialStyle: 'original',
  font: 'Hind Madurai',
  pageFontColor: '#FFFFFF',
  backgroundType: 'pattern',
  backgroundValue: 'gradient-black-red',
};

const FONTS = ['Hind Madurai', 'Poppins', 'Roboto', 'Oswald', 'Mukta'];

type BackgroundSwatch =
  | { id: string; bg: string }
  | { id: string; pattern: string; baseColor?: string };

const BACKGROUND_SWATCHES: BackgroundSwatch[] = [
  { id: 'gradient-grey', bg: 'linear-gradient(180deg,#e5e5e5 0%,#fafafa 100%)' },
  { id: 'gradient-orange', bg: 'linear-gradient(135deg,#f97316 0%,#dc2626 100%)' },
  { id: 'gradient-green', bg: 'linear-gradient(135deg,#22c55e 0%,#15803d 100%)' },
  { id: 'gradient-yellow', bg: 'linear-gradient(180deg,#fef08a 0%,#fde047 100%)' },
  { id: 'gradient-pink', bg: 'linear-gradient(180deg,#f9a8d4 0%,#ec4899 100%)' },
  { id: 'gradient-red', bg: 'linear-gradient(135deg,#ef4444 0%,#b91c1c 100%)' },
  { id: 'gradient-maroon', bg: 'linear-gradient(180deg,#7f1d1d 0%,#450a0a 100%)' },
  { id: 'gradient-black-red', bg: 'linear-gradient(180deg,#1c1917 0%,#7f1d1d 50%,#450a0a 100%)' },
  { id: 'gradient-orange-wavy', bg: 'linear-gradient(180deg,#fed7aa 0%,#ea580c 100%)' },
  { id: 'gradient-blue', bg: 'linear-gradient(180deg,#1e3a5f 0%,#0f172a 100%)' },
  // Pattern SVGs from /public/media/patterns
  { id: 'pattern-cornered-stairs', pattern: '/media/patterns/cornered-stairs.svg', baseColor: '#f5f5f5' },
  { id: 'pattern-flat-mountains', pattern: '/media/patterns/flat-mountains.svg', baseColor: '#e8f4f8' },
  { id: 'pattern-green', pattern: '/media/patterns/Green.svg', baseColor: '#f0fdf4' },
  { id: 'pattern-quantum-gradient', pattern: '/media/patterns/quantum-gradient.svg', baseColor: '#1e1b4b' },
  { id: 'pattern-rainbow-vortex', pattern: '/media/patterns/rainbow-vortex.svg', baseColor: '#fafafa' },
  { id: 'pattern-rose-petals', pattern: '/media/patterns/rose-petals.svg', baseColor: '#fdf2f8' },
  { id: 'pattern-slanted-gradient', pattern: '/media/patterns/slanted-gradient.svg', baseColor: '#fef3c7' },
  { id: 'pattern-square', pattern: '/media/patterns/Square.svg', baseColor: '#e5e5e5' },
  { id: 'pattern-vanishing-stripes', pattern: '/media/patterns/vanishing-stripes.svg', baseColor: '#f8fafc' },
];

function getSwatchStyle(swatch: BackgroundSwatch): CSSProperties {
  if ('pattern' in swatch) {
    return {
      backgroundColor: swatch.baseColor ?? '#ffffff',
      backgroundImage: `url(${swatch.pattern})`,
      backgroundRepeat: 'repeat',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100%',
      width: '100%',
    };
  }
  return {
    background: swatch.bg,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100%',
    width: '100%',
  };
}

/** Full background style for the preview card based on selected theme (pattern, color, or gradient). */
function getPreviewBackgroundStyle(appearance: AppearanceState): CSSProperties {
  const { themeType, backgroundType, backgroundValue, themeColor } = appearance;
  // Solid color
  if (themeType === 'solid' && themeColor) {
    return { background: themeColor };
  }
  // Gradient (two colors)
  if (themeType === 'gradient') {
    const end = backgroundValue || '#000000';
    return {
      background: `linear-gradient(180deg, ${themeColor || '#dc2626'} 0%, ${end} 100%)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  // Theme presets or pattern: resolve swatch by backgroundValue
  const swatch = BACKGROUND_SWATCHES.find((s) => s.id === backgroundValue);
  if (swatch) {
    return getSwatchStyle(swatch);
  }
  // Pattern/theme type but value might be a gradient id
  if (backgroundType === 'pattern' && backgroundValue) {
    const patternSwatch = BACKGROUND_SWATCHES.find((s) => s.id === backgroundValue);
    if (patternSwatch) return getSwatchStyle(patternSwatch);
  }
  // Image URL
  if (themeType === 'image' && backgroundValue && (backgroundValue.startsWith('http') || backgroundValue.startsWith('url') || backgroundValue.startsWith('/'))) {
    const url = backgroundValue.startsWith('url') ? backgroundValue : `url(${backgroundValue})`;
    return {
      backgroundImage: url,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: themeColor || '#1a1a1a',
    };
  }
  // Default
  return {
    background: 'linear-gradient(180deg, #1c1917 0%, #7f1d1d 50%, #450a0a 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100%',
    width: '100%',
  };
}

/** Map API layout to AppearanceState for initial load */
function layoutToAppearance(layout: Record<string, unknown> | undefined): Partial<AppearanceState> {
  if (!layout || typeof layout !== 'object') return {};
  const blocks = layout.blocks as Record<string, unknown> | undefined;
  const buttons = layout.buttons as Record<string, unknown> | undefined;
  const background = layout.background as Record<string, unknown> | undefined;
  const filled = buttons?.filled as Record<string, unknown> | undefined;
  const outline = buttons?.outline as Record<string, unknown> | undefined;
  return {
    font: (layout.font as string) ?? DEFAULT_APPEARANCE.font,
    blockStyle: (blocks?.style as 'filled' | 'outline') ?? DEFAULT_APPEARANCE.blockStyle,
    blockShadow: (blocks?.shadow as 'hard' | 'soft') ?? DEFAULT_APPEARANCE.blockShadow,
    blockColor: (blocks?.block_color as string) ?? DEFAULT_APPEARANCE.blockColor,
    blockTextColor: (blocks?.text_color as string) ?? DEFAULT_APPEARANCE.blockTextColor,
    filledButtonStyle: (filled?.radius as string) ?? DEFAULT_APPEARANCE.filledButtonStyle,
    outlineButtonStyle: (outline?.radius as string) ?? DEFAULT_APPEARANCE.outlineButtonStyle,
    buttonColor: (outline?.border_color as string) ?? (filled ? undefined : DEFAULT_APPEARANCE.buttonColor),
    buttonTextColor: (outline?.text_color as string) ?? DEFAULT_APPEARANCE.buttonTextColor,
    backgroundType: (background?.type as string) === 'color' ? 'solid' : (background?.type as 'solid' | 'pattern' | 'image') ?? DEFAULT_APPEARANCE.backgroundType,
    backgroundValue: (background?.value as string) ?? DEFAULT_APPEARANCE.backgroundValue,
    themeColor: (background?.tint_color as string) ?? DEFAULT_APPEARANCE.themeColor,
  };
}

/** Map AppearanceState to layout payload for PATCH /me/link */
function appearanceToLayoutPayload(appearance: AppearanceState): LayoutConfigPayload {
  const backgroundType = appearance.backgroundType === 'solid' ? 'color' : appearance.backgroundType;
  const backgroundValue = appearance.backgroundType === 'solid' ? appearance.themeColor : appearance.backgroundValue;
  return {
    theme: 'classic',
    font: appearance.font,
    buttons: {
      filled: {
        radius: (appearance.filledButtonStyle === 'default' || appearance.filledButtonStyle === 'rounded' || appearance.filledButtonStyle === 'pill' ? appearance.filledButtonStyle : 'default') as 'default' | 'rounded' | 'pill',
        style: 'default',
      },
      outline: {
        radius: (appearance.outlineButtonStyle === 'default' || appearance.outlineButtonStyle === 'rounded' ? appearance.outlineButtonStyle : 'rounded') as 'default' | 'rounded' | 'pill',
        text_color: appearance.buttonTextColor,
        border_color: appearance.buttonColor,
      },
    },
    blocks: {
      style: appearance.blockStyle,
      shadow: appearance.blockShadow,
      block_color: appearance.blockColor,
      text_color: appearance.blockTextColor,
    },
    background: {
      type: backgroundType as 'color' | 'gradient' | 'image' | 'pattern',
      value: backgroundValue,
      tint_color: appearance.themeColor,
    },
  };
}

export function AppearanceTab() {
  const { data: session } = useSession();
  const token = (session as { beeToken?: string } | null)?.beeToken ?? null;
  const { data: meLinkPageData, refetch: refetchMeLinkPage } = useMeLinkPage();
  const { profileId } = useProfileBlocks([]);
  const hasInitializedFromProfile = useRef(false);

  const [appearance, setAppearance] = useState<AppearanceState>(DEFAULT_APPEARANCE);
  const [savedState, setSavedState] = useState<AppearanceState>(DEFAULT_APPEARANCE);
  const [history, setHistory] = useState<AppearanceState[]>([DEFAULT_APPEARANCE]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [stylesOpen, setStylesOpen] = useState(false);
  const [stylesPanelTab, setStylesPanelTab] = useState<'buttons' | 'blocks' | 'socials'>('buttons');
  const [fontModalOpen, setFontModalOpen] = useState(false);

  const layout = meLinkPageData?.layout as Record<string, unknown> | undefined;
  useEffect(() => {
    if (hasInitializedFromProfile.current || !layout) return;
    const patch = layoutToAppearance(layout);
    if (Object.keys(patch).length === 0) return;
    hasInitializedFromProfile.current = true;
    const next = { ...DEFAULT_APPEARANCE, ...patch } as AppearanceState;
    setAppearance(next);
    setSavedState(next);
    setHistory([next]);
    setHistoryIndex(0);
  }, [layout]);

  const themeOptions = [
    { id: 'solid' as const, label: 'Solid', icon: Square },
    { id: 'gradient' as const, label: 'Gradient', icon: Grid3X3 },
    { id: 'theme' as const, label: 'Theme', icon: Layers },
    { id: 'image' as const, label: 'Image', icon: ImageIcon },
    { id: 'animated' as const, label: 'Animated', icon: Sparkles },
  ];

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasUnsavedChanges = useMemo(
    () => JSON.stringify(appearance) !== JSON.stringify(savedState),
    [appearance, savedState],
  );

  const pushHistory = useCallback((next: AppearanceState) => {
    setHistory((prev) => prev.slice(0, historyIndex + 1).concat(next));
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const update = useCallback((patch: Partial<AppearanceState>) => {
    setAppearance((prev) => {
      const next = { ...prev, ...patch };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const prev = history[historyIndex - 1];
    setHistoryIndex((i) => i - 1);
    setAppearance(prev);
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const next = history[historyIndex + 1];
    setHistoryIndex((i) => i + 1);
    setAppearance(next);
  }, [canRedo, history, historyIndex]);

  const handleCancel = useCallback(() => {
    setAppearance(savedState);
    setHistory([savedState]);
    setHistoryIndex(0);
  }, [savedState]);

  const handleSave = useCallback(async () => {
    if (token && profileId) {
      const layoutPayload = appearanceToLayoutPayload(appearance);
      const result = await updateProfile(token, profileId, { layout: layoutPayload });
      if (result.success) {
        setSavedState(appearance);
        void refetchMeLinkPage();
      }
    } else {
      setSavedState(appearance);
    }
  }, [appearance, token, profileId, refetchMeLinkPage]);

  // Generate preview cards for carousel
  const previewCards = [
    { id: 'classic', name: 'Classic' },
    { id: 'bold', name: 'Bold' },
    { id: 'hero', name: 'Hero' },
    { id: 'portfolio', name: 'Portfolio' },
    { id: 'skin', name: 'Skin' },
  ];

  // default to Classic type preview (index 0)
  const [selectedIndex, setSelectedIndex] = useState(0);

  const renderPreviewCard = (card: typeof previewCards[0], index: number) => {
    const isActive = index === selectedIndex;
    const fullBackgroundStyle = getPreviewBackgroundStyle(appearance);

    // Calculate circular position relative to active card
    const totalCards = previewCards.length;
    let distance = index - selectedIndex;
    distance = ((distance % totalCards) + totalCards) % totalCards;
    if (distance > Math.floor(totalCards / 2)) {
      distance -= totalCards;
    }

    return (
      <motion.div
        key={card.id}
        onClick={() => setSelectedIndex(index)}
        className="absolute shrink-0 cursor-pointer origin-center"
        initial={false}
        animate={{
          scale: isActive ? 1 : 0.8,
          opacity: isActive ? 1 : Math.max(0.3, 1 - Math.abs(distance) * 0.4),
          x: distance * 190,
          zIndex: isActive ? 20 : 10 - Math.abs(distance),
          rotateY: distance * -12,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          mass: 0.8,
        }}
        style={{
          width: '300px',
          filter: isActive ? 'none' : 'grayscale(100%) brightness(1.2)',
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: '-150px',
          marginTop: '-240px',
        }}
      >
        <div
          className={cn(
            'rounded-2xl overflow-hidden shadow-lg transition-colors duration-300 w-full',
            isActive ? 'border-2 border-white/20 shadow-2xl' : 'border border-gray-300',
          )}
          style={{
            minHeight: '420px',
            color: appearance.pageFontColor,
            ...(isActive ? fullBackgroundStyle : { background: '#f5f5f5' }),
          }}
        >
          {/* Top section - transparent so card background shows */}
          <div className={cn('h-32 flex flex-col items-center justify-center pt-6 transition-colors duration-300', isActive ? 'bg-transparent' : 'bg-gray-200')}>
            <div className={cn('h-16 w-16 rounded-full border-2 flex items-center justify-center mb-2 transition-colors duration-300', isActive ? 'bg-black/30 border-white/30' : 'bg-gray-300 border-gray-400')}>
              <span className={cn('text-2xl transition-colors duration-300', isActive ? 'text-white/90' : 'text-gray-500')}>👤</span>
            </div>
            <p
              className={cn('font-semibold text-base transition-colors duration-300', isActive ? 'text-white' : 'text-gray-600')}
              style={isActive ? { color: appearance.pageFontColor, fontFamily: appearance.font, textShadow: '0 1px 2px rgba(0,0,0,0.5)' } : {}}
            >
              Kunal Gwala
            </p>
            <p className={cn('text-xs mt-0.5 transition-colors duration-300', isActive ? 'text-white/90' : 'text-gray-500')} style={isActive ? { textShadow: '0 1px 2px rgba(0,0,0,0.5)' } : undefined}>
              Welcome to my SuperProfile! 🚀
            </p>
            <div className={cn('mt-2 h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-300', isActive ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-400')}>
              <span className="text-white text-[10px] font-semibold">IG</span>
            </div>
          </div>

          {/* Middle section - transparent so card background shows */}
          <div className={cn('h-32 flex items-center justify-center transition-colors duration-300', isActive ? 'bg-transparent' : '')} style={!isActive ? { background: 'linear-gradient(180deg, #e5e5e5 0%, #d4d4d4 100%)' } : undefined}>
            <div
              className={cn(
                'h-20 w-20 rounded-full flex items-center justify-center relative transition-colors duration-300',
                isActive ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-300',
              )}
            >
              <span className={cn('text-xl font-semibold absolute bottom-1 transition-colors duration-300', isActive ? 'text-white/90' : 'text-gray-500')} style={isActive ? { textShadow: '0 1px 2px rgba(0,0,0,0.5)' } : undefined}>n</span>
            </div>
          </div>

          {/* Bottom section - transparent so card background shows; block card uses blockColor */}
          <div className={cn('flex-1 p-4 min-h-[120px] transition-colors duration-300', isActive ? 'bg-transparent' : 'bg-[#f5f5f5]')}>
            <div
              className={cn(
                'w-full rounded-xl p-4 text-left transition-colors duration-300',
                isActive ? '' : 'bg-gray-200',
              )}
              style={
                isActive
                  ? {
                    backgroundColor: appearance.blockColor,
                    color: appearance.blockTextColor,
                  }
                  : {}
              }
            >
              <p className={cn('font-medium text-sm transition-colors duration-300', isActive ? '' : 'text-gray-600')}>
                Get the 30 day Deep-dive E-Book
              </p>
              <p className={cn('text-xs mt-0.5 transition-colors duration-300', isActive ? 'opacity-90' : 'text-gray-500')}>
                Unlock insights with this 30-day deep-dive e-book journey
              </p>
            </div>
          </div>
        </div>
        {isActive && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-semibold mt-4 text-foreground"
          >
            {card.name}
          </motion.p>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-100">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-6 py-4 relative">
        <div className="flex-1" />

        {/* Centered Controls */}
        <div className="bg-white rounded-full px-2 py-1.5 flex items-center gap-1 shadow-sm border border-gray-200 absolute left-1/2 -translate-x-1/2">
          {/* Theme Button (open dropdown) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium">Theme</span>
                <div
                  className="h-4 w-4 rounded-full shrink-0 border border-gray-200"
                  style={{
                    background: appearance.themeType === 'gradient' ? 'linear-gradient(135deg, #dc2626 0%, #000000 100%)' : appearance.themeType === 'solid' ? appearance.themeColor : undefined,
                  }}
                />
                <div className="flex flex-col -space-y-0.5 text-gray-500">
                  <ChevronUp className="h-2.5 w-2.5" />
                  <ChevronDown className="h-2.5 w-2.5" />
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="min-w-[560px] max-w-full w-auto p-4">
              <div className="flex items-center gap-3 pb-3 border-b border-border mb-3">
                {themeOptions.map((opt) => {
                  const Icon = opt.icon;
                  const active = appearance.themeType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-full transition-colors',
                        active ? 'bg-gray-200' : 'bg-transparent hover:bg-gray-50',
                      )}
                      onClick={() => update({ themeType: opt.id })}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm hidden sm:inline">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chooser content */}
              <div>
                {appearance.themeType === 'solid' && (
                  <div className="space-y-3">
                    <div className="h-40 rounded-md border" style={{ background: appearance.themeColor }} />
                    <div className="flex gap-2">
                      <Input value={appearance.themeColor} onChange={(e) => update({ themeColor: e.target.value })} />
                      <input type="color" value={appearance.themeColor} onChange={(e) => update({ themeColor: e.target.value })} className="h-10 w-10 rounded border" />
                    </div>
                  </div>
                )}

                {appearance.themeType === 'gradient' && (
                  <div className="space-y-3">
                    <div className="h-36 rounded-md overflow-hidden border" style={{ background: `linear-gradient(180deg, ${appearance.themeColor} 0%, #000000 100%)` }} />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Start color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input value={appearance.themeColor} onChange={(e) => update({ themeColor: e.target.value })} />
                          <input type="color" value={appearance.themeColor} onChange={(e) => update({ themeColor: e.target.value })} className="h-10 w-10 rounded border" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">End color</Label>
                        <div className="flex gap-2 mt-2">
                          <Input value={appearance.backgroundValue} onChange={(e) => update({ backgroundValue: e.target.value })} />
                          <input type="color" value={appearance.backgroundValue} onChange={(e) => update({ backgroundValue: e.target.value })} className="h-10 w-10 rounded border" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Angle (deg)</Label>
                      <Input type="number" defaultValue={180} className="mt-2 w-28" />
                    </div>
                  </div>
                )}

                {appearance.themeType === 'theme' && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      'gradient-black-red',
                      'gradient-blue',
                      'pattern-quantum-gradient',
                      'pattern-rose-petals',
                      'pattern-slanted-gradient',
                    ].map((id) => {
                      const sw = BACKGROUND_SWATCHES.find((s) => s.id === id);
                      return (
                        <button
                          key={id}
                          className={cn('h-20 rounded-md border', appearance.backgroundValue === id ? 'ring-2 ring-primary' : 'border-border')}
                          style={sw ? getSwatchStyle(sw) : {}}
                          onClick={() => update({ backgroundValue: id, backgroundType: 'pattern' })}
                        />
                      );
                    })}
                  </div>
                )}

                {appearance.themeType === 'image' && (
                  <div className="space-y-3">
                    <div className="h-40 rounded-md border bg-muted flex items-center justify-center">
                      {appearance.backgroundType === 'image' && appearance.backgroundValue ? (
                        <img src={appearance.backgroundValue} alt="bg" className="object-cover h-full w-full rounded-md" />
                      ) : (
                        <div className="text-sm text-muted-foreground">No image selected</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            update({ backgroundType: 'image', backgroundValue: url });
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {appearance.themeType === 'animated' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      {['anim-1', 'anim-2', 'anim-3', 'anim-4'].map((a) => (
                        <button
                          key={a}
                          type="button"
                          className={cn('h-24 rounded-md border bg-gradient-to-br from-purple-400 to-pink-400', appearance.backgroundValue === a ? 'ring-2 ring-primary' : 'border-border')}
                          onClick={() => update({ backgroundValue: a, backgroundType: 'pattern' })}
                        />
                      ))}
                    </div>
                    <div>
                      <Label className="text-xs">Tint color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input value={appearance.themeColor} onChange={(e) => update({ themeColor: e.target.value })} className="w-36" />
                        <input type="color" value={appearance.themeColor} onChange={(e) => update({ themeColor: e.target.value })} className="h-10 w-10 rounded border" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Styles Button */}
          <DropdownMenu open={stylesOpen} onOpenChange={setStylesOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium">Styles</span>
                <div className="flex flex-col -space-y-0.5 text-gray-500">
                  <ChevronUp className="h-2.5 w-2.5" />
                  <ChevronDown className="h-2.5 w-2.5" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[320px] p-0" sideOffset={4}>
              <div className="flex items-center border-b border-border">
                {(['buttons', 'blocks', 'socials'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={cn(
                      'flex-1 px-4 py-2.5 text-sm font-medium capitalize rounded-t-lg transition-colors',
                      stylesPanelTab === t
                        ? 'bg-black text-white'
                        : 'bg-white text-foreground hover:bg-gray-50',
                    )}
                    onClick={() => setStylesPanelTab(t)}
                  >
                    {t}
                  </button>
                ))}
                <button
                  type="button"
                  className="p-2 text-muted-foreground hover:text-foreground ml-auto"
                  onClick={() => setStylesOpen(false)}
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
                {stylesPanelTab === 'buttons' && (
                  <>
                    <div>
                      <Label className="text-xs font-medium">Filled Buttons</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['default', 'rounded', 'pill'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={cn(
                              'h-9 px-3 rounded-md text-sm font-medium border-2 transition-colors',
                              appearance.filledButtonStyle === s
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-muted-foreground/50',
                            )}
                            style={{
                              backgroundColor: appearance.buttonColor,
                              color: appearance.buttonTextColor,
                            }}
                            onClick={() => update({ filledButtonStyle: s })}
                          >
                            {appearance.filledButtonStyle === s && <Check className="inline h-4 w-4 mr-1" />}
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-medium">Outline Buttons</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['default', 'rounded'].map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={cn(
                              'h-9 px-3 rounded-md text-sm border-2 bg-transparent',
                              appearance.outlineButtonStyle === s ? 'border-primary text-primary' : 'border-border',
                            )}
                            onClick={() => update({ outlineButtonStyle: s })}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Button color</Label>
                        <div className="flex gap-1 mt-1">
                          <Input
                            type="text"
                            value={appearance.buttonColor}
                            onChange={(e) => update({ buttonColor: e.target.value })}
                            className="font-mono text-xs h-8"
                          />
                          <input
                            type="color"
                            value={appearance.buttonColor}
                            onChange={(e) => update({ buttonColor: e.target.value })}
                            className="h-8 w-8 rounded border border-border cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Text color</Label>
                        <div className="flex gap-1 mt-1">
                          <Input
                            type="text"
                            value={appearance.buttonTextColor}
                            onChange={(e) => update({ buttonTextColor: e.target.value })}
                            className="font-mono text-xs h-8"
                          />
                          <input
                            type="color"
                            value={appearance.buttonTextColor}
                            onChange={(e) => update({ buttonTextColor: e.target.value })}
                            className="h-8 w-8 rounded border border-border cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {stylesPanelTab === 'blocks' && (
                  <>
                    <div>
                      <Label className="text-xs font-medium">Block Style</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {(['filled', 'outline'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={cn(
                              'flex flex-col items-center justify-center gap-1 h-16 rounded-lg border-2 capitalize relative',
                              appearance.blockStyle === s
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-white hover:border-gray-300',
                            )}
                            onClick={() => update({ blockStyle: s })}
                          >
                            <div
                              className={cn(
                                'w-12 h-8 rounded-md',
                                s === 'filled' ? 'bg-gray-200' : 'bg-transparent border-2 border-gray-300',
                              )}
                            />
                            {appearance.blockStyle === s && (
                              <Check className="h-4 w-4 text-green-500 absolute top-1 right-1" />
                            )}
                            <span className="text-xs font-medium">{s}</span>
                          </button>
                        ))}
                        {(['hard', 'soft'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={cn(
                              'flex flex-col items-center justify-center gap-1 h-16 rounded-lg border-2 capitalize relative',
                              appearance.blockShadow === s
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 bg-white hover:border-gray-300',
                            )}
                            onClick={() => update({ blockShadow: s })}
                          >
                            <div
                              className={cn(
                                'w-12 h-8 rounded-md bg-white border border-gray-200',
                                s === 'hard'
                                  ? 'shadow-[0_4px_6px_rgba(0,0,0,0.3)]'
                                  : 'shadow-[0_2px_4px_rgba(0,0,0,0.1)]',
                              )}
                            />
                            {appearance.blockShadow === s && (
                              <Check className="h-4 w-4 text-green-500 absolute top-1 right-1" />
                            )}
                            <span className="text-xs font-medium">{s} Shadow</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Block color</Label>
                        <div className="flex gap-1 mt-1">
                          <Input
                            type="text"
                            value={appearance.blockColor}
                            onChange={(e) => update({ blockColor: e.target.value })}
                            className="font-mono text-xs h-8"
                          />
                          <input
                            type="color"
                            value={appearance.blockColor}
                            onChange={(e) => update({ blockColor: e.target.value })}
                            className="h-8 w-8 rounded border border-border cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Text color</Label>
                        <div className="flex gap-1 mt-1">
                          <Input
                            type="text"
                            value={appearance.blockTextColor}
                            onChange={(e) => update({ blockTextColor: e.target.value })}
                            className="font-mono text-xs h-8"
                          />
                          <input
                            type="color"
                            value={appearance.blockTextColor}
                            onChange={(e) => update({ blockTextColor: e.target.value })}
                            className="h-8 w-8 rounded border border-border cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {stylesPanelTab === 'socials' && (
                  <div>
                    <Label className="text-xs font-medium">Social Style</Label>
                    <div className="mt-2 flex gap-4">
                      <button
                        type="button"
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-lg border-2',
                          appearance.socialStyle === 'original' ? 'border-primary bg-primary/5' : 'border-border',
                        )}
                        onClick={() => update({ socialStyle: 'original' })}
                      >
                        <div className="h-10 w-10 rounded-full border-2 border-green-500 flex items-center justify-center">
                          <span className="text-lg">IG</span>
                        </div>
                        <span className="text-xs">Original</span>
                      </button>
                      <button
                        type="button"
                        className={cn(
                          'flex flex-col items-center gap-1 p-3 rounded-lg border-2',
                          appearance.socialStyle === 'custom' ? 'border-primary bg-primary/5' : 'border-border',
                        )}
                        onClick={() => update({ socialStyle: 'custom' })}
                      >
                        <div className="h-10 w-10 rounded-full border-2 border-foreground flex items-center justify-center">
                          <span className="text-lg">IG</span>
                        </div>
                        <span className="text-xs">Custom</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Font Button (dropdown) */}
          <DropdownMenu open={fontModalOpen} onOpenChange={setFontModalOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium">Font</span>
                <span className="text-sm text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">{appearance.font}</span>
                <div className="flex flex-col -space-y-0.5 text-gray-500">
                  <ChevronUp className="h-2.5 w-2.5" />
                  <ChevronDown className="h-2.5 w-2.5" />
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56 p-2">
              <div className="flex items-center justify-between px-2 pb-2 border-b">
                <span className="text-sm font-medium">Font</span>
                <button type="button" className="p-1 text-muted-foreground hover:text-foreground" onClick={() => setFontModalOpen(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-2 pt-2 max-h-60 overflow-y-auto">
                {FONTS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-md text-left transition-colors',
                      appearance.font === f ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50',
                    )}
                    onClick={() => {
                      update({ font: f });
                      setFontModalOpen(false);
                    }}
                  >
                    <span className="text-sm" style={{ fontFamily: f }}>
                      {f}
                    </span>
                    {appearance.font === f && <Check className="h-4 w-4 text-green-600" />}
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-border mt-2">
                <Label className="text-xs font-medium">Page Font color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="text"
                    value={appearance.pageFontColor}
                    onChange={(e) => update({ pageFontColor: e.target.value })}
                    className="font-mono text-xs h-8"
                    placeholder="#FFFFFF"
                  />
                  <input
                    type="color"
                    value={appearance.pageFontColor}
                    onChange={(e) => update({ pageFontColor: e.target.value })}
                    className="h-8 w-8 rounded border border-border cursor-pointer"
                  />
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Action bar (right) */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleUndo} disabled={!canUndo} title="Undo" className="rounded-full h-9 w-9 bg-white border border-gray-200">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRedo} disabled={!canRedo} title="Redo" className="rounded-full h-9 w-9 bg-white border border-gray-200">
            <Redo2 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button variant="ghost" size="sm" onClick={handleCancel} disabled={!hasUnsavedChanges} className="rounded-full px-4 hover:bg-gray-100 font-medium">
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasUnsavedChanges} className="rounded-full px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium">
            Save changes
          </Button>
        </div>
      </div>

      {/* Preview Carousel */}
      <div className="flex-1 flex items-center justify-center overflow-hidden px-6 py-8 min-h-[600px] perspective-[1000px]">
        <div className="relative w-full max-w-5xl h-[500px] flex items-center justify-center">
          {previewCards.map((card, index) => renderPreviewCard(card, index))}
        </div>
      </div>

      {/* Font now uses dropdown above; modal removed */}
    </div>
  );
}
