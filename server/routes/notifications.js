import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const rawList = db.prepare('SELECT * FROM notifications ORDER BY rowid DESC').all();
    const list = rawList.map(n => ({ ...n, read: Boolean(n.read) }));
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/read', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id);
    const updated = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id);
    res.json({ success: true, data: { ...updated, read: true } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

router.post('/mark-all-read', (req, res) => {
  try {
    db.prepare('UPDATE notifications SET read = 1').run();
    const rawList = db.prepare('SELECT * FROM notifications ORDER BY rowid DESC').all();
    const list = rawList.map(n => ({ ...n, read: true }));
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
