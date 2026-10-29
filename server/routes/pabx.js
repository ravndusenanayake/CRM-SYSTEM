import express, { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// --- Access control for the UCM push -------------------------------------
// PABX_ALLOWED_IPS="10.104.128.21"      -> only the UCM may POST (comma separated)
// PABX_USER / PABX_PASS                  -> optional HTTP Basic auth check
// Both are optional: when not set, the webhook behaves as before.
function requireUcm(req, res, next) {
  const allowed = (process.env.PABX_ALLOWED_IPS || '').split(',').map(s => s.trim()).filter(Boolean);
  if (allowed.length) {
    const ip = String(req.ip || req.socket?.remoteAddress || '').replace(/^::ffff:/, '');
    if (!allowed.includes(ip)) {
      return res.status(403).json({ success: false, error: `IP ${ip} not allowed` });
    }
  }
  const user = process.env.PABX_USER;
  const pass = process.env.PABX_PASS;
  if (user || pass) {
    const header = req.headers.authorization || '';
    if (header.startsWith('Basic ')) {
      const [u, ...rest] = Buffer.from(header.slice(6), 'base64').toString().split(':');
      if (u === user && rest.join(':') === pass) return next();
    }
    res.set('WWW-Authenticate', 'Basic realm="PABX"');
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }
  next();
}

// UCM may post text/plain; accept it and parse JSON ourselves
const textBody = express.text({ type: ['text/*', 'application/octet-stream'], limit: '10mb' });

// Flatten every payload shape we may receive into a plain list of CDR rows:
//  - single object / array / { records: [] } / { cdr: [] }     (real-time output, manual)
//  - legacy CDR API JSON: { cdr_root: [ { main_cdr, sub_cdr_1.. } ] }
function extractRecords(payload) {
  if (payload === undefined || payload === null) return [];
  if (typeof payload === 'string') {
    try { return extractRecords(JSON.parse(payload)); } catch { throw new Error('Body is not valid JSON (set CDR Format = JSON on the UCM)'); }
  }
  if (Array.isArray(payload)) return payload.flatMap(extractRecords);
  if (typeof payload !== 'object') return [];
  if (payload.cdr_root) return extractRecords(payload.cdr_root);
  const subKeys = Object.keys(payload).filter(k => k.startsWith('sub_cdr')).sort();
  if (payload.main_cdr || subKeys.length) {
    return subKeys.length ? subKeys.map(k => payload[k]) : [payload.main_cdr];
  }
  if (Array.isArray(payload.records)) return payload.records;
  if (Array.isArray(payload.cdr)) return payload.cdr;
  return [payload];
}

// Helper: Normalize Sri Lankan phone numbers for matching (+94771234567, 94771234567, 0771234567, 771234567)
function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('94')) {
    cleaned = '0' + cleaned.substring(2);
  }
  return cleaned;
}

// Helper: Match phone number against Customer Database
function findMatchingCustomer(rawPhone) {
  if (!rawPhone) return null;
  const cleaned = cleanPhoneNumber(rawPhone);
  if (!cleaned || cleaned.length < 7) return null;

  try {
    const last9 = cleaned.slice(-9);
    const customer = db.prepare(`
      SELECT id, name, companyName, mobile, telephone
      FROM customers
      WHERE mobile LIKE ? OR telephone LIKE ? OR REPLACE(REPLACE(mobile, ' ', ''), '-', '') LIKE ?
      LIMIT 1
    `).get(`%${last9}%`, `%${last9}%`, `%${last9}%`);

    return customer || null;
  } catch (err) {
    console.error('Error finding matching customer:', err);
    return null;
  }
}

