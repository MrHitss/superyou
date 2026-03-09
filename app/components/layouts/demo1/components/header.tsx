'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { AppsDropdownMenu } from '@/partials/topbar/apps-dropdown-menu';
import { ChatSheet } from '@/partials/topbar/chat-sheet';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import {
  Bell,
  LayoutGrid,
  Menu,
  MessageCircleMore,
  Search,
  Share2,
  SquareChevronRight,
} from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Container } from '@/components/common/container';
import { StoreClientTopbar } from '@/app/(protected)/store-client/components/common/topbar';
import { Breadcrumb } from './breadcrumb';
import { HeaderStoreTabs } from './header-store-tabs';
import { MegaMenu } from './mega-menu';
import { MegaMenuMobile } from './mega-menu-mobile';
import { SidebarMenu } from './sidebar-menu';
import { PROFILE_LINK_PREFIX, getProfileLinkFromInput } from '@/app/(auth)/forms/register-schema';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

const PROFILE_BASE_URL = 'https://superyou.bio';

function OrbitProfileLinkBlock() {
  const { data: session, update: updateSession } = useSession();
  const profileLink = session?.user?.profile_link ?? null;
  const displayText = profileLink ? `${PROFILE_LINK_PREFIX}${profileLink}` : 'Set your handle';
  const fullUrl = profileLink ? `${PROFILE_BASE_URL}/${profileLink}` : null;

  const [isEditing, setIsEditing] = useState(false);
  const [handleInput, setHandleInput] = useState(profileLink ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditing) setHandleInput(profileLink ?? '');
  }, [isEditing, profileLink]);

  async function onSaveHandle() {
    const handle = getProfileLinkFromInput(handleInput).toLowerCase().replace(/\s+/g, '');
    if (!handle || handle.length < 2) {
      toast.error('Use at least 2 characters (letters, numbers, underscores, hyphens).');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(handle)) {
      toast.error('Only letters, numbers, underscores and hyphens allowed.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/user-management/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_link: handle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error((data as { message?: string }).message ?? 'Failed to update.');
        return;
      }
      await updateSession({ profile_link: handle });
      setIsEditing(false);
      toast.success('Profile link updated.');
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  function onCancelEdit() {
    setHandleInput(profileLink ?? '');
    setIsEditing(false);
  }

  async function onShare() {
    if (!fullUrl) {
      toast.error('Set your profile link first.');
      return;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'My SuperYou Bio',
          url: fullUrl,
          text: 'Check out my SuperYou Bio',
        });
        toast.success('Shared.');
      } else {
        await navigator.clipboard.writeText(fullUrl);
        toast.success('Link copied to clipboard.');
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        await navigator.clipboard?.writeText(fullUrl);
        toast.success('Link copied to clipboard.');
      }
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm">
        <span className="text-muted-foreground shrink-0">Your link:</span>
        {isEditing ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-muted-foreground shrink-0">{PROFILE_LINK_PREFIX}</span>
            <Input
              className="h-7 w-32 font-medium border-muted-foreground/30"
              placeholder="yourhandle"
              value={handleInput}
              onChange={(e) => setHandleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveHandle();
                if (e.key === 'Escape') onCancelEdit();
              }}
              autoFocus
            />
            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onCancelEdit} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" className="h-7 px-2" onClick={onSaveHandle} disabled={saving}>
              {saving ? '...' : 'Save'}
            </Button>
          </div>
        ) : (
          <>
            <span className="font-medium truncate">{displayText}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-1.5 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => setIsEditing(true)}
            >
              {profileLink ? 'Edit' : 'Add link'}
            </Button>
          </>
        )}
      </div>
      <Button size="sm" onClick={onShare} disabled={!fullUrl}>
        <Share2 className="size-4!" />
        Share
      </Button>
    </>
  );
}

export function Header() {
  const [isSidebarSheetOpen, setIsSidebarSheetOpen] = useState(false);
  const [isMegaMenuSheetOpen, setIsMegaMenuSheetOpen] = useState(false);

  const pathname = usePathname();
  const mobileMode = useIsMobile();

  const scrollPosition = useScrollPosition();
  const headerSticky: boolean = scrollPosition > 0;

  // Close sheet when route changes
  useEffect(() => {
    setIsSidebarSheetOpen(false);
    setIsMegaMenuSheetOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        'header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b border-transparent bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)]',
        headerSticky && 'border-b border-border',
      )}
    >
      <Container className="flex justify-between items-stretch lg:gap-4">
        {/* HeaderLogo */}
        <div className="flex gap-1 lg:hidden items-center gap-2.5">
          <Link href="/" className="shrink-0">
            <img
              src={toAbsoluteUrl('/media/logo/SuperYouBioIcon2.png')}
              className="h-[25px] w-full"
              alt="mini-logo"
            />
          </Link>
          <div className="flex items-center">
            {mobileMode && (
              <Sheet
                open={isSidebarSheetOpen}
                onOpenChange={setIsSidebarSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" mode="icon">
                    <Menu className="text-muted-foreground/70" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="p-0 gap-0 w-[275px]"
                  side="left"
                  close={false}
                >
                  <SheetHeader className="p-0 space-y-0" />
                  <SheetBody className="p-0 overflow-y-auto">
                    <SidebarMenu />
                  </SheetBody>
                </SheetContent>
              </Sheet>
            )}
            {mobileMode && (
              <Sheet
                open={isMegaMenuSheetOpen}
                onOpenChange={setIsMegaMenuSheetOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="ghost" mode="icon">
                    <SquareChevronRight className="text-muted-foreground/70" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  className="p-0 gap-0 w-[275px]"
                  side="left"
                  close={false}
                >
                  <SheetHeader className="p-0 space-y-0" />
                  <SheetBody className="p-0 overflow-y-auto">
                    <MegaMenuMobile />
                  </SheetBody>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>

        {/* Main Content: Store tabs on /orbit/you, else Breadcrumb or MegaMenu.
            Wrap in a flex-1 container so the right-side icons stay right-aligned
            even when the center content is small/hidden. */}
        <div className="flex-1 flex items-center">
          {pathname.startsWith('/orbit/you') ? (
            !mobileMode && <HeaderStoreTabs />
          ) : pathname.startsWith('/account') ? (
            <Breadcrumb />
          ) : (
            !mobileMode && <MegaMenu />
          )}
        </div>

        {/* HeaderTopbar */}
        <div className="flex items-center gap-3">
          {pathname.startsWith('/orbit/you') && !mobileMode && (
            <OrbitProfileLinkBlock />
          )}
          {pathname.startsWith('/store-client') ? (
            <StoreClientTopbar />
          ) : (
            <>
              {/* {!mobileMode && (
                <SearchDialog
                  trigger={
                    <Button
                      variant="ghost"
                      mode="icon"
                      shape="circle"
                      className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                    >
                      <Search className="size-4.5!" />
                    </Button>
                  }
                />
              )}
              <NotificationsSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <Bell className="size-4.5!" />
                  </Button>
                }
              />
              <ChatSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <MessageCircleMore className="size-4.5!" />
                  </Button>
                }
              />
              <AppsDropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="size-9 hover:bg-primary/10 hover:[&_svg]:text-primary"
                  >
                    <LayoutGrid className="size-4.5!" />
                  </Button>
                }
              /> */}
              <UserDropdownMenu
                trigger={
                  <img
                    className="size-9 rounded-full border-2 border-green-500 shrink-0 cursor-pointer"
                    src={toAbsoluteUrl('/media/avatars/300-2.png')}
                    alt="User Avatar"
                  />
                }
              />
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
