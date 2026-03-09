'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ContentBlock } from '@/features/superyou/content-blocks/types';
import type { BlockAnimationType } from '@/features/superyou/content-blocks/types';

const ANIMATIONS: { value: BlockAnimationType; label: string; previewClass: string }[] = [
  { value: 'none', label: 'None', previewClass: '' },
  { value: 'ring', label: 'Ring', previewClass: 'animate-preview-ring' },
  { value: 'jump', label: 'Jump', previewClass: 'animate-preview-jump' },
  { value: 'grow', label: 'Grow', previewClass: 'animate-preview-grow' },
  { value: 'shake', label: 'Shake', previewClass: 'animate-preview-shake' },
  { value: 'glow', label: 'Glow', previewClass: 'animate-preview-glow' },
  { value: 'shine', label: 'Shine', previewClass: 'animate-preview-shine' },
];

interface BlockAnimationExpandableProps {
  block: ContentBlock;
  onSave: (blockId: string, animation: BlockAnimationType) => void;
  onClose: () => void;
}

export function BlockAnimationExpandable({
  block,
  onSave,
  onClose,
}: BlockAnimationExpandableProps) {
  const [selected, setSelected] = useState<BlockAnimationType>(
    block.animation ?? 'none',
  );

  useEffect(() => {
    setSelected(block.animation ?? 'none');
  }, [block]);

  const handleSave = () => {
    onSave(block.id, selected);
    onClose();
  };

  return (
    <div className="border-t border-border bg-muted/20">
      <style>{`
        @keyframes preview-ring {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--primary) 45%, transparent); }
          50% { box-shadow: 0 0 0 6px color-mix(in srgb, var(--primary) 0%, transparent); }
        }
        @keyframes preview-jump {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes preview-grow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes preview-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-3px); }
          40% { transform: translateX(3px); }
          60% { transform: translateX(-2px); }
          80% { transform: translateX(2px); }
        }
        @keyframes preview-glow {
          0%, 100% { box-shadow: 0 0 8px color-mix(in srgb, var(--primary) 35%, transparent); filter: brightness(1); }
          50% { box-shadow: 0 0 16px color-mix(in srgb, var(--primary) 55%, transparent); filter: brightness(1.15); }
        }
        @keyframes preview-shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-preview-ring { animation: preview-ring 1.5s ease-in-out infinite; }
        .animate-preview-jump { animation: preview-jump 0.8s ease-in-out infinite; }
        .animate-preview-grow { animation: preview-grow 1.2s ease-in-out infinite; }
        .animate-preview-shake { animation: preview-shake 0.6s ease-in-out infinite; }
        .animate-preview-glow { animation: preview-glow 1.5s ease-in-out infinite; }
        .animate-preview-shine {
          background-size: 200% 100%;
          background-image: linear-gradient(105deg, transparent 40%, color-mix(in srgb, var(--primary) 30%, transparent) 50%, transparent 60%);
          animation: preview-shine 2s ease-in-out infinite;
        }
      `}</style>
      <div className="flex items-center justify-between bg-muted px-4 py-3">
        <div>
          <h4 className="text-sm font-semibold">Animate Block</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Make your block stand out. Grab attention with unique animations.
          </p>
        </div>
        <button
          type="button"
          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          onClick={handleSave}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 px-4 py-4">
        {ANIMATIONS.map((a) => (
          <Button
            key={a.value}
            type="button"
            variant={selected === a.value ? 'secondary' : 'outline'}
            size="sm"
            className={cn(
              'min-w-[72px] relative overflow-hidden',
              a.previewClass && 'rounded-md',
              a.previewClass,
            )}
            onClick={() => setSelected(a.value)}
          >
            <span className="relative z-[1]">{a.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
