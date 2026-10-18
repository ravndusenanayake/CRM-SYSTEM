import express from 'express';
import cors from 'cors';
import { initDatabase } from './db.js';

import bootstrapRouter from './routes/bootstrap.js';
import usersRouter from './routes/users.js';
import salespersonsRouter from './routes/salespersons.js';
import customersRouter from './routes/customers.js';
import leadsRouter from './routes/leads.js';
import callsRouter from './routes/calls.js';
import inquiriesRouter from './routes/inquiries.js';
import complaintsRouter from './routes/complaints.js';
import pabxRouter from './routes/pabx.js';
import notificationsRouter from './routes/notifications.js';
import settingsRouter from './routes/settings.js';
import systemRouter from './routes/system.js';

// Initialize SQLite database and tables
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Wurth Lanka Enterprise Operations CRM API',
    database: 'SQLite (node:sqlite)',
    timestamp: new Date().toISOString()
  });
});

// Register API Routes
app.use('/api/bootstrap', bootstrapRouter);
app.use('/api/users', usersRouter);
app.use('/api/salespersons', salespersonsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/leads', leadsRouter);
app.use('/api/calls', callsRouter);
app.use('/api/inquiries', inquiriesRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/pabx', pabxRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/system', systemRouter);

// Serve Static Frontend if built
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Express 5 compatible SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Wurth Lanka CRM Backend Server running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`💾 Database: SQLite (server/data/crm.db)`);
  console.log(`🔌 Health check: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});
