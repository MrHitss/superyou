'use client';

import { useState, useCallback } from 'react';
import { StoreTabs } from '@/features/superyou/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sortable } from '@/components/ui/sortable';
import { ContentBlockRow } from '@/components/superyou/content-block-row';
import { QuickAddsModal } from '@/components/superyou/quick-adds-modal';
import { CarouselAddCardModal } from '@/components/superyou/carousel-add-card-modal';
import { CarouselCardEditSheet } from '@/components/superyou/carousel-card-edit-sheet';
import { CarouselCardEditModal } from '@/components/superyou/carousel-card-edit-modal';
import { WhatsAppChatLinkModal } from '@/components/superyou/whatsapp-chat-link-modal';
import { Link2, Plus } from 'lucide-react';
import type {
  ContentBlock,
  CarouselBlock,
  CarouselCard,
  CarouselCardBlockType,
} from '@/features/superyou/content-blocks/types';

const INITIAL_BLOCKS: ContentBlock[] = [
  {
    id: 'block-1',
    type: 'link',
    visible: true,
    order: 0,
    title: 'Get the 30 day Deep-dive E-Book',
    url: '#',
    thumbnailUrl: undefined,
  },
  {
    id: 'block-2',
    type: 'link',
    visible: true,
    order: 1,
    title: 'n',
    url: '#',
  },
  {
    id: 'block-3',
    type: 'header',
    visible: true,
    order: 2,
    text: 'Header 1',
    maxLength: 35,
  },
  {
    id: 'block-4',
    type: 'header',
    visible: true,
    order: 3,
    text: 'Header 2',
    maxLength: 35,
  },
  {
    id: 'block-5',
    type: 'carousel',
    visible: true,
    order: 4,
    title: 'Enter carousel title',
    cards: [
      { id: 'c1', blockType: 'link', title: 'Card 1', url: '#' },
      { id: 'c2', blockType: 'link', title: 'Marketing Guide', url: '#' },
    ],
  },
];

function createDefaultCarouselCard(blockType: CarouselCardBlockType): CarouselCard {
  const id = `card-${Date.now()}`;
  switch (blockType) {
    case 'link':
      return { id, blockType: 'link', title: 'New link', url: '#' };
    case 'whatsapp':
      return { id, blockType: 'whatsapp', title: 'WhatsApp', phone_code: '', number: '' };
    case 'form':
      return { id, blockType: 'form', title: 'Form', form_id: '' };
    default:
      return { id, blockType: 'link', title: 'New card', url: '#' };
  }
}

