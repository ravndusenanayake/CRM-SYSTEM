import React, { useState, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Modal } from '../common/Modal';
import { Customer, CustomerType, CustomerStatus } from '../../types/crm';
import { AlertTriangle } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit
}) => {
  const { allCustomers, addCustomer, updateCustomer, users, salespersons, currentUser } = useCrm();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Colombo');
  const [customerType, setCustomerType] = useState<CustomerType>('Workshop');
  const [industry, setIndustry] = useState('Automotive');
  const [source, setSource] = useState('PABX Inbound');
  const [status, setStatus] = useState<CustomerStatus>('Active');
  const [assignedCrmUserId, setAssignedCrmUserId] = useState(currentUser.id);
  const [assignedSalespersonId, setAssignedSalespersonId] = useState('sales-1');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (customerToEdit) {
      setCompanyName(customerToEdit.companyName);
      setContactPerson(customerToEdit.contactPerson);
      setMobile(customerToEdit.mobile);
      setTelephone(customerToEdit.telephone || '');
      setEmail(customerToEdit.email);
      setAddress(customerToEdit.address);
      setCity(customerToEdit.city);
      setCustomerType(customerToEdit.customerType);
      setIndustry(customerToEdit.industry);
      setSource(customerToEdit.source);
      setStatus(customerToEdit.status);
      setAssignedCrmUserId(customerToEdit.assignedCrmUserId);
      setAssignedSalespersonId(customerToEdit.assignedSalespersonId);
      setNotes(customerToEdit.notes || '');
    } else {
      setCompanyName('');
      setContactPerson('');
      setMobile('+94 77 ');
      setTelephone('');
      setEmail('');
      setAddress('');
      setCity('Colombo');
      setCustomerType('Workshop');
      setIndustry('Automotive');
      setSource('PABX Inbound');
      setStatus('Active');
      setAssignedCrmUserId(currentUser.id);
      setAssignedSalespersonId(salespersons[0]?.id || 'sales-1');
      setNotes('');
    }
  }, [customerToEdit, currentUser, salespersons]);

  // Real-time duplicate phone check
  const cleanCurrentMobile = mobile.replace(/\s+/g, '');
  const duplicateMatch = cleanCurrentMobile.length >= 9
    ? allCustomers.find(c => {
        if (customerToEdit && c.id === customerToEdit.id) return false;
        const cMob = (c.mobile || '').replace(/\s+/g, '');
        const cTel = (c.telephone || '').replace(/\s+/g, '');
        return cMob && (cMob.includes(cleanCurrentMobile) || cleanCurrentMobile.includes(cMob) || (cTel && cTel.includes(cleanCurrentMobile)));
      })
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (duplicateMatch && !customerToEdit) {
      if (!window.confirm(`Warning: The number ${mobile} is already registered to ${duplicateMatch.companyName} (${duplicateMatch.id}). Do you still want to proceed?`)) {
        return;
      }
    }

    if (customerToEdit) {
      updateCustomer(customerToEdit.id, {
        companyName,
        contactPerson,
        name: contactPerson,
        mobile,
        telephone,
        email,
        address,
        city,
        customerType,
        industry,
        source,
        status,
        assignedCrmUserId,
        assignedSalespersonId,
        notes
      });
    } else {
      addCustomer({
        name: contactPerson,
        companyName,
        contactPerson,
        mobile,
        telephone,
        email,
        address,
        city,
        customerType,
        industry,
        source,
        status,
        assignedCrmUserId,
        assignedSalespersonId,
        notes
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customerToEdit ? `Edit Customer: ${customerToEdit.id}` : 'Register New Customer Account'}
      subtitle="Wurth Lanka Commercial Client Registry • Western & Regional Provinces"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {duplicateMatch && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded text-amber-900 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Duplicate Number Warning:</strong> Mobile number <strong>{mobile}</strong> is already registered to{' '}
              <strong>{duplicateMatch.companyName} ({duplicateMatch.id})</strong>.
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Company / Workshop Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              placeholder="e.g. United Motors Bodyshop"
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Contact Person & Designation *</label>
            <input
              type="text"
              required
              value={contactPerson}
              onChange={e => setContactPerson(e.target.value)}
              placeholder="e.g. Ranjith Samarasinghe (Works Manager)"
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Mobile Number *</label>
            <input
              type="text"
              required
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="+94 77 123 4567"
              className={`w-full rounded border py-1.5 px-2.5 text-xs font-mono focus:outline-hidden ${
                duplicateMatch ? 'border-amber-400 bg-amber-50/30 focus:border-amber-600' : 'border-slate-300 focus:border-[#CC0000]'
              }`}
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Landline / PBX</label>
            <input
              type="text"
              value={telephone}
              onChange={e => setTelephone(e.target.value)}
              placeholder="+94 11 251 0000"
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="service@company.lk"
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className="block font-medium text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="No. 120, Kandy Road"
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">City / Town *</label>
            <input
              type="text"
              required
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="e.g. Wattala, Kandy, Galle"
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Customer Category</label>
            <select
              value={customerType}
              onChange={e => setCustomerType(e.target.value as CustomerType)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2 text-xs"
            >
              <option value="Workshop">Workshop / Bodyshop</option>
              <option value="Fleet Operator">Fleet Operator</option>
              <option value="Construction Contractor">Construction Contractor</option>
              <option value="Marine & Industrial">Marine & Industrial</option>
              <option value="Retailer">Hardware Retailer</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Industry</label>
            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2 text-xs"
            >
              <option value="Automotive">Automotive</option>
              <option value="Construction">Construction</option>
              <option value="Metal & Fabrication">Metal & Fabrication</option>
              <option value="Marine">Marine Engineering</option>
              <option value="Transport & Logistics">Logistics / Cargo</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Acquisition Source</label>
            <select
              value={source}
              onChange={e => setSource(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2 text-xs"
            >
              <option value="PABX Inbound">PABX Inbound Call</option>
              <option value="Cold Call Outbound">Outbound Tele-Sales</option>
              <option value="Field Sales Visit">Field Sales Visit</option>
              <option value="Tender / RFQ">Tender / Trade Exhibition</option>
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Account Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as CustomerStatus)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2 text-xs font-semibold"
            >
              <option value="Active">Active Purchasing</option>
              <option value="Inactive">Inactive / Dormant</option>
              <option value="Lead">Prospective Lead</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned CRM Tele-Sales Rep *</label>
            <select
              value={assignedCrmUserId}
              onChange={e => setAssignedCrmUserId(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2 text-xs"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'ADMIN' ? 'Admin' : `Ext ${u.extension}`})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Field Sales Consultant *</label>
            <select
              value={assignedSalespersonId}
              onChange={e => setAssignedSalespersonId(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white py-1.5 px-2 text-xs"
            >
              {salespersons.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code} • {s.region})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Consumables & Product Requirements Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Uses Würth Zebra tools, chemical anchors, brake cleaner, dry sanding discs..."
            className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>

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
            {customerToEdit ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
