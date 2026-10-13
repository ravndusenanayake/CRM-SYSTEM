import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Customer } from '../types/crm';
import {
  Search,
  Plus,
  Download,
  PhoneCall,
  Edit,
  Trash2,
  Eye,
  Filter
} from 'lucide-react';

interface CustomersPageProps {
  onOpenNewCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onSelectCustomer: (customerId: string) => void;
  onLogCallForCustomer: (customer: Customer) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  onOpenNewCustomer,
  onEditCustomer,
  onSelectCustomer,
  onLogCallForCustomer
}) => {
  const { customers, deleteCustomer, salespersons, users } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [salespersonFilter, setSalespersonFilter] = useState('ALL');

  const filtered = customers.filter(c => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || c.customerType === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSales = salespersonFilter === 'ALL' || c.assignedSalespersonId === salespersonFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesSales;
  });

  const exportCsv = () => {
    const headers = [
      'Customer ID',
      'Company Name',
      'Contact Person',
      'Mobile',
      'Telephone',
      'Email',
      'Address',
      'City',
      'Type',
      'Industry',
      'Status',
      'Last Contact',
      'Next Follow-up'
    ];

    const rows = filtered.map(c => [
      c.id,
      `"${c.companyName}"`,
      `"${c.contactPerson}"`,
      c.mobile,
      c.telephone || '',
      c.email,
      `"${c.address}"`,
      c.city,
      c.customerType,
      c.industry,
      c.status,
      c.lastContactDate || '',
      c.nextFollowUpDate || ''
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Wurth_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Management Database</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {filtered.length} Accounts
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automotive workshops, body shops, cargo fleets, and industrial clients across Sri Lanka.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#CC0000] text-white text-xs font-bold hover:bg-[#B30000] shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search company, contact, phone, city..."
            className="w-full rounded border border-slate-300 py-1.5 pl-8 pr-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded border border-slate-300 py-1.5 px-2 bg-white text-xs"
        >
          <option value="ALL">All Categories</option>
          <option value="Workshop">Workshops</option>
          <option value="Fleet Operator">Fleet Operators</option>
          <option value="Construction Contractor">Construction</option>
          <option value="Marine & Industrial">Marine & Industrial</option>
          <option value="Retailer">Retailers</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="rounded border border-slate-300 py-1.5 px-2 bg-white text-xs"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Lead">Lead</option>
        </select>

        <select
          value={salespersonFilter}
          onChange={e => setSalespersonFilter(e.target.value)}
          className="rounded border border-slate-300 py-1.5 px-2 bg-white text-xs"
        >
          <option value="ALL">All Sales Reps</option>
          {salespersons.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.code})
            </option>
          ))}
        </select>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Account</th>
                <th className="px-4 py-3">Contact Person</th>
                <th className="px-4 py-3">Phone & City</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Sales Rep</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Next Follow-up</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No customers match the current search or filters.
                  </td>
                </tr>
              ) : (
                filtered.map(cust => {
                  const salesRep = salespersons.find(s => s.id === cust.assignedSalespersonId);
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div
                          onClick={() => onSelectCustomer(cust.id)}
                          className="font-bold text-slate-900 hover:text-[#CC0000] cursor-pointer"
                        >
                          {cust.companyName}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">{cust.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{cust.contactPerson}</div>
                        <div className="text-[10px] text-slate-400">{cust.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-slate-700">{cust.mobile}</div>
                        <div className="text-[10px] text-slate-400">{cust.city}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                          {cust.customerType}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-700">
                          {salesRep?.name || 'Unassigned'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">{salesRep?.code}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cust.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {cust.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px]">
                        {cust.nextFollowUpDate ? (
                          <span className="font-semibold text-[#CC0000]">
                            {cust.nextFollowUpDate}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="Log Call"
                            onClick={() => onLogCallForCustomer(cust)}
                            className="p-1 rounded text-slate-500 hover:text-[#CC0000] hover:bg-red-50"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="View Profile 360"
                            onClick={() => onSelectCustomer(cust.id)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => onEditCustomer(cust)}
                            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => {
                              if (window.confirm(`Delete ${cust.companyName}?`)) {
                                deleteCustomer(cust.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
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
    </div>
  );
};
