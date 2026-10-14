import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const rawUsers = db.prepare('SELECT * FROM users').all();
    const users = rawUsers.map(u => ({ ...u, active: Boolean(u.active) }));

    const salespersons = db.prepare('SELECT * FROM salespersons').all();
    const customers = db.prepare('SELECT * FROM customers ORDER BY createdAt DESC').all();
    const leads = db.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all();
    const calls = db.prepare('SELECT * FROM calls ORDER BY callDate DESC').all();
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY createdAt DESC').all();
    const complaints = db.prepare('SELECT * FROM complaints ORDER BY createdAt DESC').all();

    const rawPabx = db.prepare('SELECT * FROM pabx ORDER BY callTime DESC').all();
    const pabx = rawPabx.map(p => ({ ...p, isLeadConverted: Boolean(p.isLeadConverted) }));

    const rawNotifs = db.prepare('SELECT * FROM notifications ORDER BY rowid DESC').all();
    const notifications = rawNotifs.map(n => ({ ...n, read: Boolean(n.read) }));

    const settingRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('systemSettings');
    const settings = settingRow ? JSON.parse(settingRow.value) : {};

    res.json({
      success: true,
      data: {
        users,
        salespersons,
        customers,
        leads,
        calls,
        inquiries,
        complaints,
        pabxRecords: pabx,
        notifications,
        settings
      }
    });
  } catch (err) {
    console.error('Error fetching bootstrap data:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
