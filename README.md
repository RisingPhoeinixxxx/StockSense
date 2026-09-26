# StockSense

### Real-time inventory visibility. Operational control.

StockSense is a modern inventory management system designed to centralize and simplify day-to-day inventory operations.

It provides a single workspace for managing products, warehouses, locations, receipts, deliveries, internal transfers, inventory adjustments, and stock movement history — with real-time synchronization through Supabase.

---

## Overview

Managing inventory across multiple products and locations can quickly become difficult when stock information is scattered across different systems.

**StockSense** brings these operations together into one structured dashboard, allowing users to:

- Monitor inventory at a glance
- Manage products and stock levels
- Track inventory across warehouses and locations
- Record incoming and outgoing inventory
- Transfer stock between locations
- Reconcile physical inventory counts
- Track every completed stock movement
- Manage user accounts and profiles

The system is built with a focus on **clarity, traceability, and real-time inventory visibility**.

---

## ✨ Key Features

| Module | Capabilities |
|---|---|
| 📊 **Dashboard** | Inventory KPIs, stock alerts, pending operations, activity summaries |
| 📦 **Products** | Product creation, SKU management, categories, units, reorder levels |
| 🏭 **Warehouses** | Warehouse and location management |
| 📥 **Receipts** | Incoming inventory and supplier records |
| 📤 **Deliveries** | Outgoing inventory with stock validation |
| 🔄 **Transfers** | Movement of stock between locations |
| ⚖️ **Adjustments** | Physical-count reconciliation |
| 📜 **Move History** | Complete inventory movement ledger |
| 👤 **Authentication** | Secure login, profiles, and logout |
| ⚡ **Realtime** | Live synchronization through Supabase |

---

# 📊 Dashboard

The StockSense dashboard provides an overview of the current inventory state and ongoing operations.

### Dashboard includes

- Total products in stock
- Low-stock indicators
- Out-of-stock indicators
- Pending receipts
- Pending deliveries
- Scheduled internal transfers
- Recent inventory activity
- Inventory summaries
- Data visualizations

Dashboard KPI cards can also act as shortcuts to the corresponding operational modules.

```text
                    STOCKSENSE
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
     Products         Stock          Operations
        │               │               │
        ▼               ▼               ▼
   Low Stock       Locations      Receipts
   Out of Stock    Movements       Deliveries
                                  Transfers
                                  Adjustments
