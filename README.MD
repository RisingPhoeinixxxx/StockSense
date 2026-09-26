<div align="center">

# 📦 StockSense

### Real-Time, Multi-Warehouse Inventory Management — Built to Be Trusted, Not Just Demoed

*A shared, live inventory workspace with real authentication, row-level-secured data, and an immutable audit ledger for every unit that moves.*

[![Frontend](https://img.shields.io/badge/Frontend-React%2018-1687ff?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Build](https://img.shields.io/badge/Build-Vite-7b3cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Backend](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Language](https://img.shields.io/badge/Language-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Realtime](https://img.shields.io/badge/Sync-Realtime-e82bd0?style=for-the-badge)](#-architecture)
[![License](https://img.shields.io/badge/License-MIT-333333?style=for-the-badge)](#-license)

**[📖 Full Technical Documentation](https://claude.ai/artifact/TEj1niNTXq1i8XV6ZjibMa)** &nbsp;·&nbsp; **[Live Demo Script](#-demo-script-for-judges)** &nbsp;·&nbsp; **[Quick Start](#-quick-start)**

</div>

<br/>

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Data Model](#-data-model)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Demo Script for Judges](#-demo-script-for-judges)
- [Security Model](#-security-model)
- [Why These Technical Choices](#-why-these-technical-choices)
- [Roadmap](#-roadmap)
- [Full Documentation](#-full-documentation)
- [License](#-license)

<br/>

## 🎯 The Problem

Most small and mid-size operations still track stock in a shared spreadsheet: no audit trail, no concurrency control, no real permissions, and no way to know *who* changed a number or *when* it actually happened. Errors compound silently until a physical count exposes them — usually too late.

## 💡 The Solution

**StockSense** replaces the spreadsheet with a single, live, multi-user inventory workspace where **every stock movement is a formal, validated operation** — a Receipt, a Delivery, an Internal Transfer, or an Adjustment — and every completed operation writes a permanent, timestamped, user-attributed entry to an append-only ledger.

It is built like a real product, not a hackathon mockup:

- 🔐 **Real authentication** — Supabase Auth, no demo login, no fallback bypass
- 🌍 **One shared source of truth** — every teammate sees the same live state, synced in real time
- 🔒 **Enforced at the database layer** — Postgres Row-Level Security, not just client-side checks
- 🧾 **Provably auditable** — the ledger is append-only; nothing gets silently edited after the fact

<br/>

## ✨ Key Features

| Capability | What it does |
|---|---|
| 🔐 **Real Authentication** | Email/password sign-up, sign-in, and secure password recovery via Supabase Auth |
| 🌐 **Live Shared Workspace** | Every authenticated teammate reads and writes the same inventory state, synced instantly via Supabase Realtime |
| 🧑‍💼 **Private, RLS-Protected Profiles** | Per-user profile rows locked down at the database layer — no user can read or edit another's profile |
| 📋 **Four Core Operations** | Receipts (inbound), Deliveries (outbound), Internal Transfers, and Adjustments — each with dedicated validation logic |
| 🧾 **Immutable Audit Ledger** | Every completed operation writes a permanent, timestamped, user-attributed entry |
| 📊 **Live Operational Dashboard** | KPIs, 14-day movement charts, category breakdowns, and low-stock alerts computed from the live ledger |
| 🏭 **Multi-Warehouse / Multi-Location** | Stock is tracked per product *per location*, with warehouses grouping locations |
| 🚫 **Stock-Safe Validation** | Deliveries and transfers are blocked at the source when physical stock is insufficient — inventory can never go negative |

<br/>

## 🏗️ Architecture

```
┌────────────────────────────────┐          ┌──────────────────────────────────┐
│  Browser Client                │          │  Supabase Backend                 │
│  React 18 · Vite · TypeScript  │          │                                    │
│                                 │          │  Auth       → email/password,     │
│  UI Layer                      │◄────────►│               password recovery   │
│    ↳ Local Store (cache)       │          │  Postgres   → profiles,           │
│    ↳ Cloud Store Adapter       │          │               app_states          │
│                                 │          │  Row-Level  → per-row ownership   │
│                                 │          │  Security     policies            │
│                                 │          │  Realtime   → live change events  │
└────────────────────────────────┘          └──────────────────────────────────┘
```

**Design principles:**

- **No custom backend server.** Supabase *is* the backend — Auth, Postgres, RLS, and Realtime are called directly from the browser via the anonymous/publishable key. Authorization is enforced entirely by Postgres policies, not application code.
- **Instant, offline-friendly UI.** State is mirrored to `localStorage` per user, so the app renders immediately on load, before the network round-trip to Supabase resolves.
- **Loop-safe realtime sync.** Local changes are debounced (250ms) and pushed to the shared workspace row; incoming Realtime updates are flagged so they don't get re-pushed, avoiding feedback loops between concurrent clients.

> 📎 Full diagrams — entity relationships, the authentication sequence, per-operation flowcharts for each of the four inventory operations, and the complete RLS policy table — live in the **[full technical documentation](https://claude.ai/artifact/TEj1niNTXq1i8XV6ZjibMa)**.

<br/>

## 🧱 Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Build tool | **Vite** | Instant HMR, fast production builds, native env-var handling |
| UI | **React 18 + TypeScript** | Type-safe component model for a data-heavy domain |
| Backend-as-a-Service | **Supabase** (Postgres · Auth · RLS · Realtime) | Production-grade auth and a real relational database, without hand-rolling a backend in a 48-hour window |
| Charts | **Recharts** | Lightweight, composable charts for the dashboard |
| Icons | **Lucide React** | Consistent, tree-shakeable icon set |
| Styling | **Hand-written CSS design system** | Full control over a distinctive dark, gradient-accented UI |

<br/>

## 🗃️ Data Model

The entire application state is one aggregate object, persisted both locally and to the shared Supabase workspace:

```
AppState
├── products      — catalogue: name, SKU, category, UOM, reorder level
├── warehouses     — physical facilities
├── locations      — storage locations, each belonging to one warehouse
├── inventory      — on-hand quantity per (product, location) pair
├── receipts       — inbound stock documents
├── deliveries     — outbound stock documents
├── transfers      — location-to-location stock movements
├── adjustments     — physical-count reconciliations
└── ledger          — append-only log of every completed operation
```

Every one of the four operations follows the same shape: **create → validate → commit**. On commit, the operation function mutates inventory quantities, writes one or more ledger entries, and flips the document's status to `Done` — atomically, from the client's perspective, and permanently.

<br/>

## 📂 Project Structure

```
StockSense/
├── supabase/
│   └── schema.sql            # Tables, RLS policies, triggers, realtime publication
├── src/
│   ├── App.tsx                 # Auth gate, routing, cloud-sync effects
│   ├── lib/
│   │   ├── types.ts              # Domain model (Product, Inventory, Ledger, …)
│   │   ├── store.ts              # Seed data + localStorage persistence
│   │   ├── cloudStore.ts         # Supabase reads / writes / realtime subscription
│   │   └── supabase.ts           # Supabase client + environment validation
│   ├── components/                # Sidebar, Topbar, Table, Modal, Toast, KpiCard…
│   └── pages/
│       ├── Auth.tsx                # Login / Sign up / Password recovery
│       ├── Dashboard.tsx            # KPIs, charts, live activity feed
│       └── Pages.tsx                 # Products, Stock, Receipts, Deliveries,
│                                     # Transfers, Adjustments, History,
│                                     # Warehouses, Locations, Profile
├── SUPABASE_SETUP.md
└── DEPLOYMENT_FIX.md
```

<br/>

## 🚀 Quick Start

### 1 · Clone & install
```bash
git clone <this-repo-url>
cd StockSense
npm install
```

### 2 · Provision Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste the full contents of `supabase/schema.sql` → run once.
3. Under **Authentication → URL Configuration**, add `http://localhost:5173` (and your production domain once deployed).

### 3 · Configure environment
Create a `.env` file beside `package.json`:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```
> ⚠️ Never place the `service_role` secret key here — only the anon/publishable key belongs in a frontend build.

### 4 · Run
```bash
npm run dev
```
Open `http://localhost:5173`, create an account, and start managing stock.

### 5 · Deploy (Vercel / Netlify)
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables on the hosting project, then deploy. Vite bakes these in at **build** time, so changing them requires a fresh build.

<br/>

## 🎬 Demo Script (for Judges)

1. **Sign up** with a real email → land directly on the live Dashboard.
2. Open the app in a **second browser tab** and sign in as a second account.
3. In Tab 1, create a **Receipt** for an existing product and click **Validate** → stock increases immediately.
4. Watch Tab 2's **Stock** page update **live, with no refresh** — powered by Supabase Realtime.
5. Attempt a **Delivery** for more units than are on hand → the app blocks it with an *insufficient stock* guard, before any state is mutated.
6. Open **Move History** → every action is logged with who performed it and exactly when, permanently.
7. Open **Profile** in each tab → demonstrate that each user's private profile is isolated by Postgres Row-Level Security — one account can never read or edit the other's.

<br/>

## 🔒 Security Model

| Enforced today | Worth flagging |
|---|---|
| ✅ Real Supabase Auth — no demo or local bypass, ever | ⚠️ The shared inventory workspace is intentionally team-trusted: any authenticated user can read/write it |
| ✅ Profiles fully isolated per user via RLS (`auth.uid() = id`) | ⚠️ No server-side business-rule layer independent of the client yet |
| ✅ Only the anon/publishable key ships to the browser | ⚠️ No per-role permission gating (the `role` field is descriptive, not enforced) |
| ✅ Deliveries & transfers validate stock before committing — never negative | ⚠️ Last-write-wins conflict resolution on the shared state row |

This is a deliberate design boundary for a single-team workspace, not an oversight — see the [full documentation](https://claude.ai/artifact/TEj1niNTXq1i8XV6ZjibMa) for the roadmap toward role-based scoping and multi-tenancy.

<br/>

## 🤔 Why These Technical Choices

- **Supabase over a custom backend:** a 48-hour build window doesn't leave room to hand-roll authentication, session handling, and a database API — and to do it *safely*. Supabase gave us production-grade Auth and Postgres RLS on day one, so the team's time went into inventory logic, not plumbing.
- **RLS over application-level auth checks:** authorization enforced in the database can't be bypassed by a bug in the frontend. If the client is compromised, the database still says no.
- **One shared workspace row over per-user state:** the actual problem StockSense solves is a *team* losing trust in a *shared* number — so the architecture treats "shared" as the default, not an afterthought bolted on later.
- **Realtime over polling:** stock visibility that lags by even a few seconds recreates the exact trust problem this project exists to solve.

<br/>

## 🗺️ Roadmap

- [ ] Role-based permissions (Manager vs. Viewer)
- [ ] Multi-workspace / multi-tenant support
- [ ] Server-side validation layer independent of the client
- [ ] CSV import/export for bulk product catalogues
- [ ] Barcode / SKU scanning on mobile

<br/>

## 📖 Full Documentation

The complete technical documentation — system architecture, entity-relationship diagram, authentication sequence, per-operation flowcharts (Receipts / Deliveries / Transfers / Adjustments), the full database schema with RLS policy tables, and the deployment guide — is published here:

### 👉 **[stocksense-docs — live documentation site](https://claude.ai/artifact/TEj1niNTXq1i8XV6ZjibMa)**

<br/>

## 📄 License

MIT — built for **[Hackathon Name]** 2026.

<div align="center">
<sub>Built with React, Vite, TypeScript, and Supabase.</sub>
</div>
