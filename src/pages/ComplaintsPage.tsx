import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../types/crm';
import { Modal } from '../components/common/Modal';
import {
  AlertTriangle,
  Plus,
  Search,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export const ComplaintsPage: React.FC = () => {
  const { complaints, addComplaint, updateComplaintStatus, customers, salespersons, currentUser } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedForResolution, setSelectedForResolution] = useState<Complaint | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+94 77 ');
  const [invoiceOrItemRef, setInvoiceOrItemRef] = useState('');
  const [nature, setNature] = useState('Product Defect / Quality Issue');
  const [priority, setPriority] = useState<ComplaintPriority>('High');
  const [description, setDescription] = useState('');
  const [slaHours, setSlaHours] = useState(24);

  const filtered = complaints.filter(c => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.invoiceOrItemRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleSelectCustomer = (cid: string) => {
    setCustomerId(cid);
    const cust = customers.find(c => c.id === cid);
    if (cust) {
      setCompanyName(cust.companyName);
      setContactPerson(cust.contactPerson);
      setPhone(cust.mobile);
    }
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const deadlineDate = new Date(Date.now() + slaHours * 3600 * 1000);
    const slaDeadline = deadlineDate.toISOString().replace('T', ' ').substring(0, 16);

    addComplaint({
      customerId: customerId || undefined,
      companyName,
      contactPerson,
      phone,
      invoiceOrItemRef,
      nature,
      priority,
      status: 'Open',
      slaDeadline,
      description,
      crmUserId: currentUser.id
    });

    setShowAddModal(false);
    setDescription('');
    setInvoiceOrItemRef('');
  };

  const handleResolveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForResolution) return;
    updateComplaintStatus(selectedForResolution.id, 'Resolved', resolutionText);
    setSelectedForResolution(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Complaints & SLA Enforcement</span>
            <span className="text-xs font-mono font-medium text-[#CC0000] bg-red-50 px-2 py-0.5 rounded border border-red-200">
              {filtered.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length} Unresolved SLA Tickets
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict resolution monitoring for damaged nozzles, defective spray cans, short shipments, and invoice disputes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#CC0000] text-white text-xs font-bold hover:bg-[#B30000] shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Log Customer Dispute / Defect</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search complaint ID, company, invoice ref, defect description..."
            className="w-full rounded border border-slate-300 py-1.5 pl-8 pr-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="rounded border border-slate-300 py-1.5 px-2 bg-white text-xs"
        >
          <option value="ALL">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded border border-slate-300 py-1.5 px-2 bg-white text-xs"
        >
          <option value="ALL">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Ticket Ref</th>
                <th className="px-4 py-3">Customer Account</th>
                <th className="px-4 py-3">Invoice / Consignment</th>
                <th className="px-4 py-3">Dispute Nature & Description</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">SLA Deadline</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No complaints matching the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map(cmp => {
                  const isResolved = cmp.status === 'Resolved' || cmp.status === 'Closed';
                  return (
                    <tr
                      key={cmp.id}
                      className={`hover:bg-slate-50 transition-colors ${cmp.priority === 'Critical' && !isResolved ? 'bg-red-50/20' : ''
                        }`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#CC0000]">{cmp.id}</div>
                        <div className="font-mono text-[10px] text-slate-400">{cmp.createdAt}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{cmp.companyName}</div>
                        <div className="text-[11px] text-slate-500">{cmp.contactPerson} • {cmp.phone}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-700">
                        {cmp.invoiceOrItemRef}
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <div className="font-semibold text-slate-900">{cmp.nature}</div>
                        <p className="text-slate-600 text-[11px] leading-snug line-clamp-2 mt-0.5">
                          {cmp.description}
                        </p>
                        {cmp.resolutionNotes && (
                          <div className="mt-1 p-1.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-[10px]">
                            <strong>Resolution:</strong> {cmp.resolutionNotes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${cmp.priority === 'Critical'
                            ? 'bg-red-100 text-[#CC0000] border border-red-300'
                            : cmp.priority === 'High'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                        >
                          {cmp.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        <span className={isResolved ? 'text-slate-400' : 'text-[#CC0000] font-bold'}>
                          {cmp.slaDeadline}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${isResolved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                        >
                          {cmp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isResolved ? (
                          <button
                            onClick={() => setSelectedForResolution(cmp)}
                            className="px-2.5 py-1 rounded bg-[#CC0000] text-white font-semibold text-[11px] hover:bg-[#B30000] shadow-xs"
                          >
                            Resolve Ticket
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-[11px]">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {selectedForResolution && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedForResolution(null)}
          title={`Resolve SLA Ticket: ${selectedForResolution.id}`}
          subtitle={`Client: ${selectedForResolution.companyName} • SLA Deadline: ${selectedForResolution.slaDeadline}`}
        >
          <form onSubmit={handleResolveComplaint} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="font-semibold text-slate-800">{selectedForResolution.nature}</div>
              <div className="text-slate-600 mt-1">{selectedForResolution.description}</div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Remedial Action & QA Resolution Summary *
              </label>
              <textarea
                required
                rows={3}
                value={resolutionText}
                onChange={e => setResolutionText(e.target.value)}
                placeholder="e.g. Warehouse QA batch verified. Replacement cans delivered by sales rep on 2026-10-04. Customer satisfied."
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedForResolution(null)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              >
                Mark as Resolved
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Complaint Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Log Customer Defect / Delivery Complaint"
        subtitle="Enforces automatic SLA timer and notifies regional sales management"
      >
        <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Customer Account *</label>
            <select
              value={customerId}
              onChange={e => handleSelectCustomer(e.target.value)}
              required
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs"
            >
              <option value="">-- Choose Account --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Invoice / Delivery Note Reference *</label>
              <input
                type="text"
                required
                value={invoiceOrItemRef}
                onChange={e => setInvoiceOrItemRef(e.target.value)}
                placeholder="e.g. INV-2026-9041 / DN-8812"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nature of Issue *</label>
              <select
                value={nature}
                onChange={e => setNature(e.target.value)}
                className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs"
              >
                <option value="Product Defect / Quality Issue">Product Defect / Quality Issue</option>
                <option value="Delayed Delivery">Delayed Consignment Delivery</option>
                <option value="Pricing / Billing Dispute">Pricing / Billing Dispute</option>
                <option value="Packaging Damage">Packaging / Seal Damage</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">SLA Severity Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as ComplaintPriority)}
                className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs font-semibold"
              >
                <option value="Critical">Critical (High Urgency)</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">SLA Deadline Timeframe</label>
              <select
                value={slaHours}
                onChange={e => setSlaHours(Number(e.target.value))}
                className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs"
              >
                <option value={24}>24 Hours (Urgent Resolution)</option>
                <option value={48}>48 Hours (Standard)</option>
                <option value={72}>72 Hours (Commercial Review)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Detailed Description of Defect / Dispute *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide exact product codes, quantities affected, batch numbers, and customer grievance..."
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
              Issue Ticket
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
