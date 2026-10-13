import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Lead, LeadStatus } from '../types/crm';
import { Modal } from '../components/common/Modal';
import {
  Target,
  Plus,
  PhoneCall,
  UserCheck,
  Search,
  CheckCircle2,
  Trash2,
  DollarSign
} from 'lucide-react';

interface LeadsPageProps {
  onOpenLogCallForLead: (lead: Lead) => void;
  onLeadConvertedToCustomer: (customerId: string) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = ({
  onOpenLogCallForLead,
  onLeadConvertedToCustomer
}) => {
  const { leads, addLead, updateLead, deleteLead, convertLeadToCustomer, salespersons, currentUser } = useCrm();

  const [activeStage, setActiveStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New lead form state
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('+94 77 ');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Colombo');
  const [requirement, setRequirement] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(100000);
  const [source, setSource] = useState('PABX Inbound Call');
  const [assignedSalespersonId, setAssignedSalespersonId] = useState(salespersons[0]?.id || 'sales-1');

  const filtered = leads.filter(l => {
    const matchesStage = activeStage === 'ALL' || l.status === activeStage;
    const matchesSearch =
      l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone.includes(searchQuery) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      companyName,
      contactName,
      phone,
      email,
      city,
      requirement,
      estimatedValueLkr: Number(estimatedValue) || 50000,
      source,
      status: 'New',
      assignedCrmUserId: currentUser.id,
      assignedSalespersonId
    });
    setShowAddModal(false);
    setCompanyName('');
    setContactName('');
    setRequirement('');
  };

  const handleConvert = (leadId: string) => {
    const newCust = convertLeadToCustomer(leadId);
    if (newCust) {
      onLeadConvertedToCustomer(newCust.id);
    }
  };

  const stages: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Leads' },
    { id: 'New', label: 'New Inquiries' },
    { id: 'Contacted', label: 'Contacted' },
    { id: 'Qualified', label: 'Qualified Prospect' },
    { id: 'Converted to Customer', label: 'Converted to Account' },
    { id: 'Lost', label: 'Lost / Closed' }
  ];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Lead Generation & Prospect Pipeline</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {filtered.length} Leads
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Capture prospective automotive workshops, tender inquiries, and qualify trade leads.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#CC0000] text-white text-xs font-bold hover:bg-[#B30000] shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Lead</span>
        </button>
      </div>

      {/* Stage Tabs & Search */}
      <div className="bg-white p-3 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 overflow-x-auto">
          {stages.map(st => (
            <button
              key={st.id}
              onClick={() => setActiveStage(st.id)}
              className={`px-3 py-1.5 rounded font-medium transition-colors ${
                activeStage === st.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search lead company, contact..."
            className="w-full rounded border border-slate-300 py-1 pl-8 pr-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Leads Table / Cards */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Lead / Company</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3">Requirement Details</th>
                <th className="px-4 py-3">Est. Value (LKR)</th>
                <th className="px-4 py-3">Stage / Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No leads found matching the selected stage.
                  </td>
                </tr>
              ) : (
                filtered.map(lead => {
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{lead.companyName}</div>
                        <div className="font-mono text-[10px] text-slate-400">{lead.id} • {lead.city}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{lead.contactName}</div>
                        <div className="font-mono text-[10px] text-slate-500">{lead.phone}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-slate-700 truncate" title={lead.requirement}>
                          {lead.requirement}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        Rs. {lead.estimatedValueLkr.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={lead.status}
                          onChange={e => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                          className="rounded border border-slate-300 py-1 px-1.5 bg-white text-[11px] font-semibold"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Converted to Customer">Converted</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {lead.source}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            title="Log Call"
                            onClick={() => onOpenLogCallForLead(lead)}
                            className="p-1.5 rounded text-slate-600 hover:text-[#CC0000] hover:bg-red-50"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                          </button>

                          {lead.status !== 'Converted to Customer' && (
                            <button
                              title="Promote to Customer Account"
                              onClick={() => handleConvert(lead.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 font-semibold text-[11px]"
                            >
                              <UserCheck className="h-3 w-3" />
                              <span>Convert</span>
                            </button>
                          )}

                          <button
                            title="Delete Lead"
                            onClick={() => {
                              if (window.confirm(`Delete lead ${lead.companyName}?`)) {
                                deleteLead(lead.id);
                              }
                            }}
                            className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lead Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Prospective Trade Lead"
        subtitle="Capture new commercial workshop or industrial prospect"
      >
        <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company / Workshop Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Apex Marine Bodyshop"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                placeholder="e.g. Priyantha Ekanayake"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="info@prospect.lk"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Colombo, Kandy, Galle..."
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Estimated Tender / Deal Value (LKR)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={e => setEstimatedValue(Number(e.target.value))}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Lead Source</label>
              <select
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs"
              >
                <option value="PABX Inbound Call">PABX Inbound Call</option>
                <option value="Cold Call Outbound">Outbound Tele-Marketing</option>
                <option value="Field Sales Visit">Field Sales Recommendation</option>
                <option value="Exhibition / Expo">Trade Exhibition / Expo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Requirement / Inquired Consumables *</label>
            <textarea
              required
              rows={2}
              value={requirement}
              onChange={e => setRequirement(e.target.value)}
              placeholder="e.g. Interested in bulk supply of Würth Zebra tools, cutting discs, orbital sanders..."
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded border border-slate-300 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000]"
            >
              Register Lead
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
