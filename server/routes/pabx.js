import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const rawList = db.prepare('SELECT * FROM pabx ORDER BY callTime DESC').all();
    const list = rawList.map(p => ({ ...p, isLeadConverted: Boolean(p.isLeadConverted) }));
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const p = req.body;
    const count = db.prepare('SELECT COUNT(*) as count FROM pabx').get().count;
    const newId = p.id || `PBX-${Date.now()}`;

    const insert = db.prepare(`
      INSERT INTO pabx (
        id, callTime, direction, extension, externalNumber, durationSeconds,
        disposition, matchedCustomerId, matchedCustomerName, matchedCompanyName, isLeadConverted
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      newId,
      p.callTime || new Date().toISOString(),
      p.direction || 'Inbound',
      p.extension || '201',
      p.externalNumber || '',
      Number(p.durationSeconds) || 0,
      p.disposition || 'Answered',
      p.matchedCustomerId || null,
      p.matchedCustomerName || null,
      p.matchedCompanyName || null,
      p.isLeadConverted ? 1 : 0
    );

    const created = db.prepare('SELECT * FROM pabx WHERE id = ?').get(newId);
    res.status(201).json({ success: true, data: { ...created, isLeadConverted: Boolean(created.isLeadConverted) } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Convert PABX CDR Record to Lead
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
      '',
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
    db.prepare(`UPDATE pabx SET isLeadConverted = 1 WHERE id = ?`).run(id);

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
