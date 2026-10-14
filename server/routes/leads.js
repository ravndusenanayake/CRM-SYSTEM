import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const l = req.body;
    const count = db.prepare('SELECT COUNT(*) as count FROM leads').get().count;
    const newId = l.id || `LEAD-2026-${String(count + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const insert = db.prepare(`
      INSERT INTO leads (
        id, contactName, companyName, phone, email, city, requirement,
        estimatedValueLkr, source, status, assignedCrmUserId, assignedSalespersonId,
        notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      newId,
      l.contactName || l.contactPerson || '',
      l.companyName || '',
      l.phone || l.mobile || '',
      l.email || '',
      l.city || '',
      l.requirement || l.productInterest || '',
      Number(l.estimatedValueLkr) || 0,
      l.source || 'Direct Outreach',
      l.status || 'New',
      l.assignedCrmUserId || 'user-1',
      l.assignedSalespersonId || null,
      l.notes || '',
      l.createdAt || today,
      l.updatedAt || today
    );

    const created = db.prepare('SELECT * FROM leads WHERE id = ?').get(newId);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const updates = req.body;
    const today = new Date().toISOString().split('T')[0];

    const fields = [
      'contactName', 'companyName', 'phone', 'email', 'city', 'requirement',
      'estimatedValueLkr', 'source', 'status', 'assignedCrmUserId',
      'assignedSalespersonId', 'notes'
    ];

    const sets = [];
    const values = [];

    for (const f of fields) {
      if (updates[f] !== undefined) {
        sets.push(`${f} = ?`);
        values.push(updates[f]);
      }
    }

    sets.push('updatedAt = ?');
    values.push(today);
    values.push(id);

    const sql = `UPDATE leads SET ${sets.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const updated = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM leads WHERE id = ?').run(id);
    res.json({ success: true, message: `Lead ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Convert Lead to Customer
router.post('/:id/convert', (req, res) => {
  try {
    const { id } = req.params;
    const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const custCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const newCustId = `CUST-${1000 + custCount + 1}`;

    const insertCust = db.prepare(`
      INSERT INTO customers (
        id, name, companyName, contactPerson, mobile, telephone, email, address,
        city, customerType, industry, source, assignedCrmUserId, assignedSalespersonId,
        status, lastVisitDate, lastContactDate, nextFollowUpDate, notes, createdAt,
        createdBy, updatedAt, updatedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertCust.run(
      newCustId,
      lead.companyName,
      lead.companyName,
      lead.contactName,
      lead.phone,
      null,
      lead.email,
      '',
      lead.city,
      'Workshop',
      'Automotive',
      `Converted from Lead ${lead.id}`,
      lead.assignedCrmUserId,
      lead.assignedSalespersonId || 'sales-1',
      'Active',
      today,
      today,
      null,
      `Converted from Lead ${lead.id}. Requirement: ${lead.requirement || 'None'}. Notes: ${lead.notes || ''}`,
      today,
      'Lead Conversion Wizard',
      today,
      'Lead Conversion Wizard'
    );

    // Update lead status
    db.prepare(`UPDATE leads SET status = 'Converted to Customer', updatedAt = ? WHERE id = ?`).run(today, id);

    const newCustomer = db.prepare('SELECT * FROM customers WHERE id = ?').get(newCustId);
    const updatedLead = db.prepare('SELECT * FROM leads WHERE id = ?').get(id);

    res.json({
      success: true,
      data: {
        customer: newCustomer,
        lead: updatedLead
      }
    });
  } catch (err) {
    console.error('Lead conversion error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
