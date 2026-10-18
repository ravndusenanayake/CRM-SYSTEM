import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

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

  // If Grandstream raw call, infer direction from extension length (usually 3 or 4 digits, e.g. 201-220)
  if (!direction || direction === 'ALL') {
    const srcIsExt = src.length >= 2 && src.length <= 4 && !isNaN(Number(src));
    const dstIsExt = dst.length >= 2 && dst.length <= 4 && !isNaN(Number(dst));

    if (srcIsExt && !dstIsExt) {
      direction = 'Outbound';
      extension = src;
      externalNumber = dst;
    } else if (!srcIsExt && dstIsExt) {
      direction = 'Inbound';
      extension = dst;
      externalNumber = src;
    } else {
      direction = p.direction || 'Inbound';
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
    if (upper.includes('ANSWER')) disposition = 'Answered';
    else if (upper.includes('NO ANSWER')) disposition = 'No Answer';
    else if (upper.includes('BUSY')) disposition = 'Busy';
    else if (upper.includes('FAIL')) disposition = 'Failed';
  }

  // Call timestamp
  let callTime = p.callTime || p.start_time || p.start || p.timestart;
  if (!callTime) {
    callTime = new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  // CDR Unique ID
  const id = p.id || p.uniqueid || p.record_id || `PBX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

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
    const payload = req.body;
    let records = [];

    // Grandstream can send single object, or array of records, or { records: [...] }
    if (Array.isArray(payload)) {
      records = payload;
    } else if (payload.records && Array.isArray(payload.records)) {
      records = payload.records;
    } else if (payload.cdr && Array.isArray(payload.cdr)) {
      records = payload.cdr;
    } else {
      records = [payload];
    }

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
router.post('/', handleIncomingCdr);
router.post('/grandstream', handleIncomingCdr);
router.post('/webhook', handleIncomingCdr);

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
