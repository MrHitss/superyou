"use client";

import { useState } from "react";
import {
  RiFileTextLine,
  RiSearchLine,
  RiArrowRightUpLine,
  RiShareLine,
  RiMore2Fill,
  RiAddLine,
  RiSettings4Line,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import OrbitPageLayout, { StatCard } from "@/app/components/layouts/OrbitPageLayout";

// ─── Types ─────────────────────────────────────────────
type Tab = "published" | "draft";

// ─── Sub-components ─────────────────────────────────────

function LeadMagnetBanner() {
  return (
    <>
      10 responses left to receive on free plan.{" "}
      <a className="underline underline-offset-2 font-semibold hover:text-violet-300 cursor-pointer">
        Upgrade for unlimited lead responses.
      </a>
      <button className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs font-bold transition-colors">
        Get more responses
      </button>
    </>
  );
}

function TemplateCodeBox() {
  return (
    <div className="bg-[#fff5f8] dark:bg-[#2d1e25] rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Have a lead magnet template code?</p>
        <span className="text-gray-400 cursor-help">ⓘ</span>
      </div>
      
      <div className="flex items-center gap-2">
        <input 
          placeholder="Enter template code" 
          className="px-4 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e2d] focus:outline-none"
        />
        <button className="bg-white dark:bg-[#1e1e2d] px-6 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Search
        </button>
      </div>
    </div>
  );
}

const TABS: { key: Tab; label: string; count: number }[] = [
  { key: "published", label: "Published", count: 3 },
  { key: "draft", label: "Draft", count: 1 },
];

function TabsBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${active === tab.key
              ? "bg-gray-900 dark:bg-white text-white dark:text-black"
              : "bg-white dark:bg-[#1e1e2d] border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>
    </div>
  );
}

function SearchAndFilters() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <RiSearchLine
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1e1e2d] text-gray-900 dark:text-white focus:outline-none"
        />
      </div>
      
      <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1e1e2d] text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
        <RiShareLine size={16} />
        Export
      </button>
      
      <div className="flex border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-[#1e1e2d]">
        <button className="p-2 border-r border-gray-100 dark:border-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
           {/* Grid layout icon placeholder */}
           <div className="w-4 h-4 border-2 border-current opacity-50" />
        </button>
        <button className="p-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800">
           {/* List layout icon placeholder */}
           <div className="w-4 h-4 border-2 border-current" />
        </button>
      </div>
    </div>
  );
}

function LeadMagnetTableHeader() {
  return (
    <div className="grid grid-cols-[1fr_120px_100px_150px_150px_40px] gap-4 px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
      <span>Form Name</span>
      <span>Status</span>
      <span>Responses</span>
      <span>Template Usage</span>
      <span>Actions</span>
      <span></span>
    </div>
  );
}

interface LeadMagnetRowProps {
  name: string;
  status: "Enabled" | "Disabled";
  responses: number;
  templateUsage: number;
  image: string;
}

function LeadMagnetRow({ name, status, responses, templateUsage, image }: LeadMagnetRowProps) {
  return (
    <div className="grid grid-cols-[1fr_120px_100px_150px_150px_40px] gap-4 px-4 py-4 items-center border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</span>
      </div>
      
      <div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
          status === "Enabled" 
            ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 border border-green-100 dark:border-green-900/30" 
            : "bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-100 dark:border-gray-700"
        }`}>
          {status}
        </span>
      </div>
      
      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
        <RiFileTextLine size={14} className="opacity-50" />
        <span className="text-sm font-medium">{responses}</span>
        <RiArrowRightUpLine size={12} className="opacity-40" />
      </div>
      
      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
        <div className="w-4 h-4 rounded-full border border-current opacity-40 flex items-center justify-center">
            <div className="w-2 h-0.5 bg-current" />
        </div>
        <span className="text-sm font-medium">{templateUsage}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          <RiAddLine size={14} />
          Add Automation
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
          <RiShareLine size={14} />
          Share
        </button>
      </div>
      
      <button className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white">
        <RiMore2Fill size={18} />
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────

export default function LeadMagnetPage() {
  const [activeTab, setActiveTab] = useState<Tab>("published");
  const router = useRouter();

  const mockData = [
    {
      name: "Get the 30 day Deep-dive E-Book",
      status: "Enabled" as const,
      responses: 0,
      templateUsage: 0,
      image: "https://via.placeholder.com/40x40"
    }
  ];

  return (
    <OrbitPageLayout
      title="Lead Magnet"
      count={4}
      createButtonLabel="New Lead Magnet"
      onCreateClick={() => router.push("/orbit/lead-magnet/create")}
      topBannerContent={<LeadMagnetBanner />}
      statsContent={
        <>
          <StatCard label="TOTAL RESPONSES" value="0" />
          <StatCard label="RESPONSES IN LAST 7 DAYS" value="0" />
          <StatCard label="CONVERSION RATE FOR LAST 7 DAYS" value="0" />
        </>
      }
      extraContent={<TemplateCodeBox />}
      tabsContent={<TabsBar active={activeTab} onChange={setActiveTab} />}
      filtersContent={<SearchAndFilters />}
    >
      <LeadMagnetTableHeader />
      
      {mockData.map((item, idx) => (
        <LeadMagnetRow key={idx} {...item} />
      ))}
      
      {mockData.length === 0 && (
        <div className="py-16 flex flex-col items-center justify-center text-gray-400">
          <RiFileTextLine size={40} className="mb-3 opacity-50" />
          <p>No lead magnets found</p>
        </div>
      )}
    </OrbitPageLayout>
  );
}