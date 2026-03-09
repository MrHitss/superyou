'use client';

import { Bestsellers } from '@/app/(protected)/store-admin/dashboard/components/bestsellers';
import { Inventory } from '@/app/(protected)/store-admin/dashboard/components/inventory';
import { InventorySummary } from '@/app/(protected)/store-admin/dashboard/components/inventory-summary';
import { Orders } from '@/app/(protected)/store-admin/dashboard/components/orders';
import { RecentOrders } from '@/app/(protected)/store-admin/dashboard/components/recent-orders';
import { SalesActivity } from '@/app/(protected)/store-admin/dashboard/components/sales-activity';

export function DashboardContent() {
  const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID';

  return (
    <div
      className="flex flex-col gap-6 lg:gap-8 py-8"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 72px), repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 72px)",
      }}
    >
      {/* Top badges + greeting */}
      <div className="mx-auto w-full max-w-5xl flex flex-col items-center gap-3 px-4">
        <div className="flex items-center gap-3">
          <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">You're on Free Plan</span>
          <a className="text-xs text-primary underline" href="#">Unlock unlimited access to all features and get paid. Upgrade now</a>
        </div>
        <h1 className="font-bold text-center" style={{ fontSize: 32 }}>Hello, Hitesh Varyani!</h1>
      </div>

      {/* Top promo / CTA (wide centered card) */}
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="mx-auto flex flex-col md:flex-row items-center gap-6 rounded-2xl p-5 bg-white border shadow-sm">
          <div className="flex-shrink-0 w-full md:w-64 h-36 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {/* Larger thumbnail with rounded play overlay */}
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-[url('/assets/Screenshot_2026-02-17_at_4.15.52_AM-6a8c903a-fe32-4e31-83e9-95c0d51c1027.png')] bg-cover bg-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-black bg-opacity-75 flex items-center justify-center text-white text-lg shadow-lg">
                  ▶
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl md:text-2xl font-semibold">Grow your Instagram</h3>
            <p className="text-sm text-muted-foreground mt-2">Here's how our creators grew to 100k followers in just one week, explained in a quick two-minute video.</p>
          </div>
          <div className="flex-shrink-0">
            <button className="px-6 py-3 rounded-full bg-gradient-to-r from-[#ff6a88] to-[#5f2c82] text-white text-sm shadow">Connect your IG</button>
          </div>
        </div>
      </div>

      {/* Gold learn banner */}
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="rounded-2xl p-5 bg-gradient-to-r from-amber-700 to-amber-500 text-white flex items-center justify-between shadow-sm shadow-inner">
          <div className="text-sm font-semibold">Learn how to grow and sell with SuperProfile</div>
          <button className="px-5 py-2 rounded-full bg-white text-amber-700 font-medium shadow">Go to Learn</button>
        </div>
      </div>

      {/* Alert */}
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="rounded-2xl p-4 bg-yellow-50 border border-yellow-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold">!</div>
            <div>
              <div className="text-sm font-medium">Uh oh...you have unpublished products!</div>
              <div className="text-xs text-muted-foreground">Upgrade now to publish these and start earning.</div>
            </div>
          </div>
          <div>
            <button className="px-5 py-2 rounded-full bg-black text-white font-medium">Start Earning</button>
          </div>
        </div>
      </div>

      {/* Roadmap card */}
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="rounded-2xl bg-white border p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Roadmap to making ₹₹₹</h3>
            <div className="text-sm text-muted-foreground">2/3 completed</div>
          </div>
          <div className="mt-4">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '66%' }} />
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-1 flex flex-col items-center">
                <div className="h-3 w-3 rounded-full border bg-white" />
                <div className="w-px bg-gray-200 flex-1 mt-2" />
              </div>
              <div className="col-span-11 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Setup automation on AutoDM</div>
                    <div className="text-xs text-muted-foreground">Turn your IG engagement to potential leads with 100% automations.</div>
                  </div>
                  <div>
                    <button className="rounded-full border px-3 py-1 text-sm">Connect IG</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-1 flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center text-white">✓</div>
                <div className="w-px bg-gray-200 flex-1 mt-2" />
              </div>
              <div className="col-span-11 p-3 rounded-lg border bg-green-50">
                <div className="text-sm font-medium">Launch your Store</div>
                <div className="text-xs text-muted-foreground">Make sure your social bio has it all - the only link-in-bio store you'll need</div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-1 flex flex-col items-center">
                <div className="h-4 w-4 rounded-full bg-green-600 flex items-center justify-center text-white">✓</div>
              </div>
              <div className="col-span-11 p-3 rounded-lg border bg-green-50">
                <div className="text-sm font-medium">Create a product</div>
                <div className="text-xs text-muted-foreground">Launch Digital Products, Webinars, Courses, 1:1 coaching, and more.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore more apps */}
      <div>
        <h4 className="text-base font-semibold mb-4">Explore more apps</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium">Create SuperLinks</div>
            <p className="text-xs text-muted-foreground mt-1">Create Short Links or deep links which open-in-app - best Bitly alternative.</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium">Sell Digital Products</div>
            <p className="text-xs text-muted-foreground mt-1">Sell videos, photos, documents, and more in seconds.</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-sm font-medium">Launch your course</div>
            <p className="text-xs text-muted-foreground mt-1">Create and sell full-length courses - with lots of customization.</p>
          </div>
        </div>
      </div>

      {/* Bug report */}
      <div>
        <div className="rounded-lg border p-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Bug Report or Feature Request</div>
            <div className="text-xs text-muted-foreground mt-1">Let us know what can make your SuperProfile experience even better.</div>
          </div>
          <div>
            <a
              href={GOOGLE_SHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 rounded-full border bg-white hover:bg-gray-50"
            >
              Report
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
