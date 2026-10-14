import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM inquiries ORDER BY createdAt DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const i = req.body;
    const count = db.prepare('SELECT COUNT(*) as count FROM inquiries').get().count;
    const newId = i.id || `INQ-2026-${String(count + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const insert = db.prepare(`
      INSERT INTO inquiries (
        id, customerId, companyName, contactPerson, phone, division,
        productCategory, requirementDetails, estimatedValueLkr, status,
        assignedSalespersonId, crmUserId, createdAt, updatedAt, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      newId,
      i.customerId || null,
      i.companyName || '',
      i.contactPerson || '',
      i.phone || '',
      i.division || 'Automotive',
      i.productCategory || 'General Inquiry',
      i.requirementDetails || '',
      Number(i.estimatedValueLkr) || 0,
      i.status || 'New',
      i.assignedSalespersonId || null,
      i.crmUserId || 'user-1',
      i.createdAt || today,
      i.updatedAt || today,
      i.notes || ''
    );

    const created = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(newId);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`UPDATE inquiries SET status = ?, updatedAt = ? WHERE id = ?`).run(status, today, id);
    const updated = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const today = new Date().toISOString().split('T')[0];

    const fields = [
      'customerId', 'companyName', 'contactPerson', 'phone', 'division',
      'productCategory', 'requirementDetails', 'estimatedValueLkr', 'status',
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

    const sql = `UPDATE inquiries SET ${sets.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const updated = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
