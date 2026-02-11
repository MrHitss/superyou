# SuperYou bio platform

This folder contains **only** SuperYou bio platform code, kept separate from the existing theme/demo code.

## Structure

- **layout/** – Nav config (store tabs, etc.). Sidebar menu comes from theme: `config/menu.config.tsx` → `MENU_SIDEBAR`.
- **store/** – Store tab UI (content editor, store tabs)
- **content-blocks/** – Types and logic for profile blocks (headers, carousels, links, etc.)
- **payments/** – Payments (placeholder)
- **audience/** – Audience/leads (placeholder)
- **learn/** – Learn (placeholder)
- **refer-earn/** – Refer & Earn (placeholder)
- **apps/** – YOUR APPS: AutoDM, SuperLinks, Lead Magnet (placeholder)
- **create-sell/** – Quick adds & Create and sell (placeholder)

## Routes (no prefix; platform is SuperYou only)

- `/` → redirects to `/you`
- `/you` – Store editor (tabs: Store, Appearance, Analytics, Settings)
- `/payments`, `/learn`, `/audience`, `/refer-earn` – placeholder pages

## UI components

Shared SuperYou UI lives in **`components/superyou/`**:

- `PreviewPane` – Right-side mobile-style profile preview
- `QuickAddsModal` – Quick adds + Create and sell options
- `ContentBlockRow` – Draggable content block row with 3-dot menu (edit, delete, copy, schedule, etc.)

## Theme vs SuperYou

- **Menu and navbar:** Sidebar menu and top navbar use **theme components only** (Demo1Layout’s Sidebar and Header). Styling follows the theme, not reference images.
- **Protected layout** (`app/(protected)/layout.tsx`): All routes, including SuperYou, use `Demo1Layout` so the theme sidebar and theme navbar are always shown.
- SuperYou-specific code lives under `features/superyou/`, `components/superyou/`, and app routes under `app/(protected)/orbit/`. The theme sidebar links use the `/orbit` prefix; no custom sidebar component.
