<div align="center">

# 📦 StockSense
### Real-Time Multi-Warehouse Inventory Management, Reimagined

**A live, multi-user inventory system with an audited operations ledger — built for teams who need to trust their stock numbers.**

[![Made with React](https://img.shields.io/badge/Frontend-React%2018-1687ff?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build-Vite-7b3cff?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-e82bd0?style=for-the-badge)](#license)

[**📖 Full Technical Documentation**](https://claude.ai/artifact/TEj1niNTXq1i8XV6ZjibMa) · [Features](#-key-features) · [Architecture](#-architecture) · [Quick Start](#-quick-start) · [Demo Script](#-demo-script-for-judges)

<img src="stocksense_qr.png" alt="Scan for live documentation" width="220"/>

<sub>📱 Scan to open the full documentation site</sub>

</div>

---

## 🧭 Overview

**StockSense** is a production-shaped inventory management system built for a hackathon in **48 hours**, but engineered like a real product: real authentication, row-level-secured data, a shared live workspace, and an append-only audit ledger for every unit that moves.

Instead of a spreadsheet everyone edits and nobody trusts, StockSense gives a team **one shared, real-time source of truth** — every receipt, delivery, transfer, and stock adjustment is validated, timestamped, attributed to a user, and permanently logged.

> 💡 **Why this matters:** most inventory demos fake the backend. StockSense doesn't — it runs on real Supabase Auth, real Postgres Row-Level Security, and real Realtime sync between concurrent users. Open two browser tabs, log in as two different users, validate a delivery in one — watch it update live in the other.

---

## ✨ Key Features

| | |
|---|---|
| 🔐 **Real Authentication** | Email/password sign-up, sign-in, and secure password recovery via Supabase Auth — no demo/fallback login |
| 🌐 **Live Shared Workspace** | Every authenticated teammate reads and writes the same inventory state, synced instantly through Supabase Realtime |
| 🧑‍💼 **Private User Profiles** | Per-user profile rows locked down with Postgres Row-Level Security — no user can read or edit another's profile |
| 📋 **Four Core Operations** | Receipts (inbound), Deliveries (outbound), Internal Transfers, and Adjustments — each with its own validation logic |
| 🧾 **Immutable Audit Ledger** | Every completed operation writes a permanent, timestamped, user-attributed entry — nothing is edited after the fact |
| 📊 **Live Dashboard** | KPIs, 14-day movement charts, category breakdowns, and low-stock alerts computed straight from the live ledger |
| 🏭 **Multi-Warehouse / Multi-Location** | Stock is tracked per product *per location*, with warehouses grouping locations |
| 🚫 **Stock-Safe Validation** | Deliveries and transfers are blocked at the source if there isn't enough physical stock — no negative inventory |

---

## 🏗️ Architecture

```
┌─────────────────────────────┐        ┌─────────────────────────────┐
│   Browser Client            │        │   Supabase Backend          │
│   React 18 + Vite + TS      │        │                              │
│                              │        │  Auth  →  email/password,   │
│  UI  →  Local Store (cache)  │◄──────►│           recovery flow     │
│      →  Cloud Store Adapter  │        │  Postgres →  profiles,      │
│                              │        │              app_states     │
│                              │        │  RLS   →  per-row policies  │
│                              │        │  Realtime → change events   │
└─────────────────────────────┘        └─────────────────────────────┘
```

- **No custom backend server.** Supabase *is* the backend — Auth, Postgres, RLS, and Realtime, called directly from the browser with the anon/publishable key.
- **Offline-friendly cache.** State is mirrored to `localStorage` per user, so the UI renders instantly before the network round-trip resolves.
- **Debounced, loop-safe sync.** Local changes push to the cloud after a 250ms debounce; incoming Realtime updates are flagged to avoid re-pushing what was just received.

📎 **Full diagrams** (entity relationships, auth sequence, per-operation flowcharts, RLS policy tables) are in the [complete technical documentation](https://claude.ai/artifact/TEj1niNTXq1i8XV6ZjibMa).

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Build tool | Vite |
| UI | React 18 + TypeScript |
| Backend-as-a-Service | Supabase (Auth · Postgres · Row-Level Security · Realtime) |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Hand-crafted CSS design system (dark, gradient-accented) |

---

## 📂 Project Structure

```
StockSense/
├── supabase/
│   └── schema.sql          # Tables, RLS policies, triggers, realtime publication
├── src/
│   ├── App.tsx              # Auth gate, routing, cloud-sync effects
│   ├── lib/
│   │   ├── types.ts          # Domain model (Product, Inventory, Ledger, …)
│   │   ├── store.ts          # Seed data + localStorage persistence
│   │   ├── cloudStore.ts     # Supabase reads / writes / realtime subscription
│   │   └── supabase.ts       # Supabase client + env validation
│   ├── components/           # Sidebar, Topbar, Table, Modal, Toast, KpiCard…
│   └── pages/
│       ├── Auth.tsx           # Login / Sign up / Password recovery
│       ├── Dashboard.tsx       # KPIs, charts, live activity feed
│       └── Pages.tsx           # Products, Stock, Receipts, Deliveries,
│                               # Transfers, Adjustments, History, Warehouses,
│                               # Locations, Profile
├── SUPABASE_SETUP.md
└── DEPLOYMENT_FIX.md
```

---

## 🚀 Quick Start

### 1. Clone & install
```bash
git clone <this-repo-url>
cd StockSense
npm install
```

### 2. Provision Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the full contents of `supabase/schema.sql` → run once.
3. Under **Authentication → URL Configuration**, add `http://localhost:5173` (and your deployed domain later).

### 3. Configure environment
Create a `.env` file beside `package.json`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```
> ⚠️ Never use the `service_role` secret key here — only the anon/publishable key belongs in a frontend build.

### 4. Run it
```bash
npm run dev
```
Open `http://localhost:5173`, create an account, and start managing stock.

### 5. Deploy (Vercel / Netlify)
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on the hosting project, then deploy. Vite bakes these in at **build** time, so a redeploy is required after changing them.

---

## 🎬 Demo Script (for judges)

1. **Sign up** with a real email → land straight on the live Dashboard.
2. Open the app in a **second browser tab**, sign in as a second account.
3. In Tab 1, create a **Receipt** for an existing product and hit **Validate** → stock increases.
4. Watch Tab 2's **Stock** page update **live**, with no refresh — powered by Supabase Realtime.
5. Try a **Delivery** for more units than are on hand → the app blocks it with an *Insufficient stock* guard.
6. Open **Move History** → see every action logged with who did it and when, permanently.
7. Open **Profile** in each tab → show that each user's private profile is isolated by Postgres Row-Level Security.

---

## 🔒 Security Model

- ✅ Real Supabase Auth — no demo/local bypass, ever.
- ✅ Profiles fully isolated per user via RLS (`auth.uid() = id`).
- ✅ Only the anon/publishable key ships to the browser — the secret key never leaves the server.
- ✅ Deliveries & transfers validate stock levels before committing — no negative inventory.
- ⚠️ The shared inventory workspace is intentionally **team-trusted**: any authenticated user can read/write it (this is a single-team workspace, not a multi-tenant system — see the [full documentation](https://claude.ai/artifact/TEj1niNTXq1i8XV6ZjibMa) for the roadmap on adding role-based scoping).

---

## 🗺️ Roadmap

- [ ] Role-based permissions (Manager vs. Viewer)
- [ ] Multi-workspace / multi-tenant support
- [ ] Server-side validation layer independent of the client
- [ ] CSV import/export for bulk product catalogues
- [ ] Barcode / SKU scanning on mobile

---

## 📖 Full Documentation

The complete technical documentation — system architecture, entity-relationship diagram, authentication sequence, per-operation flowcharts (Receipts / Deliveries / Transfers / Adjustments), database schema & RLS policy tables, and the deployment guide — is published here:

### 👉 **[stocksense-docs — live site](https://claude.ai/artifact/TEj1niNTXq1i8XV6ZjibMa)**

<div align="center">
<img src="stocksense_qr.png" alt="QR code to StockSense documentation" width="200"/>
</div>

---

## 📄 License

License Notice: StockSense is provided by C L Vinaya and Amrutha Varshni G R for educational, academic, demonstration, portfolio, and viewing purposes only. Redistribution, commercial use, or publication of modified versions is not permitted without prior written permission. See the LICENSE file for complete terms.

<div align="center">
<sub>Built with React, Vite, TypeScript, and Supabase.</sub>
</div>
