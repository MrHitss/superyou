"use client";

import { useState, useEffect, ReactNode } from "react";
import {
  RiPlayCircleLine,
  RiBookOpenLine,
  RiAddLine,
  RiInformationLine,
} from "@remixicon/react";

// ─── StatCard Component ─────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 px-6 py-5 flex-1">
      <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-3">
        {label}
        <RiInformationLine size={13} />
      </div>

      <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

// ─── OrbitPageLayout Component ───────────────────────────────

interface OrbitPageLayoutProps {
  title: string;
  count?: number;
  createButtonLabel: string;
  onCreateClick: () => void;
  demoUrl?: string;
  resourcesUrl?: string;
  topBannerContent?: ReactNode;
  statsContent: ReactNode;
  extraContent?: ReactNode;
  tabsContent: ReactNode;
  filtersContent?: ReactNode;
  children: ReactNode;
  isScrolledOffset?: number;
}

export default function OrbitPageLayout({
  title,
  count,
  createButtonLabel,
  onCreateClick,
  demoUrl = "#",
  resourcesUrl = "#",
  topBannerContent,
  statsContent,
  extraContent,
  tabsContent,
  filtersContent,
  children,
  isScrolledOffset = 40,
}: OrbitPageLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > isScrolledOffset);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isScrolledOffset]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#151521]">
      {topBannerContent && (
        <div className="w-full bg-[#1e1e2d] text-center py-2.5 px-4 text-sm font-medium text-white">
          {topBannerContent}
        </div>
      )}

      {/* Sticky Header */}
      <div
        className={`fixed top-0 right-0 z-10 flex items-center justify-between px-6 py-4 transition-all duration-300 border-b shadow-sm backdrop-blur-md bg-white/90 dark:bg-[#1e1e2d]/90 border-gray-200 dark:border-gray-800 lg:left-[var(--sidebar-width)] left-0 ${isScrolled ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
      >
        <div className="text-gray-900 dark:text-white font-semibold text-lg">
          {title} {count !== undefined && <span className="text-gray-400 ml-1">{count}</span>}
        </div>

        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 text-gray-600 dark:text-white/90 text-sm cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
            <RiPlayCircleLine size={16} />
            View Demo
          </button>

          <button className="flex items-center gap-2 text-gray-600 dark:text-white/90 text-sm cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">
            <RiBookOpenLine size={16} />
            Resources
          </button>

          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <RiAddLine size={16} />
            {createButtonLabel}
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: 220 }}>
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg,#6a11cb 0%,#2575fc 30%,#a855f7 55%,#7c3aed 70%,#4f46e5 85%,#2563eb 100%)",
          }}
        />

        {/* Mesh */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 80%, #c026d3 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 20%, #3b82f6 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 50% 50%, #7c3aed 0%, transparent 70%)",
          }}
        />

        {/* Hero Content */}
        <div
          className={`relative z-10 flex flex-col items-center justify-center py-14 px-4 transition-all duration-300 ${isScrolled ? "translate-y-20 opacity-0" : "translate-y-0 opacity-100"
            }`}
        >
          {!isScrolled && (
            <button
              onClick={onCreateClick}
              className="absolute right-6 top-6 flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full shadow-md hover:bg-gray-800 transition-colors"
            >
              <RiAddLine size={16} />
              {createButtonLabel}
            </button>
          )}

          <h1 className="text-4xl font-extrabold text-white">
            {title} {count !== undefined && <span className="opacity-60 ml-2">{count}</span>}
          </h1>

          <div className="flex items-center gap-6 mt-4">
            <button className="flex items-center gap-2 text-white/90 text-sm cursor-pointer hover:text-white transition-colors">
              <RiPlayCircleLine size={16} />
              View Demo
            </button>

            <span className="text-white/40">|</span>

            <button className="flex items-center gap-2 text-white/90 text-sm cursor-pointer hover:text-white transition-colors">
              <RiBookOpenLine size={16} />
              Resources
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-6 py-6 max-w-[1400px] w-full mx-auto space-y-5">
        {/* Stats Cards Row (Negative Margins to overlap hero) */}
        <div className="flex gap-4 -mt-10 relative ">
          {statsContent}
        </div>

        {/* Extra Content (e.g., CourseAssessmentsCard or Template Code box) */}
        {extraContent}

        {/* Tabs Row */}
        {tabsContent}

        {/* Filters and Search */}
        {filtersContent}

        {/* Table/List Area */}
        <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
