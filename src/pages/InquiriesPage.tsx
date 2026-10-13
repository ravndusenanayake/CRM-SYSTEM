import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Inquiry, InquiryDivision, InquiryStatus } from '../types/crm';
import { Modal } from '../components/common/Modal';
import {
  FileQuestion,
  Plus,
  Search,
  DollarSign,
  Briefcase,
  CheckCircle,
  Clock
} from 'lucide-react';

export const InquiriesPage: React.FC = () => {
  const { inquiries, addInquiry, updateInquiryStatus, customers, salespersons, currentUser } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [customerId, setCustomerId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+94 77 ');
  const [division, setDivision] = useState<InquiryDivision>('Automotive');
  const [productCategory, setProductCategory] = useState('Consumables & Zebra Tools');
  const [requirementDetails, setRequirementDetails] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(150000);
  const [assignedSalespersonId, setAssignedSalespersonId] = useState('sales-1');

  const filtered = inquiries.filter(i => {
    const matchesSearch =
      i.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.requirementDetails.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDivision = divisionFilter === 'ALL' || i.division === divisionFilter;
    return matchesSearch && matchesDivision;
  });

  const handleSelectCustomer = (cid: string) => {
    setCustomerId(cid);
    const cust = customers.find(c => c.id === cid);
    if (cust) {
      setCompanyName(cust.companyName);
      setContactPerson(cust.contactPerson);
      setPhone(cust.mobile);
      setAssignedSalespersonId(cust.assignedSalespersonId);
    }
  };

  const handleCreateInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    addInquiry({
      customerId: customerId || undefined,
      companyName,
      contactPerson,
      phone,
      division,
      productCategory,
      requirementDetails,
      estimatedValueLkr: Number(estimatedValue) || 50000,
      status: 'New',
      assignedSalespersonId,
      crmUserId: currentUser.id
    });
    setShowAddModal(false);
    setRequirementDetails('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Product Inquiries & Quotations</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {filtered.length} Quotations
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Wurth product pricing tenders, bulk fastener quotations, and workshop stock replenishments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#CC0000] text-white text-xs font-bold hover:bg-[#B30000] shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Commercial Inquiry</span>
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
            placeholder="Search quotation ID, client, product requirements..."
            className="w-full rounded border border-slate-300 py-1.5 pl-8 pr-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>

        <select
          value={divisionFilter}
          onChange={e => setDivisionFilter(e.target.value)}
          className="rounded border border-slate-300 py-1.5 px-2 bg-white text-xs"
        >
          <option value="ALL">All Product Divisions</option>
          <option value="Automotive">Automotive</option>
          <option value="Construction & Fasteners">Construction & Chemical Anchors</option>
          <option value="Metal & Maintenance">Metal & Maintenance</option>
          <option value="Cargo & Fleet">Cargo & Marine</option>
        </select>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Inquiry Ref</th>
                <th className="px-4 py-3">Client / Company</th>
                <th className="px-4 py-3">Product Division</th>
                <th className="px-4 py-3">Requirement Details</th>
                <th className="px-4 py-3">Quote Value (LKR)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sales Consultant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No product inquiries found matching search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(inq => {
                  const salesRep = salespersons.find(s => s.id === inq.assignedSalespersonId);
                  return (
                    <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-[#CC0000]">{inq.id}</div>
                        <div className="font-mono text-[10px] text-slate-400">{inq.createdAt}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{inq.companyName}</div>
                        <div className="text-[11px] text-slate-500">{inq.contactPerson} • {inq.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                          {inq.division}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-slate-800 font-medium leading-snug">{inq.requirementDetails}</p>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 text-sm">
                        Rs. {inq.estimatedValueLkr.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={inq.status}
                          onChange={e => updateInquiryStatus(inq.id, e.target.value as InquiryStatus)}
                          className={`rounded border py-1 px-1.5 text-[11px] font-bold ${
                            inq.status === 'Converted to Order'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : inq.status === 'Quoted'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-white border-slate-300 text-slate-700'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Follow-up Required">Follow-up</option>
                          <option value="Converted to Order">Converted to Order</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700">{salesRep?.name || 'Unassigned'}</div>
                        <div className="text-[10px] font-mono text-slate-400">{salesRep?.code}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Inquiry Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register Product Quotation / Inquiry"
        subtitle="Submit commercial pricing requirement to sales consultants"
      >
        <form onSubmit={handleCreateInquiry} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Existing Customer (Optional)</label>
            <select
              value={customerId}
              onChange={e => handleSelectCustomer(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs"
            >
              <option value="">-- Direct Prospect / Unlisted Client --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.id})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Colombo Dockyard PLC"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="e.g. Jagath Dharmadasa"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Product Division *</label>
              <select
                value={division}
                onChange={e => setDivision(e.target.value as InquiryDivision)}
                className="w-full rounded border border-slate-300 bg-white py-1.5 px-2 text-xs"
              >
                <option value="Automotive">Automotive Consumables</option>
                <option value="Construction & Fasteners">Construction Chemical Anchors</option>
                <option value="Metal & Maintenance">Metal & Maintenance Tools</option>
                <option value="Cargo & Fleet">Cargo & Logistics Fleet</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Estimated Tender Value (LKR)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={e => setEstimatedValue(Number(e.target.value))}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Detailed Technical Requirement *</label>
            <textarea
              required
              rows={3}
              value={requirementDetails}
              onChange={e => setRequirementDetails(e.target.value)}
              placeholder="e.g. Stainless steel A4 DIN 933 hexagonal bolts, WIT-PE 500 chemical anchors test certificates..."
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
              Register Inquiry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