export default function CreateSuperProfilePage() {
  const [activeTab, setActiveTab] = useState('store');
  const [quickAddsOpen, setQuickAddsOpen] = useState(false);
  const [carouselAddCardBlock, setCarouselAddCardBlock] = useState<CarouselBlock | null>(null);
  const [cardEditState, setCardEditState] = useState<{ block: CarouselBlock; card: CarouselCard } | null>(null);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappModalCarouselContext, setWhatsappModalCarouselContext] = useState<{
    block: CarouselBlock;
    card: CarouselCard | null;
  } | null>(null);
  const [carouselCardEditModalState, setCarouselCardEditModalState] = useState<{ block: CarouselBlock; card: CarouselCard } | null>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>(INITIAL_BLOCKS);

  const getItemValue = useCallback((block: ContentBlock) => block.id, []);

  const handleBlocksReorder = useCallback((newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
  }, []);

  const handleDelete = useCallback((block: ContentBlock) => {
    setBlocks((prev) => prev.filter((b) => b.id !== block.id));
  }, []);

  const handleEdit = useCallback((block: ContentBlock) => {
    console.log('Edit block', block.id);
  }, []);

  const handleCopy = useCallback((block: ContentBlock) => {
    const copy: ContentBlock = {
      ...block,
      id: `block-${Date.now()}`,
      order: blocks.length,
    };
    setBlocks((prev) => [...prev, copy].sort((a, b) => a.order - b.order));
  }, [blocks.length]);

  const handleDuplicate = useCallback((block: ContentBlock) => {
    handleCopy(block);
  }, [handleCopy]);

  const handleSchedule = useCallback((_block: ContentBlock) => {
    console.log('Schedule block');
  }, []);

  const handleToggleLock = useCallback((block: ContentBlock) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id ? { ...b, locked: !b.locked } : b,
      ),
    );
  }, []);

  const handleToggleFavourite = useCallback((block: ContentBlock) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === block.id ? { ...b, favourite: !b.favourite } : b,
      ),
    );
  }, []);

  const handleVisibleChange = useCallback((block: ContentBlock, visible: boolean) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === block.id ? { ...b, visible } : b)),
    );
  }, []);

  const handleAnalytics = useCallback((block: ContentBlock) => {
    console.log('Analytics for block', block.id);
  }, []);

  const handleAddCard = useCallback((block: ContentBlock) => {
    if (block.type !== 'carousel') return;
    setCarouselAddCardBlock(block);
  }, []);

  const handleCarouselAddCardSelect = useCallback(
    (blockType: CarouselCardBlockType) => {
      if (!carouselAddCardBlock) return;
      if (blockType === 'whatsapp') {
        setWhatsappModalCarouselContext({ block: carouselAddCardBlock, card: null });
        setCarouselAddCardBlock(null);
        setWhatsappModalOpen(true);
        return;
      }
      const newCard = createDefaultCarouselCard(blockType);
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === carouselAddCardBlock.id && b.type === 'carousel'
            ? { ...b, cards: [...b.cards, newCard] }
            : b,
        ),
      );
      setCarouselAddCardBlock(null);
    },
    [carouselAddCardBlock],
  );

  const handleEditCard = useCallback((block: ContentBlock, card: CarouselCard) => {
    if (block.type !== 'carousel') return;
    if (card.blockType === 'link' || card.blockType === 'whatsapp') {
      setCarouselCardEditModalState({ block, card });
      return;
    }
    setCardEditState({ block, card });
  }, []);

  const handleCardEditSave = useCallback((updatedCard: CarouselCard) => {
    if (!cardEditState) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === cardEditState.block.id && b.type === 'carousel'
          ? { ...b, cards: b.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)) }
          : b,
      ),
    );
    setCardEditState(null);
  }, [cardEditState]);

  const handleReorderCards = useCallback((_block: ContentBlock) => {
    console.log('Re-order cards');
  }, []);

  const handleCarouselCardModalSave = useCallback((updatedCard: CarouselCard) => {
    if (!carouselCardEditModalState) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === carouselCardEditModalState.block.id && b.type === 'carousel'
          ? { ...b, cards: b.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)) }
          : b,
      ),
    );
    setCarouselCardEditModalState(null);
  }, [carouselCardEditModalState]);

  const handleCarouselCardModalRemove = useCallback((cardToRemove: CarouselCard) => {
    if (!carouselCardEditModalState) return;
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === carouselCardEditModalState.block.id && b.type === 'carousel'
          ? { ...b, cards: b.cards.filter((c) => c.id !== cardToRemove.id) }
          : b,
      ),
    );
    setCarouselCardEditModalState(null);
  }, [carouselCardEditModalState]);

  const handleOpenWhatsAppDetailsForCard = useCallback(() => {
    if (!carouselCardEditModalState) return;
    setWhatsappModalCarouselContext({
      block: carouselCardEditModalState.block,
      card: carouselCardEditModalState.card,
    });
    setWhatsappModalOpen(true);
  }, [carouselCardEditModalState]);

  const handleWhatsappModalSave = useCallback(
    (data: { phone_code: string; number: string; prefilled_message?: string }) => {
      if (!whatsappModalCarouselContext) return;
      const { block, card } = whatsappModalCarouselContext;
      if (card) {
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === block.id && b.type === 'carousel'
              ? {
                  ...b,
                  cards: b.cards.map((c) =>
                    c.id === card.id
                      ? { ...c, phone_code: data.phone_code, number: data.number, prefilled_message: data.prefilled_message }
                      : c,
                  ),
                }
              : b,
          ),
        );
      } else {
        const newCard: CarouselCard = {
          id: `card-${Date.now()}`,
          blockType: 'whatsapp',
          title: 'WhatsApp',
          phone_code: data.phone_code,
          number: data.number,
          prefilled_message: data.prefilled_message,
        };
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === block.id && b.type === 'carousel'
              ? { ...b, cards: [...b.cards, newCard] }
              : b,
          ),
        );
      }
      setWhatsappModalCarouselContext(null);
      setWhatsappModalOpen(false);
    },
    [whatsappModalCarouselContext],
  );

  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border bg-background px-6 py-4">
        <StoreTabs value={activeTab} onValueChange={setActiveTab} />
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Your Store is live:</span>
            <span className="font-medium">superyou.bio/yourhandle</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Edit</Button>
            <Button size="sm">Share Link</Button>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Add a link to your store" className="pl-9" />
          </div>
          <Button>Enter</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-foreground text-background hover:bg-foreground/90"
            onClick={() => setQuickAddsOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
          <Button variant="outline">Add a Header</Button>
        </div>

        <Sortable
          value={blocks}
          onValueChange={handleBlocksReorder}
          getItemValue={getItemValue}
          className="space-y-2"
        >
          {blocks.map((block) => (
            <ContentBlockRow
              key={block.id}
              value={block.id}
              block={block}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onDuplicate={handleDuplicate}
              onSchedule={handleSchedule}
              onToggleLock={handleToggleLock}
              onToggleFavourite={handleToggleFavourite}
              onVisibleChange={handleVisibleChange}
              onAnalytics={handleAnalytics}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onReorderCards={handleReorderCards}
            />
          ))}
        </Sortable>
      </div>

      <QuickAddsModal
        open={quickAddsOpen}
        onOpenChange={setQuickAddsOpen}
        onSelect={(id) => {
          console.log('Quick add:', id);
          setQuickAddsOpen(false);
        }}
      />

      <CarouselAddCardModal
        open={carouselAddCardBlock != null}
        onOpenChange={(open) => !open && setCarouselAddCardBlock(null)}
        onSelect={handleCarouselAddCardSelect}
      />

      <CarouselCardEditSheet
        open={cardEditState != null}
        onOpenChange={(open) => !open && setCardEditState(null)}
        card={cardEditState?.card ?? null}
        onSave={handleCardEditSave}
      />

      {carouselCardEditModalState && (
        <CarouselCardEditModal
          open={carouselCardEditModalState != null}
          onOpenChange={(open) => !open && setCarouselCardEditModalState(null)}
          block={carouselCardEditModalState.block}
          card={
            (() => {
              const b = blocks.find((x) => x.id === carouselCardEditModalState.block.id && x.type === 'carousel');
              if (b && b.type === 'carousel') {
                const c = b.cards.find((x) => x.id === carouselCardEditModalState.card.id);
                return c ?? carouselCardEditModalState.card;
              }
              return carouselCardEditModalState.card;
            })()
          }
          onSave={handleCarouselCardModalSave}
          onRemove={handleCarouselCardModalRemove}
          onOpenWhatsAppDetails={
            carouselCardEditModalState.card.blockType === 'whatsapp' ? handleOpenWhatsAppDetailsForCard : undefined
          }
        />
      )}

      <WhatsAppChatLinkModal
        open={whatsappModalOpen && whatsappModalCarouselContext != null}
        onOpenChange={(open) => {
          if (!open) {
            setWhatsappModalOpen(false);
            setWhatsappModalCarouselContext(null);
          }
        }}
        block={null}
        initialData={
          whatsappModalCarouselContext?.card
            ? {
                phone_code: whatsappModalCarouselContext.card.phone_code ?? '',
                number: whatsappModalCarouselContext.card.number ?? '',
                prefilled_message: whatsappModalCarouselContext.card.prefilled_message,
              }
            : undefined
        }
        onSave={handleWhatsappModalSave}
      />
    </div>
  );
}
