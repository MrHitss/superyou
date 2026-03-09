'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SUPERYOU_STORE_TABS } from '@/features/superyou/layout/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sortable } from '@/components/ui/sortable';
import { ContentBlockRow, type BlockExpandedMode } from '@/components/superyou/content-block-row';
import { QuickAddsModal } from '@/components/superyou/quick-adds-modal';
import { CarouselAddCardModal } from '@/components/superyou/carousel-add-card-modal';
import { CarouselCardEditSheet } from '@/components/superyou/carousel-card-edit-sheet';
import { CarouselCardEditModal } from '@/components/superyou/carousel-card-edit-modal';
import { WhatsAppChatLinkModal } from '@/components/superyou/whatsapp-chat-link-modal';
import { AppearanceTab } from '@/components/superyou/appearance-tab';
import { StoreSettings } from '@/app/(protected)/account/home/settings-sidebar/components/store-settings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Link2, Plus, Pencil, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  useProfileBlocks,
  useMeLinkPage,
  contentBlockToApiPayload,
  carouselCardToApiPayload,
  updateProfile,
  type ContentBlock,
  type WhatsAppBlock,
  type CarouselBlock,
  type CarouselCard,
  type CarouselCardBlockType,
  type ContentBlockSchedule,
  type ContentBlockLock,
  type BlockAnimationType,
  type BlockLayoutType,
} from '@/features/superyou/content-blocks';

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

const TAB_IDS = SUPERYOU_STORE_TABS.map((t) => t.id);

