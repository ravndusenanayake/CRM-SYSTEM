import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('systemSettings');
    const settings = row ? JSON.parse(row.value) : {};
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const updates = req.body;
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('systemSettings');
    const current = row ? JSON.parse(row.value) : {};
    const merged = { ...current, ...updates };

    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('systemSettings', JSON.stringify(merged));
    res.json({ success: true, data: merged });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
