"use client";

import { useState } from "react";
import {
  RiBookOpenLine,
  RiFileTextLine,
  RiSearchLine,
} from "@remixicon/react";
import { useRouter } from "next/navigation";
import OrbitPageLayout, { StatCard } from "@/app/components/layouts/OrbitPageLayout";

// ─── Types ─────────────────────────────────────────────
type Tab = "published" | "unpublished" | "draft";

// ─── Sub-components ─────────────────────────────────────

function TopBanner() {
  return (
    <>
      You have unpublished products.{" "}
      <a className="underline underline-offset-2 font-semibold hover:text-violet-300 cursor-pointer">
        Upgrade Now
      </a>{" "}
      to publish and start earning!
    </>
  );
}

function CourseAssessmentsCard() {
  return (
    <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm px-5 py-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
        <RiFileTextLine size={20} className="text-violet-600 dark:text-violet-400" />
      </div>

      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">Course Assessments</p>
        <p className="text-xs text-gray-500">
          You can access and manage all your quizzes and assignments here.
        </p>
      </div>

      <button className="px-5 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
        View
      </button>
    </div>
  );
}

const TABS: { key: Tab; label: string; count: number }[] = [
  { key: "published", label: "Published", count: 0 },
  { key: "unpublished", label: "Unpublished", count: 2 },
  { key: "draft", label: "Draft", count: 0 },
];

function TabsBar({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
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
  );
}

function SearchAndFilters() {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative flex-1 min-w-[200px]">
        <RiSearchLine
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-[#1e1e2d] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
      </div>
    </div>
  );
}

function CoursesTableHeader() {
  return (
    <div className="grid grid-cols-[1fr_120px_100px_120px_130px] gap-4 px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase border-b border-gray-100 dark:border-gray-800">
      <span>Courses 2</span>
      <span>Price</span>
      <span>Sale</span>
      <span>Revenue</span>
      <span>Payments</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────

export default function CoursesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("unpublished");
  const router = useRouter();

  return (
    <OrbitPageLayout
      title="Courses"
      createButtonLabel="Create Course"
      onCreateClick={() => router.push("/orbit/courses/create")}
      topBannerContent={<TopBanner />}
      statsContent={
        <>
          <StatCard label="Total Sale" value="0" />
          <StatCard label="Total Revenue" value="₹0" />
          <StatCard label="Conversion Rate" value="0" />
        </>
      }
      extraContent={<CourseAssessmentsCard />}
      tabsContent={<TabsBar active={activeTab} onChange={setActiveTab} />}
      filtersContent={<SearchAndFilters />}
    >
      <CoursesTableHeader />

      <div className="py-16 flex flex-col items-center justify-center text-gray-400">
        <RiBookOpenLine size={40} className="mb-3 opacity-50" />
        <p>No courses found</p>
      </div>
    </OrbitPageLayout>
  );
}