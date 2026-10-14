import { Router } from 'express';
import { db, seedInitialData } from '../db.js';

const router = Router();

router.post('/reset', (req, res) => {
  try {
    const tables = ['users', 'salespersons', 'customers', 'leads', 'calls', 'inquiries', 'complaints', 'pabx', 'notifications', 'settings'];
    for (const t of tables) {
      db.prepare(`DELETE FROM ${t}`).run();
    }

    seedInitialData();
    res.json({ success: true, message: 'Database reset to initial factory data successfully!' });
  } catch (err) {
    console.error('System reset error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
