'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SUPERYOU_STORE_TABS } from '../layout/config';

interface StoreTabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function StoreTabs({ value, onValueChange }: StoreTabsProps) {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto gap-6">
        {SUPERYOU_STORE_TABS.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
