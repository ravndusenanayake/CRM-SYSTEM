import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Modal } from '../common/Modal';
import { Logo } from '../common/Logo';
import { CallOutcome, ComplaintPriority, InquiryDivision } from '../../types/crm';
import { PhoneCall, CheckCircle, AlertTriangle } from 'lucide-react';

interface LogCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCustomerId?: string;
  initialLeadId?: string;
  initialPhoneNumber?: string;
}

export const LogCallModal: React.FC<LogCallModalProps> = ({
  isOpen,
  onClose,
  initialCustomerId,
  initialLeadId,
  initialPhoneNumber
}) => {
  const { customers, leads, logCall, currentUser } = useCrm();

  const [targetType, setTargetType] = useState<'customer' | 'lead' | 'custom'>('customer');
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomerId || '');
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeadId || '');
  const [customContact, setCustomContact] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');

  const [durationMinutes, setDurationMinutes] = useState(2);
  const [durationSeconds, setDurationSeconds] = useState(30);
  const [outcome, setOutcome] = useState<CallOutcome>('Answered - Positive');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  // Follow-up direct creations
  const [createInquiry, setCreateInquiry] = useState(false);
  const [inquiryDivision, setInquiryDivision] = useState<InquiryDivision>('Automotive');
  const [inquiryItems, setInquiryItems] = useState('');

  const [createComplaint, setCreateComplaint] = useState(false);
  const [complaintNature, setComplaintNature] = useState('Product Defect / Quality Issue');
  const [complaintPriority, setComplaintPriority] = useState<ComplaintPriority>('Medium');
  const [complaintDescription, setComplaintDescription] = useState('');

  useEffect(() => {
    if (initialCustomerId) {
      setTargetType('customer');
      setSelectedCustomerId(initialCustomerId);
      const cust = customers.find(c => c.id === initialCustomerId);
      if (cust) setPhoneNumber(cust.mobile || cust.telephone || '');
    } else if (initialLeadId) {
      setTargetType('lead');
      setSelectedLeadId(initialLeadId);
      const lead = leads.find(l => l.id === initialLeadId);
      if (lead) setPhoneNumber(lead.phone || '');
    } else if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber);
    }
  }, [initialCustomerId, initialLeadId, initialPhoneNumber, customers, leads]);

  useEffect(() => {
    if (targetType === 'customer' && selectedCustomerId) {
      const cust = customers.find(c => c.id === selectedCustomerId);
      if (cust) setPhoneNumber(cust.mobile || cust.telephone || '');
    }
  }, [selectedCustomerId, targetType, customers]);

  useEffect(() => {
    if (targetType === 'lead' && selectedLeadId) {
      const lead = leads.find(l => l.id === selectedLeadId);
      if (lead) setPhoneNumber(lead.phone || '');
    }
  }, [selectedLeadId, targetType, leads]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let contactName = '';
    let companyName = '';

    if (targetType === 'customer') {
      const cust = customers.find(c => c.id === selectedCustomerId);
      contactName = cust?.contactPerson || 'Customer Contact';
      companyName = cust?.companyName || 'Customer Company';
    } else if (targetType === 'lead') {
      const lead = leads.find(l => l.id === selectedLeadId);
      contactName = lead?.contactName || 'Lead Contact';
      companyName = lead?.companyName || 'Lead Company';
    } else {
      contactName = customContact || 'Direct Call Contact';
      companyName = customCompany || 'Commercial Prospect';
    }

    const totalSeconds = durationMinutes * 60 + durationSeconds;

    logCall({
      customerId: targetType === 'customer' ? selectedCustomerId : undefined,
      leadId: targetType === 'lead' ? selectedLeadId : undefined,
      contactName,
      companyName,
      phoneNumber: phoneNumber || '+94 77 000 0000',
      durationSeconds: totalSeconds,
      outcome,
      notes: notes || 'Outbound CRM contact logged.',
      nextFollowUpDate: followUpDate || undefined,
      createInquiry,
      inquiryDivision,
      inquiryItems,
      createComplaint,
      complaintNature,
      complaintPriority,
      complaintDescription
    });

    // Reset and close
    setNotes('');
    setCreateInquiry(false);
    setCreateComplaint(false);
    setInquiryItems('');
    setComplaintDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Outbound Call"
      subtitle={`Caller: ${currentUser.name} (Ext ${currentUser.extension}) • Wurth Lanka Outbound CRM`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Wurth Telephony Header Tag */}
        <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded">
          <div className="flex items-center gap-2.5">
            <Logo variant="card" showSubtitle={false} />
            <span className="font-semibold text-slate-700">Wurth Telephony & Outbound Logging</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Ext: {currentUser.extension}</span>
        </div>

        {/* Target Type Selector */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Call Target</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTargetType('customer')}
              className={`py-1.5 px-3 rounded border text-center font-medium transition-colors ${
                targetType === 'customer'
                  ? 'bg-red-50 border-[#CC0000] text-[#CC0000] font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Existing Customer
            </button>
            <button
              type="button"
              onClick={() => setTargetType('lead')}
              className={`py-1.5 px-3 rounded border text-center font-medium transition-colors ${
                targetType === 'lead'
                  ? 'bg-red-50 border-[#CC0000] text-[#CC0000] font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Active Lead
            </button>
            <button
              type="button"
              onClick={() => setTargetType('custom')}
              className={`py-1.5 px-3 rounded border text-center font-medium transition-colors ${
                targetType === 'custom'
                  ? 'bg-red-50 border-[#CC0000] text-[#CC0000] font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Custom / Direct
            </button>
          </div>
        </div>

        {/* Select Target Details */}
        {targetType === 'customer' && (
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Customer *</label>
            <select
              value={selectedCustomerId}
              onChange={e => setSelectedCustomerId(e.target.value)}
              required
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-[#CC0000] focus:outline-hidden"
            >
              <option value="">-- Choose Assigned Customer --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName} — {c.contactPerson} ({c.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {targetType === 'lead' && (
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Active Lead *</label>
            <select
              value={selectedLeadId}
              onChange={e => setSelectedLeadId(e.target.value)}
              required
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs text-slate-900 focus:border-[#CC0000] focus:outline-hidden"
            >
              <option value="">-- Choose Assigned Lead --</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.companyName} — {l.contactName} ({l.id})
                </option>
              ))}
            </select>
          </div>
        )}

        {targetType === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={customCompany}
                onChange={e => setCustomCompany(e.target.value)}
                placeholder="e.g. Lanka Diesel Garage"
                required
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                value={customContact}
                onChange={e => setCustomContact(e.target.value)}
                placeholder="e.g. Mr. Sunil Perera"
                required
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* Phone & Duration */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Dialed Phone Number *</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+94 77 123 4567"
              required
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Call Duration (Talk-time)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="60"
                value={durationMinutes}
                onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-16 rounded border border-slate-300 py-1.5 px-2 text-center text-xs"
              />
              <span className="text-slate-500">min</span>
              <input
                type="number"
                min="0"
                max="59"
                value={durationSeconds}
                onChange={e => setDurationSeconds(parseInt(e.target.value) || 0)}
                className="w-16 rounded border border-slate-300 py-1.5 px-2 text-center text-xs"
              />
              <span className="text-slate-500">sec</span>
            </div>
          </div>
        </div>

        {/* Outcome Selector */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Call Outcome *</label>
          <select
            value={outcome}
            onChange={e => setOutcome(e.target.value as CallOutcome)}
            className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden font-medium"
          >
            <option value="Answered - Positive">Answered - Positive (Interested / Needs Refill)</option>
            <option value="Answered - Follow-up Needed">Answered - Follow-up Needed (Check Later)</option>
            <option value="Answered - Complaint Raised">Answered - Complaint Raised (Defect / Delivery issue)</option>
            <option value="Answered - Inquiry Created">Answered - Inquiry Created (Tender / RFQ / Price)</option>
            <option value="No Answer">No Answer / Ringing</option>
            <option value="Busy">Line Busy</option>
            <option value="Wrong Number">Wrong / Invalid Number</option>
          </select>
        </div>

        {/* Call Notes */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Discussion Notes / Feedback</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Discussed brake cleaner stock, zebra tool requirement, agreed to follow up next Tuesday..."
            className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>

        {/* Next Follow-up Date */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Schedule Next Follow-up Date</label>
          <input
            type="date"
            value={followUpDate}
            onChange={e => setFollowUpDate(e.target.value)}
            className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>

        {/* Fast Action Add-ons (Inquiry & Complaint Checkboxes) */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
            <input
              type="checkbox"
              checked={createInquiry}
              onChange={e => setCreateInquiry(e.target.checked)}
              className="rounded text-[#CC0000] focus:ring-[#CC0000]"
            />
            <span>Create Product Quotation / Commercial Inquiry from this Call</span>
          </label>

          {createInquiry && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Division</label>
                  <select
                    value={inquiryDivision}
                    onChange={e => setInquiryDivision(e.target.value as InquiryDivision)}
                    className="w-full rounded border border-slate-300 bg-white py-1 px-2 text-xs"
                  >
                    <option value="Automotive">Automotive Consumables</option>
                    <option value="Construction & Fasteners">Construction Chemical Anchors</option>
                    <option value="Metal & Maintenance">Metal & Maintenance Tools</option>
                    <option value="Cargo & Fleet">Cargo & Logistics Fleet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-0.5">Requested Items</label>
                  <input
                    type="text"
                    value={inquiryItems}
                    onChange={e => setInquiryItems(e.target.value)}
                    placeholder="e.g. 5 Cartons Zebra Brake Cleaner"
                    className="w-full rounded border border-slate-300 py-1 px-2 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
            <input
              type="checkbox"
              checked={createComplaint}
              onChange={e => setCreateComplaint(e.target.checked)}
              className="rounded text-[#CC0000] focus:ring-[#CC0000]"
            />
            <span className="text-red-700">Log Formal Customer Complaint & SLA Ticket</span>
          </label>

          {createComplaint && (
            <div className="p-3 bg-red-50 border border-red-200 rounded space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-red-900 mb-0.5">Nature of Defect</label>
                  <select
                    value={complaintNature}
                    onChange={e => setComplaintNature(e.target.value)}
                    className="w-full rounded border border-red-300 bg-white py-1 px-2 text-xs"
                  >
                    <option value="Product Defect / Quality Issue">Product Defect / Spray Nozzle Issue</option>
                    <option value="Delayed Delivery">Delayed Consignment Delivery</option>
                    <option value="Pricing / Billing Dispute">Invoice Pricing Dispute</option>
                    <option value="Packaging Damage">Packaging / Seal Damage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-red-900 mb-0.5">SLA Severity</label>
                  <select
                    value={complaintPriority}
                    onChange={e => setComplaintPriority(e.target.value as ComplaintPriority)}
                    className="w-full rounded border border-red-300 bg-white py-1 px-2 text-xs font-semibold"
                  >
                    <option value="Critical">Critical (Immediate 24h SLA)</option>
                    <option value="High">High (48h Resolution)</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-red-900 mb-0.5">Issue Description</label>
                <input
                  type="text"
                  value={complaintDescription}
                  onChange={e => setComplaintDescription(e.target.value)}
                  placeholder="Details of defect or invoice error..."
                  className="w-full rounded border border-red-300 py-1 px-2 text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000] transition-colors shadow-xs"
          >
            Save Call Log
          </button>
        </div>
      </form>
    </Modal>
  );
};