// Helper: Parse Grandstream UCM6200 / standard CDR record
function parseCdrRecord(raw) {
  const p = raw || {};

  // Grandstream UCM fields: src/dst or caller/callee or externalNumber
  const src = String(p.src || p.caller || p.source || '').trim();
  const dst = String(p.dst || p.callee || p.destination || '').trim();

  let direction = p.direction;
  let extension = String(p.extension || '').trim();
  let externalNumber = String(p.externalNumber || '').trim();

  // Grandstream puts Inbound / Outbound / Internal in `userfield`; use it first.
  if (!direction || direction === 'ALL') {
    const uf = String(p.userfield || '').trim().toLowerCase();
    const answeredExt = String(p.dstanswer || p.dstchannel_ext || '').trim();
    const srcIsExt = src.length >= 2 && src.length <= 4 && !isNaN(Number(src));
    const dstIsExt = dst.length >= 2 && dst.length <= 4 && !isNaN(Number(dst));

    if (uf === 'inbound') {
      direction = 'Inbound';
      extension = answeredExt || dst;       // dst can be a ring group / IVR, dstanswer is who picked up
      externalNumber = src;
    } else if (uf === 'outbound') {
      direction = 'Outbound';
      extension = String(p.channel_ext || src).trim();
      externalNumber = dst;
    } else if (uf === 'internal' || (srcIsExt && dstIsExt)) {
      direction = 'Internal';               // extension-to-extension, not a customer call
      extension = src;
      externalNumber = dst;
    } else if (srcIsExt && !dstIsExt) {
      direction = 'Outbound';
      extension = src;
      externalNumber = dst;
    } else if (!srcIsExt && dstIsExt) {
      direction = 'Inbound';
      extension = dst;
      externalNumber = src;
    } else {
      direction = 'Inbound';
      extension = extension || src || '201';
      externalNumber = externalNumber || dst || src || 'Unknown';
    }
  }

  // Duration in seconds (Grandstream billsec is talk time)
  const duration = Number(p.billsec !== undefined ? p.billsec : (p.durationSeconds || p.duration || 0));

  // Disposition
  let disposition = p.disposition || 'Answered';
  if (typeof disposition === 'string') {
    const upper = disposition.toUpperCase();
    if (upper.includes('NO ANSWER')) disposition = 'No Answer';
    else if (upper.includes('ANSWER')) disposition = 'Answered';
    else if (upper.includes('BUSY')) disposition = 'Busy';
    else if (upper.includes('FAIL')) disposition = 'Failed';
  }

  // Call timestamp
  let callTime = p.callTime || p.start_time || p.start || p.timestart;
  if (!callTime) {
    callTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  // CDR Unique ID
  const id = p.id || (p.uniqueid ? `${p.uniqueid}-${dst || 'x'}` : null) || p.record_id || `PBX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Auto Customer Match
  const matchedCust = findMatchingCustomer(externalNumber);

  return {
    id,
    callTime,
    direction,
    extension,
    externalNumber,
    durationSeconds: duration,
    disposition,
    matchedCustomerId: matchedCust ? matchedCust.id : (p.matchedCustomerId || null),
    matchedCustomerName: matchedCust ? matchedCust.name : (p.matchedCustomerName || null),
    matchedCompanyName: matchedCust ? matchedCust.companyName : (p.matchedCompanyName || null),
    isLeadConverted: p.isLeadConverted ? 1 : 0
  };
}

// 1. Get All PABX Records
router.get('/', (req, res) => {
  try {
    const rawList = db.prepare('SELECT * FROM pabx ORDER BY callTime DESC LIMIT 200').all();
    const list = rawList.map(p => ({ ...p, isLeadConverted: Boolean(p.isLeadConverted) }));
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Ingest CDR Record (Grandstream UCM Webhook / Manual / Batch)
const handleIncomingCdr = (req, res) => {
  try {
    if (process.env.PABX_DEBUG) console.log('[PABX] raw body:', JSON.stringify(req.body));
    const records = extractRecords(req.body);

    const insert = db.prepare(`
      INSERT OR REPLACE INTO pabx (
        id, callTime, direction, extension, externalNumber, durationSeconds,
        disposition, matchedCustomerId, matchedCustomerName, matchedCompanyName, isLeadConverted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertedList = [];

    for (const item of records) {
      if (!item || (typeof item !== 'object')) continue;
      const parsed = parseCdrRecord(item);
      if (parsed.direction === 'Internal') continue;   // ext-to-ext calls are not CRM calls

      insert.run(
        parsed.id,
        parsed.callTime,
        parsed.direction,
        parsed.extension,
        parsed.externalNumber,
        parsed.durationSeconds,
        parsed.disposition,
        parsed.matchedCustomerId,
        parsed.matchedCustomerName,
        parsed.matchedCompanyName,
        parsed.isLeadConverted
      );

      // If Inbound call from unrecognized caller, create live CRM notification
      if (parsed.direction === 'Inbound' && !parsed.matchedCustomerId) {
        try {
          const notifId = `NOTIF-${Date.now()}-${Math.floor(Math.random() * 100)}`;
          db.prepare(`
            INSERT INTO notifications (id, title, message, type, timestamp, read, linkModule, referenceId)
            VALUES (?, ?, ?, ?, ?, 0, 'pabx', ?)
          `).run(
            notifId,
            'PABX Inbound Call Logged',
            `Inbound call from ${parsed.externalNumber} on Ext ${parsed.extension} (${parsed.durationSeconds}s). Unregistered prospect lead.`,
            'info',
            'Just now',
            parsed.id
          );
        } catch {
          // non-critical
        }
      }

      insertedList.push({ ...parsed, isLeadConverted: Boolean(parsed.isLeadConverted) });
    }

    res.status(201).json({
      success: true,
      message: `Successfully processed ${insertedList.length} PABX CDR record(s) from Grandstream UCM`,
      data: insertedList.length === 1 ? insertedList[0] : insertedList
    });
  } catch (err) {
    console.error('Grandstream PABX CDR Ingestion Error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// Main endpoints for Grandstream Webhook & CRM
router.post('/', requireUcm, textBody, handleIncomingCdr);
router.post('/grandstream', requireUcm, textBody, handleIncomingCdr);
router.post('/webhook', requireUcm, textBody, handleIncomingCdr);

// 3. Test Simulation Endpoint (For IT / Admin to verify webhook connection)
router.post('/test', (req, res) => {
  const testPayload = {
    src: req.body.src || '0779876543',
    dst: req.body.dst || '201',
    billsec: req.body.billsec || 125,
    disposition: 'ANSWERED',
    call_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    uniqueid: `TEST-UCM-${Date.now()}`
  };
  req.body = testPayload;
  handleIncomingCdr(req, res);
});

// 4. Convert PABX CDR Record to Lead
router.post('/:id/convert-to-lead', (req, res) => {
  try {
    const { id } = req.params;
    const record = db.prepare('SELECT * FROM pabx WHERE id = ?').get(id);
    if (!record) {
      return res.status(404).json({ success: false, error: 'PABX Record not found' });
    }

    const { companyName, contactPerson } = req.body;
    const count = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
    const newLeadId = `LEAD-2026-${String(count + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    // Insert Lead
    db.prepare(`
      INSERT INTO leads (
        id, contactName, companyName, phone, email, city, requirement,
        estimatedValueLkr, source, status, assignedCrmUserId, assignedSalespersonId,
        notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newLeadId,
      contactPerson || 'Unknown Caller',
      companyName || `PABX Caller (${record.externalNumber})`,
      record.externalNumber,
      'info@prospect.lk',
      'Colombo',
      'Inbound PABX inquiry - Needs product catalog and representative contact',
      150000,
      'PABX Inbound Call',
      'New',
      'user-1',
      'sales-1',
      `Auto-converted from PABX call on ${record.callTime} (Extension ${record.extension})`,
      today,
      today
    );

    // Update PABX record
    db.prepare(`UPDATE pabx SET isLeadConverted = 1, matchedCompanyName = ? WHERE id = ?`).run(
      companyName || 'Inbound Prospect',
      id
    );

    const createdLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(newLeadId);
    const updatedPbx = db.prepare('SELECT * FROM pabx WHERE id = ?').get(id);

    res.json({
      success: true,
      data: {
        lead: createdLead,
        pabx: { ...updatedPbx, isLeadConverted: Boolean(updatedPbx.isLeadConverted) }
      }
    });
  } catch (err) {
    console.error('PABX conversion error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
