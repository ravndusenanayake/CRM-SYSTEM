import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM salespersons').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { id, code, name, phone, email, region, division, monthlyTargetLkr, currentSalesLkr } = req.body;
    const newId = id || `sales-${Date.now()}`;
    const insert = db.prepare(`
      INSERT INTO salespersons (id, code, name, phone, email, region, division, monthlyTargetLkr, currentSalesLkr)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      newId,
      code,
      name,
      phone || '',
      email || '',
      region || '',
      division || '',
      Number(monthlyTargetLkr) || 0,
      Number(currentSalesLkr) || 0
    );
    const created = db.prepare('SELECT * FROM salespersons WHERE id = ?').get(newId);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM salespersons WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Salesperson not found' });
    }
    const { code, name, phone, email, region, division, monthlyTargetLkr, currentSalesLkr } = req.body;
    const update = db.prepare(`
      UPDATE salespersons SET
        code = COALESCE(?, code),
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        region = COALESCE(?, region),
        division = COALESCE(?, division),
        monthlyTargetLkr = COALESCE(?, monthlyTargetLkr),
        currentSalesLkr = COALESCE(?, currentSalesLkr)
      WHERE id = ?
    `);
    update.run(
      code !== undefined ? code : null,
      name !== undefined ? name : null,
      phone !== undefined ? phone : null,
      email !== undefined ? email : null,
      region !== undefined ? region : null,
      division !== undefined ? division : null,
      monthlyTargetLkr !== undefined ? Number(monthlyTargetLkr) : null,
      currentSalesLkr !== undefined ? Number(currentSalesLkr) : null,
      id
    );
    const updated = db.prepare('SELECT * FROM salespersons WHERE id = ?').get(id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
