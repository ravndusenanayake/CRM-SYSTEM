import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM customers ORDER BY createdAt DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const c = req.body;
    const count = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    const newId = c.id || `CUST-${1000 + count + 1}`;
    const today = new Date().toISOString().split('T')[0];

    const insert = db.prepare(`
      INSERT INTO customers (
        id, name, companyName, contactPerson, mobile, telephone, email, address,
        city, customerType, industry, source, assignedCrmUserId, assignedSalespersonId,
        status, lastVisitDate, lastContactDate, nextFollowUpDate, notes, createdAt,
        createdBy, updatedAt, updatedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      newId,
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
      c.source || 'Direct Outreach',
      c.assignedCrmUserId || 'user-1',
      c.assignedSalespersonId || 'sales-1',
      c.status || 'Active',
      c.lastVisitDate || null,
      c.lastContactDate || null,
      c.nextFollowUpDate || null,
      c.notes || '',
      c.createdAt || today,
      c.createdBy || 'System',
      c.updatedAt || today,
      c.updatedBy || 'System'
    );

    const created = db.prepare('SELECT * FROM customers WHERE id = ?').get(newId);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error creating customer:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/bulk', (req, res) => {
  try {
    const { customers } = req.body;
    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ success: false, error: 'No customers array provided' });
    }

    const today = new Date().toISOString().split('T')[0];
    const initialCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;

    const insert = db.prepare(`
      INSERT OR REPLACE INTO customers (
        id, name, companyName, contactPerson, mobile, telephone, email, address,
        city, customerType, industry, source, assignedCrmUserId, assignedSalespersonId,
        status, lastVisitDate, lastContactDate, nextFollowUpDate, notes, createdAt,
        createdBy, updatedAt, updatedBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let importedCount = 0;
    for (let i = 0; i < customers.length; i++) {
      const c = customers[i];
      const newId = c.id || `CUST-${1000 + initialCount + i + 1}`;
      insert.run(
        newId,
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
        c.source || 'Bulk Import',
        c.assignedCrmUserId || 'user-1',
        c.assignedSalespersonId || 'sales-1',
        c.status || 'Active',
        c.lastVisitDate || null,
        c.lastContactDate || null,
        c.nextFollowUpDate || null,
        c.notes || '',
        c.createdAt || today,
        c.createdBy || 'Import Wizard',
        c.updatedAt || today,
        c.updatedBy || 'Import Wizard'
      );
      importedCount++;
    }

    res.json({ success: true, imported: importedCount });
  } catch (err) {
    console.error('Bulk customer import error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const updates = req.body;
    const today = new Date().toISOString().split('T')[0];

    const fields = [
      'name', 'companyName', 'contactPerson', 'mobile', 'telephone', 'email',
      'address', 'city', 'customerType', 'industry', 'source', 'assignedCrmUserId',
      'assignedSalespersonId', 'status', 'lastVisitDate', 'lastContactDate',
      'nextFollowUpDate', 'notes'
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

    if (updates.updatedBy) {
      sets.push('updatedBy = ?');
      values.push(updates.updatedBy);
    }

    values.push(id);

    const sql = `UPDATE customers SET ${sets.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating customer:', err);
    res.status(400).json({ success: false, error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM customers WHERE id = ?').run(id);
    res.json({ success: true, message: `Customer ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/:id/reassign', (req, res) => {
  try {
    const { id } = req.params;
    const { assignedCrmUserId, assignedSalespersonId, updatedBy } = req.body;
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE customers SET
        assignedCrmUserId = COALESCE(?, assignedCrmUserId),
        assignedSalespersonId = COALESCE(?, assignedSalespersonId),
        updatedAt = ?,
        updatedBy = COALESCE(?, updatedBy)
      WHERE id = ?
    `).run(assignedCrmUserId || null, assignedSalespersonId || null, today, updatedBy || null, id);

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/:id/visit-notes', (req, res) => {
  try {
    const { id } = req.params;
    const { note, author } = req.body;
    const existing = db.prepare('SELECT notes FROM customers WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toLocaleString();
    const formattedNote = `[${timestamp} - ${author || 'CRM User'}]: ${note}`;
    const newNotes = existing.notes ? `${formattedNote}\n\n${existing.notes}` : formattedNote;

    db.prepare(`
      UPDATE customers SET
        notes = ?,
        lastContactDate = ?,
        updatedAt = ?,
        updatedBy = COALESCE(?, updatedBy)
      WHERE id = ?
    `).run(newNotes, today, today, author || null, id);

    const updated = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
