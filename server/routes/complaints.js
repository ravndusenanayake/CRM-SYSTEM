import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM complaints ORDER BY createdAt DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const c = req.body;
    const count = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
    const newId = c.id || `CMP-2026-${String(count + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();
    const slaDeadline = c.slaDeadline || new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16);

    const insert = db.prepare(`
      INSERT INTO complaints (
        id, customerId, companyName, contactPerson, phone, invoiceOrItemRef,
        nature, priority, status, slaDeadline, description, resolutionNotes,
        assignedSalespersonId, crmUserId, createdAt, resolvedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      newId,
      c.customerId || null,
      c.companyName || '',
      c.contactPerson || '',
      c.phone || '',
      c.invoiceOrItemRef || 'N/A',
      c.nature || 'Product Quality',
      c.priority || 'Medium',
      c.status || 'Open',
      slaDeadline,
      c.description || '',
      c.resolutionNotes || null,
      c.assignedSalespersonId || null,
      c.crmUserId || 'user-1',
      c.createdAt || nowIso,
      null
    );

    const created = db.prepare('SELECT * FROM complaints WHERE id = ?').get(newId);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    const nowIso = new Date().toISOString();

    const isResolved = status === 'Resolved' || status === 'Closed';
    const resolvedAt = isResolved ? nowIso : null;

    db.prepare(`
      UPDATE complaints SET
        status = ?,
        resolutionNotes = COALESCE(?, resolutionNotes),
        resolvedAt = COALESCE(?, resolvedAt)
      WHERE id = ?
    `).run(status, resolutionNotes || null, resolvedAt, id);

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [
      'customerId', 'companyName', 'contactPerson', 'phone', 'invoiceOrItemRef',
      'nature', 'priority', 'status', 'slaDeadline', 'description',
      'resolutionNotes', 'assignedSalespersonId'
    ];

    const sets = [];
    const values = [];

    for (const f of fields) {
      if (updates[f] !== undefined) {
        sets.push(`${f} = ?`);
        values.push(updates[f]);
      }
    }

    values.push(id);

    const sql = `UPDATE complaints SET ${sets.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const updated = db.prepare('SELECT * FROM complaints WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
