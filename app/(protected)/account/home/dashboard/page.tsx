'use client';

import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { AccountDashboardContent } from './content';

export default function AccountDashboardPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Build and manage your store — everything you need to start selling.
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">Settings</Button>
            <Button>Create Store</Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <AccountDashboardContent />
      </Container>
    </Fragment>
  );
}

