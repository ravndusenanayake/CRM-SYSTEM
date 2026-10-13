import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Salesperson } from '../types/crm';
import {
  Briefcase,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  Users,
  Search
} from 'lucide-react';

interface SalespersonsPageProps {
  onSelectCustomer?: (customerId: string) => void;
}

export const SalespersonsPage: React.FC<SalespersonsPageProps> = () => {
  const { salespersons, customers } = useCrm();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = salespersons.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.division.toLowerCase().includes(searchQuery.toLowerCase())
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
          const percent = Math.min(
            100,
            Math.round((rep.currentSalesLkr / rep.targetQuarterLkr) * 100)
          );

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
                    <span>Rs. {(rep.currentSalesLkr / 1000000).toFixed(2)}M</span>
                    <span>Rs. {(rep.targetQuarterLkr / 1000000).toFixed(2)}M Target</span>
                  </div>
                </div>

                {/* Account Count & Contact */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Users className="h-3 w-3" />
                      Assigned Accounts:
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{repCustomers.length} Accounts</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span className="font-mono text-slate-700">{rep.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Mail className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-500 truncate">{rep.email}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
