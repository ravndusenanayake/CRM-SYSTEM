import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const rawUsers = db.prepare('SELECT * FROM users').all();
    const users = rawUsers.map(u => ({ ...u, active: Boolean(u.active) }));
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { id, name, email, role, extension, phone, dailyCallTarget, active, assignedRegion, department } = req.body;
    const newId = id || `user-${Date.now()}`;
    const insert = db.prepare(`
      INSERT INTO users (id, name, email, role, extension, phone, dailyCallTarget, active, assignedRegion, department)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      newId,
      name,
      email,
      role || 'CRM_USER',
      extension || '',
      phone || '',
      Number(dailyCallTarget) || 30,
      active ? 1 : 0,
      assignedRegion || null,
      department || 'CRM Outbound Operations'
    );
    const created = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
    res.status(201).json({ success: true, data: { ...created, active: Boolean(created.active) } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { name, email, role, extension, phone, dailyCallTarget, active, assignedRegion, department } = req.body;
    const update = db.prepare(`
      UPDATE users SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        role = COALESCE(?, role),
        extension = COALESCE(?, extension),
        phone = COALESCE(?, phone),
        dailyCallTarget = COALESCE(?, dailyCallTarget),
        active = COALESCE(?, active),
        assignedRegion = COALESCE(?, assignedRegion),
        department = COALESCE(?, department)
      WHERE id = ?
    `);
    update.run(
      name !== undefined ? name : null,
      email !== undefined ? email : null,
      role !== undefined ? role : null,
      extension !== undefined ? extension : null,
      phone !== undefined ? phone : null,
      dailyCallTarget !== undefined ? Number(dailyCallTarget) : null,
      active !== undefined ? (active ? 1 : 0) : null,
      assignedRegion !== undefined ? assignedRegion : null,
      department !== undefined ? department : null,
      id
    );
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    res.json({ success: true, data: { ...updated, active: Boolean(updated.active) } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
