import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Modal } from '../common/Modal';
import { Customer } from '../../types/crm';
import {
  PhoneCall,
  Edit,
  Building,
  User,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  FileQuestion,
  Plus
} from 'lucide-react';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  customerId?: string | null;
  onEdit: (customer: Customer) => void;
  onLogCall: (customer: Customer) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  onClose,
  customer,
  customerId,
  onEdit,
  onLogCall
}) => {
  const {
    allCustomers,
    calls,
    inquiries,
    complaints,
    salespersons,
    users,
    addCustomerVisitNotes
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'overview' | 'calls' | 'inquiries' | 'complaints' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');

  const targetCustomer = customer || (customerId ? allCustomers.find(c => c.id === customerId) : null);

  if (!targetCustomer) return null;

  const assignedRep = users.find(u => u.id === targetCustomer.assignedCrmUserId);
  const assignedSales = salespersons.find(s => s.id === targetCustomer.assignedSalespersonId);

  const customerCalls = calls.filter(c => c.customerId === targetCustomer.id);
  const customerInquiries = inquiries.filter(i => i.customerId === targetCustomer.id);
  const customerComplaints = complaints.filter(c => c.customerId === targetCustomer.id);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCustomerVisitNotes(targetCustomer.id, newNote.trim());
    setNewNote('');
    setActiveTab('overview');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={targetCustomer.companyName}
      subtitle={`Customer 360 Account Profile • ${targetCustomer.id} • ${targetCustomer.city}`}
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs">
        {/* Top Header Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-bold bg-[#CC0000] text-white px-2 py-0.5 rounded">
                {targetCustomer.id}
              </span>
              <span className="font-bold text-slate-900 text-sm">{targetCustomer.companyName}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  targetCustomer.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {targetCustomer.status}
              </span>
            </div>
            <div className="text-slate-500 mt-1 flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {targetCustomer.contactPerson}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {targetCustomer.city}
              </span>
              <span className="flex items-center gap-1 font-mono text-slate-700">
                {targetCustomer.mobile}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLogCall(targetCustomer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000] transition-colors shadow-xs"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Log Call</span>
            </button>
            <button
              onClick={() => onEdit(targetCustomer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              <span>Edit Account</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`pb-2 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'calls'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Call History</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-mono">
              {customerCalls.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inquiries')}
            className={`pb-2 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'inquiries'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Inquiries</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-mono">
              {customerInquiries.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-2 px-3 font-semibold transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'complaints'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Complaints</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-mono">
              {customerComplaints.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`pb-2 px-3 font-semibold transition-colors border-b-2 ${
              activeTab === 'notes'
                ? 'border-[#CC0000] text-[#CC0000]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            + Add Visit Note
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-white border border-slate-200 rounded space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Operational Assignments
                </div>
                <div>
                  <span className="text-slate-500">Tele-Sales Rep: </span>
                  <span className="font-semibold text-slate-900">
                    {assignedRep ? `${assignedRep.name} (Ext ${assignedRep.extension})` : 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Field Consultant: </span>
                  <span className="font-semibold text-slate-900">
                    {assignedSales ? `${assignedSales.name} (${assignedSales.code} • ${assignedSales.region})` : 'Unassigned'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Industry & Type: </span>
                  <span className="font-semibold text-slate-900">
                    {targetCustomer.industry} • {targetCustomer.customerType}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Engagement Timetable
                </div>
                <div>
                  <span className="text-slate-500">Last Outbound Contact: </span>
                  <span className="font-mono font-medium text-slate-900">
                    {targetCustomer.lastContactDate || 'No record'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Next Scheduled Follow-up: </span>
                  <span className="font-mono font-bold text-[#CC0000]">
                    {targetCustomer.nextFollowUpDate || 'None scheduled'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Acquisition Source: </span>
                  <span className="font-medium text-slate-900">{targetCustomer.source}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Account Requirements & Consumables Notes
              </div>
              <div className="text-slate-700 whitespace-pre-line leading-relaxed font-mono text-[11px]">
                {targetCustomer.notes || 'No account notes recorded.'}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calls' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {customerCalls.length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded">
                No outbound calls recorded for this customer yet.
              </div>
            ) : (
              customerCalls.map(c => (
                <div key={c.id} className="p-3 bg-white border border-slate-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.id}
                      </span>
                      <span className="font-bold text-slate-900">{c.outcome}</span>
                    </div>
                    <span className="font-mono text-slate-400 text-[10px]">{c.callDate}</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{c.notes}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono pt-1">
                    <span>Talk time: {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s</span>
                    {c.nextFollowUpDate && <span>Next Follow-up: {c.nextFollowUpDate}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'inquiries' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {customerInquiries.length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded">
                No product inquiries registered for this customer.
              </div>
            ) : (
              customerInquiries.map(i => (
                <div key={i.id} className="p-3 bg-white border border-slate-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#CC0000]">{i.id}</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      LKR {i.estimatedValueLkr.toLocaleString()}
                    </span>
                  </div>
                  <div className="font-medium text-slate-800">{i.requirementDetails}</div>
                  <div className="text-[10px] text-slate-500">
                    Division: {i.division} • Status: {i.status} • Logged: {i.createdAt}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {customerComplaints.length === 0 ? (
              <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded">
                No active complaints on file for this customer.
              </div>
            ) : (
              customerComplaints.map(c => (
                <div key={c.id} className="p-3 bg-red-50/50 border border-red-200 rounded space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#CC0000]">{c.id}</span>
                    <span className="font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded text-[10px]">
                      {c.priority} Priority
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900">{c.nature}</div>
                  <p className="text-slate-700 text-[11px]">{c.description}</p>
                  <div className="text-[10px] text-slate-500 font-mono pt-1">
                    SLA Deadline: {c.slaDeadline} • Status: {c.status}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <form onSubmit={handleAddNote} className="space-y-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Append Field Visit / Follow-up Note
              </label>
              <textarea
                required
                rows={4}
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Visited workshop today. Spoke with GM regarding chemical anchor refill..."
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000]"
              >
                Append Note
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
