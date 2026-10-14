import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'crm.db');
export const db = new DatabaseSync(DB_PATH);

// Initialize Tables and Schemas
export function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      extension TEXT,
      phone TEXT,
      dailyCallTarget INTEGER DEFAULT 30,
      active INTEGER DEFAULT 1,
      assignedRegion TEXT,
      department TEXT
    );

    CREATE TABLE IF NOT EXISTS salespersons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      region TEXT,
      division TEXT,
      monthlyTargetLkr REAL DEFAULT 0,
      currentSalesLkr REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      companyName TEXT NOT NULL,
      contactPerson TEXT,
      mobile TEXT,
      telephone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      customerType TEXT,
      industry TEXT,
      source TEXT,
      assignedCrmUserId TEXT,
      assignedSalespersonId TEXT,
      status TEXT DEFAULT 'Active',
      lastVisitDate TEXT,
      lastContactDate TEXT,
      nextFollowUpDate TEXT,
      notes TEXT,
      createdAt TEXT,
      createdBy TEXT,
      updatedAt TEXT,
      updatedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      contactName TEXT NOT NULL,
      companyName TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      city TEXT,
      requirement TEXT,
      estimatedValueLkr REAL DEFAULT 0,
      source TEXT,
      status TEXT DEFAULT 'New',
      assignedCrmUserId TEXT,
      assignedSalespersonId TEXT,
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS calls (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      leadId TEXT,
      contactName TEXT,
      companyName TEXT,
      phoneNumber TEXT,
      callDate TEXT,
      durationSeconds INTEGER DEFAULT 0,
      outcome TEXT,
      notes TEXT,
      nextFollowUpDate TEXT,
      crmUserId TEXT,
      linkedInquiryId TEXT,
      linkedComplaintId TEXT
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      companyName TEXT,
      contactPerson TEXT,
      phone TEXT,
      division TEXT,
      productCategory TEXT,
      requirementDetails TEXT,
      estimatedValueLkr REAL DEFAULT 0,
      status TEXT DEFAULT 'New',
      assignedSalespersonId TEXT,
      crmUserId TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      customerId TEXT,
      companyName TEXT,
      contactPerson TEXT,
      phone TEXT,
      invoiceOrItemRef TEXT,
      nature TEXT,
      priority TEXT,
      status TEXT DEFAULT 'Open',
      slaDeadline TEXT,
      description TEXT,
      resolutionNotes TEXT,
      assignedSalespersonId TEXT,
      crmUserId TEXT,
      createdAt TEXT,
      resolvedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS pabx (
      id TEXT PRIMARY KEY,
      callTime TEXT,
      direction TEXT,
      extension TEXT,
      externalNumber TEXT,
      durationSeconds INTEGER DEFAULT 0,
      disposition TEXT,
      matchedCustomerId TEXT,
      matchedCustomerName TEXT,
      matchedCompanyName TEXT,
      isLeadConverted INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT,
      message TEXT,
      type TEXT,
      timestamp TEXT,
      read INTEGER DEFAULT 0,
      linkModule TEXT,
      referenceId TEXT,
      forCrmUserId TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  seedInitialData();
}

// Seed initial data if tables are empty
export function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    return; // Already seeded
  }

  console.log('🌱 Seeding initial database from parsed_crm_data.json...');
  const jsonPath = path.join(__dirname, '..', 'parsed_crm_data.json');
  if (!fs.existsSync(jsonPath)) {
    console.warn('⚠️ parsed_crm_data.json not found, skipping auto-seed.');
    return;
  }

  const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Seed Users
  if (Array.isArray(rawData.users)) {
    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, role, extension, phone, dailyCallTarget, active, assignedRegion, department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of rawData.users) {
      insertUser.run(
        u.id,
        u.name,
        u.email,
        u.role || 'CRM_USER',
        u.extension || '',
        u.phone || '',
        u.dailyCallTarget || 30,
        u.active ? 1 : 0,
        u.assignedRegion || null,
        u.department || 'CRM Outbound Operations'
      );
    }
  }

  // Seed Salespersons
  if (Array.isArray(rawData.salespersons)) {
    const insertSp = db.prepare(`
      INSERT OR REPLACE INTO salespersons (id, code, name, phone, email, region, division, monthlyTargetLkr, currentSalesLkr)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of rawData.salespersons) {
      insertSp.run(
        s.id,
        s.code,
        s.name,
        s.phone || '',
        s.email || '',
        s.region || '',
        s.division || '',
        s.monthlyTargetLkr || 0,
        s.currentSalesLkr || 0
      );
    }
  }

  // Seed Customers
  if (Array.isArray(rawData.customers)) {
    const insertCust = db.prepare(`
      INSERT OR REPLACE INTO customers (id, name, companyName, contactPerson, mobile, telephone, email, address, city, customerType, industry, source, assignedCrmUserId, assignedSalespersonId, status, lastVisitDate, lastContactDate, nextFollowUpDate, notes, createdAt, createdBy, updatedAt, updatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of rawData.customers) {
      insertCust.run(
        c.id,
        c.name || c.companyName || '',
        c.companyName || c.name || '',
        c.contactPerson || '',
        c.mobile || '',
        c.telephone || null,
        c.email || '',
        c.address || '',
        c.city || '',
        c.customerType || 'Workshop',
        c.industry || '',
        c.source || 'Direct Visit',
        c.assignedCrmUserId || 'user-1',
        c.assignedSalespersonId || 'sales-1',
        c.status || 'Active',
        c.lastVisitDate || null,
        c.lastContactDate || null,
        c.nextFollowUpDate || null,
        c.notes || '',
        c.createdAt || new Date().toISOString(),
        c.createdBy || 'System',
        c.updatedAt || new Date().toISOString(),
        c.updatedBy || 'System'
      );
    }
  }

  // Seed Leads
  if (Array.isArray(rawData.leads)) {
    const insertLead = db.prepare(`
      INSERT OR REPLACE INTO leads (id, contactName, companyName, phone, email, city, requirement, estimatedValueLkr, source, status, assignedCrmUserId, assignedSalespersonId, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const l of rawData.leads) {
      insertLead.run(
        l.id,
        l.contactName || l.contactPerson || '',
        l.companyName || '',
        l.phone || l.mobile || '',
        l.email || '',
        l.city || '',
        l.requirement || l.productInterest || '',
        l.estimatedValueLkr || 0,
        l.source || 'Direct Outreach',
        l.status || l.stage || 'New',
        l.assignedCrmUserId || 'user-1',
        l.assignedSalespersonId || null,
        l.notes || '',
        l.createdAt || new Date().toISOString(),
        l.updatedAt || new Date().toISOString()
      );
    }
  }

  // Seed Calls
  if (Array.isArray(rawData.calls)) {
    const insertCall = db.prepare(`
      INSERT OR REPLACE INTO calls (id, customerId, leadId, contactName, companyName, phoneNumber, callDate, durationSeconds, outcome, notes, nextFollowUpDate, crmUserId, linkedInquiryId, linkedComplaintId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const cl of rawData.calls) {
      insertCall.run(
        cl.id,
        cl.customerId || null,
        cl.leadId || null,
        cl.contactName || '',
        cl.companyName || '',
        cl.phoneNumber || '',
        cl.callDate || new Date().toISOString(),
        cl.durationSeconds || 0,
        cl.outcome || 'Answered - Positive',
        cl.notes || '',
        cl.nextFollowUpDate || null,
        cl.crmUserId || 'user-1',
        cl.linkedInquiryId || null,
        cl.linkedComplaintId || null
      );
    }
  }

  // Seed Inquiries
  if (Array.isArray(rawData.inquiries)) {
    const insertInq = db.prepare(`
      INSERT OR REPLACE INTO inquiries (id, customerId, companyName, contactPerson, phone, division, productCategory, requirementDetails, estimatedValueLkr, status, assignedSalespersonId, crmUserId, createdAt, updatedAt, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const i of rawData.inquiries) {
      insertInq.run(
        i.id,
        i.customerId || null,
        i.companyName || '',
        i.contactPerson || '',
        i.phone || '',
        i.division || 'Automotive',
        i.productCategory || i.inquiryType || '',
        i.requirementDetails || i.itemsRequested || '',
        i.estimatedValueLkr || 0,
        i.status || 'New',
        i.assignedSalespersonId || null,
        i.crmUserId || 'user-1',
        i.createdAt || new Date().toISOString(),
        i.updatedAt || new Date().toISOString(),
        i.notes || ''
      );
    }
  }

  // Seed Complaints
  if (Array.isArray(rawData.complaints)) {
    const insertCmp = db.prepare(`
      INSERT OR REPLACE INTO complaints (id, customerId, companyName, contactPerson, phone, invoiceOrItemRef, nature, priority, status, slaDeadline, description, resolutionNotes, assignedSalespersonId, crmUserId, createdAt, resolvedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const cmp of rawData.complaints) {
      insertCmp.run(
        cmp.id,
        cmp.customerId || null,
        cmp.companyName || '',
        cmp.contactPerson || '',
        cmp.phone || '',
        cmp.invoiceOrItemRef || '',
        cmp.nature || '',
        cmp.priority || 'Medium',
        cmp.status || 'Open',
        cmp.slaDeadline || '',
        cmp.description || '',
        cmp.resolutionNotes || '',
        cmp.assignedSalespersonId || null,
        cmp.crmUserId || 'user-1',
        cmp.createdAt || new Date().toISOString(),
        cmp.resolvedAt || null
      );
    }
  }

  // Seed PABX
  if (Array.isArray(rawData.pabx)) {
    const insertPbx = db.prepare(`
      INSERT OR REPLACE INTO pabx (id, callTime, direction, extension, externalNumber, durationSeconds, disposition, matchedCustomerId, matchedCustomerName, matchedCompanyName, isLeadConverted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of rawData.pabx) {
      insertPbx.run(
        p.id,
        p.callTime || new Date().toISOString(),
        p.direction || 'Inbound',
        p.extension || '201',
        p.externalNumber || '',
        p.durationSeconds || 0,
        p.disposition || 'Answered',
        p.matchedCustomerId || null,
        p.matchedCustomerName || null,
        p.matchedCompanyName || null,
        p.isLeadConverted ? 1 : 0
      );
    }
  }

  // Seed Notifications
  if (Array.isArray(rawData.notifications)) {
    const insertNotif = db.prepare(`
      INSERT OR REPLACE INTO notifications (id, title, message, type, timestamp, read, linkModule, referenceId, forCrmUserId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const n of rawData.notifications) {
      insertNotif.run(
        n.id,
        n.title,
        n.message,
        n.type || 'info',
        n.timestamp || 'Just now',
        n.read ? 1 : 0,
        n.linkModule || null,
        n.referenceId || null,
        n.forCrmUserId || null
      );
    }
  }

  // Seed Settings
  const insertSetting = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`);
  const defaultSettings = {
    companyName: 'Wurth Lanka (Pvt) Ltd',
    phone: '+94 11 289 0000',
    email: 'info@wurth.lk',
    address: 'No. 395, High Level Road, Pannipitiya, Sri Lanka',
    pbxHost: '192.168.10.250:5060',
    pbxSecret: '••••••••••••',
    pbxExtensionRange: '201 - 220',
    criticalSlaHours: 24,
    mediumSlaHours: 48,
    defaultCurrency: 'LKR (Rs.)'
  };
  insertSetting.run('systemSettings', JSON.stringify(defaultSettings));

  console.log('✅ SQLite Database successfully initialized and seeded!');
}
