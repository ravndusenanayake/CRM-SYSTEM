# Wurth Lanka CRM - Enterprise Operations

A production-grade, internal enterprise Customer Relationship Management (CRM) web application engineered for **Wurth Lanka (Pvt) Ltd**. 

The system centralizes tele-sales outbound operations, customer service, field sales representative coordination, complaint SLA enforcement, PBX telephony CDR imports, and commercial performance analytics across Sri Lanka's automotive workshops, bodyshops, fleet cargo operators, and construction contractors.

---

## 🌟 Key Features & Modules

1. **Executive Dashboard**: Real-time KPIs, daily call targets (35 calls/day) progress gauge, and live SLA breach alert radar.
2. **Customer 360 Database**: Comprehensive client accounts database with multi-filters, global search, and detailed Customer 360 drawer (Call history, Inquiries, Complaints, Visit notes).
3. **Lead Generation & Prospect Pipeline**: Stage progression (New, Contacted, Qualified, Converted, Lost), deal valuation in LKR, and **1-Click Atomic Conversion to Active Customer**.
4. **Outbound Calls & Telephony Log**: Logging call talk-time duration, outcomes, auto follow-up scheduling, and instant inquiry/complaint linking.
5. **Inquiries & Quotations**: Commercial product pricing by division (Automotive, Construction & Fasteners, Metal & Maintenance, Cargo & Fleet), estimated tender values in LKR.
6. **Complaints & SLA Enforcement**: Defect and delivery dispute resolution, invoice reference, and automated **24h/48h SLA deadline countdown timer**.
7. **Follow-up Task Queue**: Segmented queues for *Due Today*, *Upcoming Schedule*, and *Overdue Tasks* with quick-call triggers.
8. **Field Sales Force Management**: Regional sales consultants (WSP codes), territory allocation (Western, Central, Southern, North Western), and quarterly targets vs. achievement progress.
9. **PABX Telephony CDR Integration**: Telephony Call Detail Records ingestion, extension mapping, caller ID account matching, and **1-click lead registration for unknown inbound callers**.
10. **Bulk Customer Import Engine**: CSV file upload with downloadable standard template, phone number validation for Sri Lanka (+94), **Duplicate Phone Number Detection & Skipping**, and batch sales rep assignment.
11. **Executive Operational Reports**: Dynamic CSV export generator for Calls, Inquiries, Complaints, and Sales Consultants.
12. **CRM Team Performance Telemetry**: Agent leaderboards, talk-time duration, and call quotas across Today, This Week, and This Month.
13. **Role-Based Access Control (RBAC)**: Real-time user switcher supporting **Admin (Commercial Operations Manager)** and **CRM Users (Tele-sales agents Ext 201–205)**.
14. **User Account Administration**: Provisioning CRM agents, PBX extension mappings, daily call quotas, and department assignments.
15. **System Settings & Backups**: Headquarters profile, SIP gateway parameters, SLA thresholds, and 1-click JSON database backup/restore.

---

## 🛠️ Technology Stack

- **Frontend**: React 18 / 19 with TypeScript
- **Bundler**: Vite 6.x
- **Styling**: Tailwind CSS with custom Wurth Corporate Theme (`#CC0000` Crimson, `#0F172A` Slate)
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans & JetBrains Mono
- **Backend Server**: Node.js + Express 5 REST API (`server/`)
- **Database**: SQLite (Native `node:sqlite` engine, zero external binary dependency)
- **Database Path**: `server/data/crm.db` (auto-seeded on first launch)
- **State & Synchronization**: React Context API synchronized with SQLite REST API, with automatic LocalStorage offline fallback

---

## 📁 Project Structure

```text
├── public/                    # Static assets & icons
│   └── wurth-icon.svg
├── server/                    # Node.js + Express REST API Backend
│   ├── data/                  # SQLite database storage (crm.db)
│   ├── routes/                # Modular REST API route handlers
│   │   ├── bootstrap.js       # Fast single-query initial sync
│   │   ├── customers.js       # Customer CRUD, bulk import, reassignment
│   │   ├── leads.js           # Lead pipeline & lead-to-customer conversion
│   │   ├── calls.js           # Outbound telephony & linked inquiries/complaints
│   │   ├── inquiries.js       # Product quotation management
│   │   ├── complaints.js      # Customer dispute & SLA tracking
│   │   ├── pabx.js            # Telephony CDR records & lead capture
│   │   ├── users.js           # CRM user accounts & targets
│   │   ├── salespersons.js    # Field sales consultant tracking
│   │   ├── notifications.js   # Notification system
│   │   └── settings.js        # System parameters
│   ├── db.js                  # Database connection, schemas, and auto-seeding
│   └── index.js               # Express server entry point & SPA static host
├── src/
│   ├── components/            # Reusable UI components & modals
│   │   ├── common/            # Logo, Modal dialogs
│   │   ├── layout/            # Sidebar, Header (with live DB badge)
│   │   └── modals/            # LogCallModal, CustomerModal, CustomerDetailModal
│   ├── context/               # CrmContext state provider & SQLite sync
│   ├── services/              # crmApi client service for backend endpoints
│   ├── data/                  # Default mock fixtures
│   ├── pages/                 # 15 Module Views (Dashboard, Customers, etc.)
│   ├── types/                 # TypeScript interfaces (Customer, Lead, Call, etc.)
│   ├── App.tsx                # Main view coordinator
│   ├── main.tsx               # Entry point
│   └── index.css              # Styling & Tailwind CSS
├── Wurth_Lanka_CRM_SRS_Document.docx  # Software Requirements Specification
├── Wurth_Lanka_CRM_TDD_Document.docx  # Technical Design Document
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher; Node 22+ recommended for built-in `node:sqlite`)
- npm or yarn

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/ravndusenanayake/CRM-SYSTEM.git
   cd CRM-SYSTEM
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in **Development Mode** (Vite + Express):
   - Terminal 1 (Backend API):
     ```bash
     npm run server
     ```
     *(Runs Express + SQLite at `http://localhost:5000`)*
   - Terminal 2 (Frontend with Hot-Reload):
     ```bash
     npm run dev
     ```
     *(Runs Vite at `http://localhost:5173` with automatic `/api` proxy)*

4. Run in **Production / All-In-One Mode**:
   ```bash
   npm run build
   npm start
   ```
   *(Builds client bundle and serves both the REST API and the frontend at `http://localhost:5000`)*

---

## 📄 Documentation

Comprehensive enterprise documentation is included in the repository:
- **SRS Document**: `Wurth_Lanka_CRM_SRS_Document.docx` (Software Requirements Specification)
- **TDD Document**: `Wurth_Lanka_CRM_TDD_Document.docx` (Technical Design Document & Verification Test Cases)
