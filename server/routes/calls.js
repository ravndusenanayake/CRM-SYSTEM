import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM calls ORDER BY callDate DESC').all();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const params = req.body;
    const count = db.prepare('SELECT COUNT(*) as count FROM calls').get().count;
    const callId = `CALL-2026-${String(count + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();
    const today = nowIso.split('T')[0];

    let linkedInquiryId = null;
    let linkedComplaintId = null;

    // Optional: Create linked inquiry
    if (params.createInquiry) {
      const inqCount = db.prepare('SELECT COUNT(*) as count FROM inquiries').get().count;
      linkedInquiryId = `INQ-2026-${String(inqCount + 1).padStart(3, '0')}`;
      db.prepare(`
        INSERT INTO inquiries (
          id, customerId, companyName, contactPerson, phone, division, productCategory,
          requirementDetails, estimatedValueLkr, status, crmUserId, createdAt, updatedAt, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        linkedInquiryId,
        params.customerId || null,
        params.companyName,
        params.contactName,
        params.phoneNumber,
        params.inquiryDivision || 'Automotive',
        'Direct Outbound Call Inquiry',
        params.inquiryItems || 'Requested product demonstration & quotation',
        100000,
        'New',
        params.crmUserId || 'user-1',
        today,
        today,
        `Generated from outbound call ${callId}`
      );
    }

    // Optional: Create linked complaint
    if (params.createComplaint) {
      const cmpCount = db.prepare('SELECT COUNT(*) as count FROM complaints').get().count;
      linkedComplaintId = `CMP-2026-${String(cmpCount + 1).padStart(3, '0')}`;
      const slaDeadline = new Date(Date.now() + 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 16);
      db.prepare(`
        INSERT INTO complaints (
          id, customerId, companyName, contactPerson, phone, invoiceOrItemRef,
          nature, priority, status, slaDeadline, description, crmUserId, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        linkedComplaintId,
        params.customerId || null,
        params.companyName,
        params.contactName,
        params.phoneNumber,
        'CALL-REF',
        params.complaintNature || 'Customer Call Issue',
        params.complaintPriority || 'Medium',
        'Open',
        slaDeadline,
        params.complaintDescription || params.notes || 'Raised during outbound phone call',
        params.crmUserId || 'user-1',
        nowIso
      );
    }

    // Insert Call record
    db.prepare(`
      INSERT INTO calls (
        id, customerId, leadId, contactName, companyName, phoneNumber,
        callDate, durationSeconds, outcome, notes, nextFollowUpDate,
        crmUserId, linkedInquiryId, linkedComplaintId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      callId,
      params.customerId || null,
      params.leadId || null,
      params.contactName,
      params.companyName,
      params.phoneNumber,
      nowIso,
      Number(params.durationSeconds) || 0,
      params.outcome || 'Answered - Positive',
      params.notes || '',
      params.nextFollowUpDate || null,
      params.crmUserId || 'user-1',
      linkedInquiryId,
      linkedComplaintId
    );

    // If customerId is provided, update customer's last contact & follow up
    if (params.customerId) {
      db.prepare(`
        UPDATE customers SET
          lastContactDate = ?,
          nextFollowUpDate = COALESCE(?, nextFollowUpDate),
          updatedAt = ?
        WHERE id = ?
      `).run(today, params.nextFollowUpDate || null, today, params.customerId);
    }

    const createdCall = db.prepare('SELECT * FROM calls WHERE id = ?').get(callId);
    res.status(201).json({
      success: true,
      data: {
        call: createdCall,
        linkedInquiryId,
        linkedComplaintId
      }
    });
  } catch (err) {
    console.error('Call logging error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