export default function OrbitYouPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { data: session } = useSession();
  const token = (session as { beeToken?: string } | null)?.beeToken ?? null;

  const {
    blocks,
    profileId,
    profileSlug,
    isLoading,
    error,
    refetch,
    apiEnabled,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  } = useProfileBlocks([]);

  const { data: meLinkPageData, refetch: refetchMeLinkPage } = useMeLinkPage();

  const [quickAddsOpen, setQuickAddsOpen] = useState(false);
  const [carouselAddCardBlock, setCarouselAddCardBlock] = useState<CarouselBlock | null>(null);
  const [cardEditState, setCardEditState] = useState<{ block: CarouselBlock; card: CarouselCard } | null>(null);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [whatsappModalBlock, setWhatsappModalBlock] = useState<WhatsAppBlock | null>(null);
  /** When set, WhatsApp modal is used for adding/editing a carousel card (same modal as standalone) */
  const [whatsappModalCarouselContext, setWhatsappModalCarouselContext] = useState<{
    block: CarouselBlock;
    card: CarouselCard | null;
  } | null>(null);
  /** When set, "Edit carousel card" modal is open (for link or WhatsApp card) */
  const [carouselCardEditModalState, setCarouselCardEditModalState] = useState<{ block: CarouselBlock; card: CarouselCard } | null>(null);
  const [linkInput, setLinkInput] = useState('');
  const [storeHeader, setStoreHeader] = useState({
    name: 'Store name',
    description: 'Add a short description for your store',
    imageUrl: '' as string | undefined,
  });
  const [headerEditOpen, setHeaderEditOpen] = useState(false);
  const [headerEditForm, setHeaderEditForm] = useState(storeHeader);
  const headerImageInputRef = useRef<HTMLInputElement>(null);

  // Sync store header from profile (display_name → name, bio → description, avatar_url → imageUrl)
  useEffect(() => {
    const profile = meLinkPageData?.profile;
    if (profile) {
      setStoreHeader({
        name: profile.display_name ?? 'Store name',
        description: profile.bio ?? 'Add a short description for your store',
        imageUrl: profile.avatar_url || undefined,
      });
    }
  }, [meLinkPageData?.profile]);
  const [expanded, setExpanded] = useState<{
    blockId: string | null;
    mode: BlockExpandedMode;
    editGroup?: string;
  }>({ blockId: null, mode: null });
  const expandedBlockId = expanded.blockId;
  const expandedMode = expanded.mode;
  const expandedEditGroup = expanded.editGroup;

  const getItemValue = useCallback((block: ContentBlock) => block.id, []);

  const handleBlocksReorder = useCallback(
    (newBlocks: ContentBlock[]) => {
      if (apiEnabled) {
        reorderBlocks(newBlocks.map((b, i) => ({ ...b, order: i })));
      }
    },
    [apiEnabled, reorderBlocks],
  );

  const handleDelete = useCallback(
    (block: ContentBlock) => {
      if (apiEnabled) {
        deleteBlock(block.id);
      }
    },
    [apiEnabled, deleteBlock],
  );

  const handleEdit = useCallback((block: ContentBlock, expandedGroup?: string) => {
    setExpanded((prev) =>
      prev.blockId === block.id && prev.mode === 'edit' && prev.editGroup === expandedGroup
        ? { blockId: null, mode: null, editGroup: undefined }
        : { blockId: block.id, mode: 'edit', editGroup: expandedGroup },
    );
  }, []);

  const handleCopy = useCallback(
    async (block: ContentBlock) => {
      if (!apiEnabled) return;
      const copy: ContentBlock = {
        ...block,
        id: `block-${Date.now()}`,
        order: 0,
      };
      const payload = contentBlockToApiPayload(copy, profileId ?? '', 0);
      await createBlock(payload);
    },
    [apiEnabled, profileId, createBlock],
  );

  const handleDuplicate = useCallback((block: ContentBlock) => {
    void handleCopy(block);
  }, [handleCopy]);

  const handleSchedule = useCallback((block: ContentBlock) => {
    setExpanded((prev) =>
      prev.blockId === block.id && prev.mode === 'schedule'
        ? { blockId: null, mode: null }
        : { blockId: block.id, mode: 'schedule' },
    );
  }, []);

  const handleEditSave = useCallback(
    async (updated: ContentBlock) => {
      if (apiEnabled) {
        const payload = contentBlockToApiPayload(updated, profileId ?? '', updated.order);
        await updateBlock(updated.id, {
          content_json: payload.content_json,
          settings_json: payload.settings_json,
          thumbnail_url: payload.thumbnail_url,
          is_active: payload.is_active,
        });
      }
      setExpanded({ blockId: null, mode: null, editGroup: undefined });
    },
    [apiEnabled, profileId, updateBlock],
  );

  /** Persist block content when user blurs a field (edit panel stays open). */
  const handleEditBlur = useCallback(
    async (updated: ContentBlock) => {
      if (!apiEnabled) return;
      const payload = contentBlockToApiPayload(updated, profileId ?? '', updated.order);
      await updateBlock(updated.id, {
        content_json: payload.content_json,
        settings_json: payload.settings_json,
        thumbnail_url: payload.thumbnail_url,
        is_active: payload.is_active,
      });
    },
    [apiEnabled, profileId, updateBlock],
  );

  const handleScheduleSave = useCallback(
    async (blockId: string, schedule: ContentBlockSchedule) => {
      if (apiEnabled) {
        await updateBlock(blockId, {
          settings_json: {
            schedule: {
              start_at: schedule.appearAt,
              end_at: schedule.disappearAt,
            },
          },
        });
      }
      setExpanded({ blockId: null, mode: null, editGroup: undefined });
    },
    [apiEnabled, updateBlock],
  );

  const handleLockOpen = useCallback((block: ContentBlock) => {
    setExpanded((prev) =>
      prev.blockId === block.id && prev.mode === 'lock'
        ? { blockId: null, mode: null }
        : { blockId: block.id, mode: 'lock' },
    );
  }, []);

  const handleLayoutOpen = useCallback((block: ContentBlock) => {
    setExpanded((prev) =>
      prev.blockId === block.id && prev.mode === 'layout'
        ? { blockId: null, mode: null }
        : { blockId: block.id, mode: 'layout' },
    );
  }, []);

  const handleAnimationOpen = useCallback((block: ContentBlock) => {
    setExpanded((prev) =>
      prev.blockId === block.id && prev.mode === 'animation'
        ? { blockId: null, mode: null }
        : { blockId: block.id, mode: 'animation' },
    );
  }, []);

  const handleHeaderTextChange = useCallback(
    (block: ContentBlock, text: string) => {
      if (block.type !== 'header' || !apiEnabled) return;
      updateBlock(block.id, { content_json: { title: text } });
    },
    [apiEnabled, updateBlock],
  );

  const handleLockSave = useCallback((blockId: string, lock: ContentBlockLock, activated: boolean) => {
    // Lock API not yet integrated; persist when backend supports it
    setExpanded({ blockId: null, mode: null, editGroup: undefined });
  }, []);

  const handleAnimationSave = useCallback(
    async (blockId: string, animation: BlockAnimationType) => {
      if (apiEnabled) {
        await updateBlock(blockId, {
          settings_json: { animation: animation === 'none' ? undefined : animation },
        });
      }
      setExpanded({ blockId: null, mode: null, editGroup: undefined });
    },
    [apiEnabled, updateBlock],
  );

  const handleLayoutSave = useCallback(
    async (blockId: string, layout: BlockLayoutType) => {
      if (apiEnabled) {
        await updateBlock(blockId, { settings_json: { layout } });
      }
      setExpanded({ blockId: null, mode: null, editGroup: undefined });
    },
    [apiEnabled, updateBlock],
  );

  const handleExpandClose = useCallback(() => {
    setExpanded({ blockId: null, mode: null, editGroup: undefined });
  }, []);

  const handleToggleLock = useCallback((block: ContentBlock) => {
    // Lock state is local/UI only unless API supports it
  }, []);

  const handleToggleFavourite = useCallback(
    (block: ContentBlock) => {
      if (!apiEnabled) return;
      const current = block.favourite ?? (block as { is_highlight?: boolean }).is_highlight ?? false;
      updateBlock(block.id, { settings_json: { is_highlight: !current } });
    },
    [apiEnabled, updateBlock],
  );

  const handleVisibleChange = useCallback(
    (block: ContentBlock, visible: boolean) => {
      if (apiEnabled) {
        updateBlock(block.id, { is_active: visible });
      }
    },
    [apiEnabled, updateBlock],
  );

  const handleAnalytics = useCallback((block: ContentBlock) => {
    console.log('Analytics for block', block.id);
  }, []);

  const handleAddCard = useCallback((block: ContentBlock) => {
    if (block.type !== 'carousel') return;
    setCarouselAddCardBlock(block);
  }, []);

  const handleCarouselAddCardSelect = useCallback(
    async (blockType: CarouselCardBlockType) => {
      if (!carouselAddCardBlock || !apiEnabled) return;
      if (blockType === 'whatsapp') {
        setWhatsappModalCarouselContext({ block: carouselAddCardBlock, card: null });
        setCarouselAddCardBlock(null);
        setWhatsappModalOpen(true);
        return;
      }
      const newCard = createDefaultCarouselCard(blockType);
      const position = carouselAddCardBlock.cards.length;
      const payload = carouselCardToApiPayload(newCard, profileId ?? '', carouselAddCardBlock.id, position);
      await createBlock(payload);
      setCarouselAddCardBlock(null);
    },
    [carouselAddCardBlock, apiEnabled, profileId, createBlock],
  );

  const handleEditCard = useCallback((block: ContentBlock, card: CarouselCard) => {
    if (block.type !== 'carousel') return;
    if (card.blockType === 'link' || card.blockType === 'whatsapp') {
      setCarouselCardEditModalState({ block, card });
      return;
    }
    setCardEditState({ block, card });
  }, []);

  const handleCardEditSave = useCallback(
    async (updatedCard: CarouselCard) => {
      if (!cardEditState || !apiEnabled) return;
      const position = cardEditState.block.cards.findIndex((c) => c.id === updatedCard.id);
      const payload = carouselCardToApiPayload(
        updatedCard,
        profileId ?? '',
        cardEditState.block.id,
        position >= 0 ? position : 0,
      );
      await updateBlock(updatedCard.id, {
        content_json: payload.content_json,
        settings_json: payload.settings_json,
        thumbnail_url: payload.thumbnail_url,
      });
      setCardEditState(null);
    },
    [cardEditState, apiEnabled, profileId, updateBlock],
  );

  const handleCarouselCardModalSave = useCallback(
    async (updatedCard: CarouselCard) => {
      if (!carouselCardEditModalState || !apiEnabled) return;
      const block = carouselCardEditModalState.block;
      const position = block.cards.findIndex((c) => c.id === updatedCard.id);
      const payload = carouselCardToApiPayload(updatedCard, profileId ?? '', block.id, position >= 0 ? position : block.cards.length);
      await updateBlock(updatedCard.id, {
        content_json: payload.content_json,
        settings_json: payload.settings_json,
        thumbnail_url: payload.thumbnail_url,
      });
      setCarouselCardEditModalState(null);
    },
    [carouselCardEditModalState, apiEnabled, profileId, updateBlock],
  );

  const handleCarouselCardModalRemove = useCallback(
    async (cardToRemove: CarouselCard) => {
      if (!carouselCardEditModalState || !apiEnabled) return;
      await deleteBlock(cardToRemove.id);
      setCarouselCardEditModalState(null);
    },
    [carouselCardEditModalState, apiEnabled, deleteBlock],
  );

  const handleOpenWhatsAppDetailsForCard = useCallback(() => {
    if (!carouselCardEditModalState) return;
    setWhatsappModalCarouselContext({
      block: carouselCardEditModalState.block,
      card: carouselCardEditModalState.card,
    });
    setWhatsappModalOpen(true);
  }, [carouselCardEditModalState]);

  const handleReorderCards = useCallback((_block: ContentBlock) => {
    console.log('Re-order cards');
  }, []);

  const handleAddLink = useCallback(async () => {
    const url = linkInput.trim();
    if (!url || !apiEnabled) return;
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: 'link',
      visible: true,
      order: 0,
      title: url.replace(/^https?:\/\//, '').slice(0, 50) || 'New link',
      url: url.startsWith('http') ? url : `https://${url}`,
    };
    const payload = contentBlockToApiPayload(newBlock, profileId ?? '', 0);
    await createBlock(payload);
    setLinkInput('');
  }, [linkInput, apiEnabled, profileId, createBlock]);

  const handleAddHeader = useCallback(async () => {
    if (!apiEnabled) return;
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: 'header',
      visible: true,
      order: 0,
      text: 'New Header',
      maxLength: 35,
    };
    const payload = contentBlockToApiPayload(newBlock, profileId ?? '', 0);
    await createBlock(payload);
  }, [apiEnabled, profileId, createBlock]);

  const handleAddBlockFromQuickAdd = useCallback(
    async (id: string) => {
      if (!apiEnabled) return;
      const baseId = `block-${Date.now()}`;

      const linkBlock = (title: string, url = '#') =>
        ({
          id: baseId,
          type: 'link' as const,
          visible: true,
          order: 0,
          title,
          url,
        }) satisfies ContentBlock;

      const carouselBlock = (): ContentBlock => ({
        id: baseId,
        type: 'carousel',
        visible: true,
        order: 0,
        title: 'Enter carousel title',
        cards: [],
      });

      const formBlock = (): ContentBlock => ({
        id: baseId,
        type: 'form',
        visible: true,
        order: 0,
        form_id: '',
      });

      const quickAddMap: Record<string, ContentBlock> = {
        carousel: carouselBlock(),
        form: formBlock(),
        existing_products: linkBlock('Existing Products'),
        lead_magnet: linkBlock('Lead Magnet'),
        referral: linkBlock('Referral Link'),
        cj_affiliate: linkBlock('CJ Affiliate Link'),
        digital_files: linkBlock('Sell Digital Files'),
        one_on_one: linkBlock('Offer 1-on-1 Session'),
        membership: linkBlock('Recurring Membership'),
        event: linkBlock('Host Event or Webinar'),
        course: linkBlock('Sell a course'),
        locked_content: linkBlock('Locked Content'),
      };

      if (id === 'whatsapp') {
        setQuickAddsOpen(false);
        setWhatsappModalBlock(null);
        setWhatsappModalOpen(true);
        return;
      }

      const newBlock = quickAddMap[id];
      if (newBlock) {
        const payload = contentBlockToApiPayload(newBlock, profileId ?? '', 0);
        await createBlock(payload);
      }
      setQuickAddsOpen(false);
    },
    [apiEnabled, profileId, createBlock],
  );

  const handleWhatsappModalSave = useCallback(
    async (data: { phone_code: string; number: string; prefilled_message?: string }) => {
      if (!apiEnabled) return;
      if (whatsappModalCarouselContext) {
        const { block, card } = whatsappModalCarouselContext;
        if (card) {
          await updateBlock(card.id, {
            content_json: {
              title: card.title ?? 'WhatsApp',
              phone_code: data.phone_code,
              number: data.number,
              prefilled_message: data.prefilled_message,
            },
          });
        } else {
          const newCard: CarouselCard = {
            id: `card-${Date.now()}`,
            blockType: 'whatsapp',
            title: 'WhatsApp',
            phone_code: data.phone_code,
            number: data.number,
            prefilled_message: data.prefilled_message,
          };
          const payload = carouselCardToApiPayload(newCard, profileId ?? '', block.id, block.cards.length);
          await createBlock(payload);
        }
        setWhatsappModalCarouselContext(null);
        setWhatsappModalOpen(false);
        return;
      }
      if (whatsappModalBlock) {
        await updateBlock(whatsappModalBlock.id, {
          content_json: {
            title: whatsappModalBlock.title,
            description: whatsappModalBlock.shortDescription,
            cta: whatsappModalBlock.ctaText,
            phone_code: data.phone_code,
            number: data.number,
            prefilled_message: data.prefilled_message,
          },
        });
      } else {
        const baseId = `block-${Date.now()}`;
        const newBlock: WhatsAppBlock = {
          id: baseId,
          type: 'whatsapp',
          visible: true,
          order: 0,
          title: 'WhatsApp',
          phone_code: data.phone_code,
          number: data.number,
          prefilled_message: data.prefilled_message,
        };
        const payload = contentBlockToApiPayload(newBlock, profileId ?? '', 0);
        await createBlock(payload);
      }
      setWhatsappModalOpen(false);
      setWhatsappModalBlock(null);
    },
    [apiEnabled, profileId, whatsappModalCarouselContext, whatsappModalBlock, createBlock, updateBlock],
  );

  const handleWhatsAppDetailsOpen = useCallback((block: ContentBlock) => {
    if (block.type === 'whatsapp') {
      setWhatsappModalBlock(block);
      setWhatsappModalOpen(true);
    }
  }, []);

  const router = useRouter();
  const setActiveTab = useCallback(
    (value: string) => {
      const path = value === 'store' ? '/orbit/you' : `/orbit/you?tab=${value}`;
      router.replace(path);
    },
    [router],
  );

  const tab = useMemo((): (typeof TAB_IDS)[number] => {
    const t = tabParam && TAB_IDS.includes(tabParam as (typeof TAB_IDS)[number]) ? tabParam : 'store';
    return t as (typeof TAB_IDS)[number];
  }, [tabParam]);

  if (tab === 'appearance') {
    return <AppearanceTab />;
  }

  if (tab === 'settings') {
    return (
      <div className="flex flex-col min-h-full bg-muted/40 p-6">
        <StoreSettings />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-muted/40">
      <div className="flex-1 p-6 space-y-6">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading blocks…</p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {!apiEnabled && !isLoading && (
          <p className="text-sm text-muted-foreground">Connect your account to load and save blocks.</p>
        )}
        {/* Header section: round image, name, description, edit */}
        <section className="rounded-lg border border-border bg-background px-4 py-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Header</h2>
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 rounded-full shrink-0 border border-border">
              <AvatarImage src={storeHeader.imageUrl} alt={storeHeader.name} />
              <AvatarFallback className="rounded-full bg-muted text-muted-foreground text-lg">
                {storeHeader.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="font-medium text-foreground">{storeHeader.name}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm text-muted-foreground flex-1 min-w-0">
                  {storeHeader.description}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    setHeaderEditForm({ ...storeHeader });
                    setHeaderEditOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Add a link to your store"
              className="pl-9"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddLink()}
            />
          </div>
          <Button onClick={handleAddLink}>Enter</Button>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            className="w-full bg-foreground text-background hover:bg-foreground/90"
            onClick={() => setQuickAddsOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
          <Button variant="outline" className="w-full" onClick={handleAddHeader}>
            Add a Header
          </Button>
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
              expandedMode={expandedBlockId === block.id ? expandedMode : null}
              expandedEditGroup={expandedBlockId === block.id ? expandedEditGroup : undefined}
              onEdit={handleEdit}
              onWhatsAppDetailsOpen={handleWhatsAppDetailsOpen}
              onDelete={handleDelete}
              onCopy={handleCopy}
              onDuplicate={handleDuplicate}
              onSchedule={handleSchedule}
              onLockOpen={handleLockOpen}
              onLayoutOpen={handleLayoutOpen}
              onAnimationOpen={handleAnimationOpen}
              onToggleLock={handleToggleLock}
              onToggleFavourite={handleToggleFavourite}
              onVisibleChange={handleVisibleChange}
              onHeaderTextChange={handleHeaderTextChange}
              onAnalytics={handleAnalytics}
              onAddCard={handleAddCard}
              onEditCard={handleEditCard}
              onReorderCards={handleReorderCards}
              onEditSave={handleEditSave}
              onEditBlur={handleEditBlur}
              onScheduleSave={handleScheduleSave}
              onLockSave={handleLockSave}
              onAnimationSave={handleAnimationSave}
              onLayoutSave={handleLayoutSave}
              onExpandClose={handleExpandClose}
            />
          ))}
        </Sortable>
      </div>

      <QuickAddsModal
        open={quickAddsOpen}
        onOpenChange={setQuickAddsOpen}
        onSelect={handleAddBlockFromQuickAdd}
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
        open={whatsappModalOpen || whatsappModalCarouselContext != null}
        onOpenChange={(open) => {
          if (!open) {
            setWhatsappModalOpen(false);
            setWhatsappModalBlock(null);
            setWhatsappModalCarouselContext(null);
          }
        }}
        block={whatsappModalCarouselContext ? null : whatsappModalBlock}
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

      <Dialog open={headerEditOpen} onOpenChange={setHeaderEditOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>Edit Header</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <div className="space-y-2">
              <Label>Profile image</Label>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 rounded-full border border-border shrink-0">
                    <AvatarImage src={headerEditForm.imageUrl ?? undefined} alt={headerEditForm.name} />
                    <AvatarFallback className="rounded-full bg-muted text-muted-foreground text-lg">
                      {(headerEditForm.name || '?').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <input
                      ref={headerImageInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            const dataUrl = reader.result as string;
                            setHeaderEditForm((prev) => ({ ...prev, imageUrl: dataUrl }));
                          };
                          reader.readAsDataURL(file);
                        }
                        e.target.value = '';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => headerImageInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload image
                    </Button>
                    <p className="text-xs text-muted-foreground">or set URL below</p>
                  </div>
                </div>
                <Input
                  id="header-image"
                  value={headerEditForm.imageUrl?.startsWith('data:') ? '' : (headerEditForm.imageUrl ?? '')}
                  onChange={(e) =>
                    setHeaderEditForm((prev) => ({
                      ...prev,
                      imageUrl: e.target.value.trim() || undefined,
                    }))
                  }
                  placeholder="Paste image URL (e.g. https://...)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="header-name">Name</Label>
              <Input
                id="header-name"
                value={headerEditForm.name}
                onChange={(e) =>
                  setHeaderEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Store name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="header-description">Description</Label>
              <Input
                id="header-description"
                value={headerEditForm.description}
                onChange={(e) =>
                  setHeaderEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Short description"
              />
            </div>
            
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHeaderEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const payload = {
                  display_name: headerEditForm.name,
                  bio: headerEditForm.description,
                  avatar_url: headerEditForm.imageUrl?.trim() || undefined,
                };
                if (token && profileId) {
                  const result = await updateProfile(token, profileId, {
                    profile: payload,
                  });
                  if (result.success) {
                    setStoreHeader({
                      name: payload.display_name,
                      description: payload.bio,
                      imageUrl: payload.avatar_url,
                    });
                    setHeaderEditOpen(false);
                    void refetchMeLinkPage();
                  }
                } else {
                  setStoreHeader({
                    name: payload.display_name,
                    description: payload.bio,
                    imageUrl: payload.avatar_url,
                  });
                  setHeaderEditOpen(false);
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
