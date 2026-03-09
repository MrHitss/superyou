'use client';

import { Navbar } from '@/partials/navbar/navbar';
import { NavbarMenu } from '@/partials/navbar/navbar-menu';
import { useSettings } from '@/providers/settings-provider';
import { Container } from '@/components/common/container';
import { SUPERYOU_STORE_TABS } from '@/features/superyou/layout/config';
import type { MenuConfig } from '@/config/types';

/** Navbar menu from SUPERYOU_STORE_TABS (Store, Appearance, Analytics, Settings). */
const storeTabsMenuConfig: MenuConfig = SUPERYOU_STORE_TABS.map((tab) => ({
  title: tab.label,
  path: `/orbit/you${tab.id === 'store' ? '' : `?tab=${tab.id}`}`,
}));

const PageNavbar = () => {
  const { settings } = useSettings();

  if (settings?.layout === 'demo1') {
    return (
      <Navbar>
        <Container>
          <NavbarMenu items={storeTabsMenuConfig} />
        </Container>
      </Navbar>
    );
  } else {
    return <></>;
  }
};

export { PageNavbar };
