import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Salesperson, Customer } from '../types/crm';
import {
  MapPin,
  Phone,
  Mail,
  Users,
  Search,
  ExternalLink,
  X,
  Building2,
  Eye,
  ArrowRight,
  Filter
} from 'lucide-react';

interface SalespersonsPageProps {
  onSelectCustomer?: (customerId: string) => void;
  onNavigateToCustomers?: (salespersonId: string) => void;
}

export const SalespersonsPage: React.FC<SalespersonsPageProps> = ({
  onSelectCustomer,
  onNavigateToCustomers
}) => {
  const { salespersons, customers } = useCrm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRepForAccounts, setSelectedRepForAccounts] = useState<Salesperson | null>(null);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');

  const filtered = salespersons.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.division.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Accounts for selected salesperson
  const repAssignedCustomers: Customer[] = selectedRepForAccounts
    ? customers.filter(c => c.assignedSalespersonId === selectedRepForAccounts.id)
    : [];

  const filteredRepCustomers = repAssignedCustomers.filter(c => {
    const q = accountSearchQuery.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      c.contactPerson.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const totalOutstanding = repAssignedCustomers.reduce(
    (sum, c) => sum + (c.outstandingBalanceLkr || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Wurth Field Sales Force Management</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {salespersons.length} Sales Consultants
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Regional territory allocation across Western, Central, Southern, and North Western provinces of Sri Lanka.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 rounded border border-slate-200 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search salesperson name, code, region..."
            className="w-full rounded border border-slate-300 py-1 pl-8 pr-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Sales Consultants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(rep => {
          const repCustomers = customers.filter(c => c.assignedSalespersonId === rep.id);
          const target = rep.targetQuarterLkr || (rep.monthlyTargetLkr ? rep.monthlyTargetLkr * 3 : 10000000);
          const currentSales = rep.currentSalesLkr || 0;
          const percent = target > 0 ? Math.min(100, Math.round((currentSales / target) * 100)) : 0;

          return (
            <div
              key={rep.id}
              className="bg-white border border-slate-200 rounded p-4 hover:border-slate-300 transition-colors shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-bold bg-[#CC0000] text-white px-1.5 py-0.5 rounded">
                      {rep.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{rep.name}</h3>
                    <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      <span>{rep.region}</span>
                    </div>
                  </div>

                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                    {rep.division}
                  </span>
                </div>

                {/* Sales Target Progress Bar */}
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Q3 Target Achievement</span>
                    <span className="font-bold text-slate-900 font-mono">{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent >= 90 ? 'bg-emerald-600' : 'bg-[#CC0000]'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1 font-mono">
                    <span>Rs. {(currentSales / 1000000).toFixed(2)}M</span>
                    <span>Rs. {(target / 1000000).toFixed(2)}M Target</span>
                  </div>
                </div>

                {/* Account Count & Contact */}
                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  {/* Clickable Assigned Accounts Row */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded border border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Users className="h-3.5 w-3.5 text-slate-500" />
                      Assigned Accounts:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRepForAccounts(rep);
                        setAccountSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 hover:bg-[#CC0000] text-[#CC0000] hover:text-white rounded border border-red-200 hover:border-[#CC0000] font-bold font-mono text-[11px] transition-colors cursor-pointer group shadow-2xs"
                      title={`Click to view ${repCustomers.length} accounts assigned to ${rep.name}`}
                    >
                      <span>{repCustomers.length} Accounts</span>
                      <ExternalLink className="h-3 w-3 opacity-70 group-hover:opacity-100" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] px-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span className="font-mono text-slate-700">{rep.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] px-1">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-500 truncate">{rep.email}</span>
                  </div>
                </div>
              </div>

              {/* Action Button: View Assigned Accounts */}
              <button
                type="button"
                onClick={() => {
                  setSelectedRepForAccounts(rep);
                  setAccountSearchQuery('');
                }}
                className="mt-4 w-full py-2 px-3 text-xs font-semibold rounded bg-slate-100 hover:bg-[#CC0000] text-slate-700 hover:text-white border border-slate-200 hover:border-[#CC0000] transition-colors flex items-center justify-center gap-2 cursor-pointer group shadow-2xs"
              >
                <Users className="h-3.5 w-3.5 text-slate-500 group-hover:text-white transition-colors" />
                <span>View Assigned Accounts ({repCustomers.length})</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal: View Assigned Customer Accounts */}
      {selectedRepForAccounts && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-[#CC0000] text-white px-2 py-0.5 rounded">
                    {selectedRepForAccounts.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Assigned Accounts: {selectedRepForAccounts.name}
                  </h3>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {selectedRepForAccounts.division}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {selectedRepForAccounts.region}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {selectedRepForAccounts.phone}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {selectedRepForAccounts.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRepForAccounts(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal KPI Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 sm:p-4 bg-white border-b border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Accounts</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {repAssignedCustomers.length}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Clients</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {repAssignedCustomers.filter(c => c.status === 'Active' || c.status === 'ACTIVE').length}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Outstanding</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  Rs. {totalOutstanding.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center">
                {onNavigateToCustomers && (
                  <button
                    type="button"
                    onClick={() => {
                      const repId = selectedRepForAccounts.id;
                      setSelectedRepForAccounts(null);
                      onNavigateToCustomers(repId);
                    }}
                    className="w-full h-full py-2 px-3 text-xs font-semibold rounded bg-red-50 hover:bg-[#CC0000] text-[#CC0000] hover:text-white border border-red-200 hover:border-[#CC0000] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Open full Customers management page filtered to this salesperson"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    <span>Open in Customers Page</span>
                  </button>
                )}
              </div>
            </div>

            {/* Search Input inside Modal */}
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={accountSearchQuery}
                  onChange={e => setAccountSearchQuery(e.target.value)}
                  placeholder="Search customer name, company, phone, city within this salesperson..."
                  className="w-full rounded border border-slate-300 py-1.5 pl-9 pr-3 text-xs focus:border-[#CC0000] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Customer List / Table */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {filteredRepCustomers.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">No customer accounts found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {accountSearchQuery
                      ? 'Try clearing your search query'
                      : 'No customer accounts are currently assigned to this salesperson.'}
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3.5 py-2.5">Company & Account</th>
                        <th className="px-3.5 py-2.5">Contact Person</th>
                        <th className="px-3.5 py-2.5">Phone & City</th>
                        <th className="px-3.5 py-2.5">Category</th>
                        <th className="px-3.5 py-2.5">Status</th>
                        <th className="px-3.5 py-2.5 text-right">Outstanding (LKR)</th>
                        <th className="px-3.5 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredRepCustomers.map(cust => (
                        <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-3.5 py-2.5">
                            <div className="font-bold text-slate-900">{cust.companyName}</div>
                            <div className="font-mono text-[10px] text-slate-400">{cust.id}</div>
                          </td>
                          <td className="px-3.5 py-2.5 font-medium text-slate-700">
                            {cust.contactPerson}
                          </td>
                          <td className="px-3.5 py-2.5">
                            <div className="font-mono text-slate-700">{cust.mobile}</div>
                            <div className="text-[11px] text-slate-400">{cust.city}</div>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium border border-slate-200">
                              {cust.customerType}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                cust.status === 'Active' || cust.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {cust.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-right font-mono font-medium text-slate-800">
                            Rs. {(cust.outstandingBalanceLkr || 0).toLocaleString()}
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            {onSelectCustomer && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedRepForAccounts(null);
                                  onSelectCustomer(cust.id);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-[#CC0000] text-[#CC0000] hover:text-white rounded border border-red-200 hover:border-[#CC0000] font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                                title="Open full customer profile, visit notes, and call history"
                              >
                                <Eye className="h-3 w-3" />
                                <span>View Details</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Showing {filteredRepCustomers.length} of {repAssignedCustomers.length} customer accounts
              </span>
              <button
                type="button"
                onClick={() => setSelectedRepForAccounts(null)}
                className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded font-semibold text-xs cursor-pointer transition-colors shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
