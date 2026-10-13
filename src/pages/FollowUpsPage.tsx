import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Customer } from '../types/crm';
import {
  CalendarClock,
  PhoneCall,
  CheckCircle,
  Clock,
  AlertTriangle,
  Building,
  User,
  Search
} from 'lucide-react';

interface FollowUpsPageProps {
  onLogCall: (customer: Customer) => void;
  onSelectCustomer: (customerId: string) => void;
}

export const FollowUpsPage: React.FC<FollowUpsPageProps> = ({
  onLogCall,
  onSelectCustomer
}) => {
  const { customers, updateCustomer } = useCrm();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue'>('today');
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const dueToday = customers.filter(
    c => c.nextFollowUpDate && c.nextFollowUpDate === todayStr
  );

  const overdue = customers.filter(
    c => c.nextFollowUpDate && c.nextFollowUpDate < todayStr
  );

  const upcoming = customers.filter(
    c => c.nextFollowUpDate && c.nextFollowUpDate > todayStr
  );

  const currentList = activeTab === 'today' ? dueToday : activeTab === 'overdue' ? overdue : upcoming;

  const filtered = currentList.filter(
    c =>
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.mobile.includes(searchQuery)
  );

  const handleMarkComplete = (c: Customer) => {
    updateCustomer(c.id, { nextFollowUpDate: undefined });
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Customer Follow-up Task Queue</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {dueToday.length} Due Today
            </span>
            {overdue.length > 0 && (
              <span className="text-xs font-mono font-bold text-[#CC0000] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {overdue.length} Overdue
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Follow up with prospects, review quote approvals, check consumable refill requirements, and maintain account engagement.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white p-3 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activeTab === 'today'
                ? 'bg-[#CC0000] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Due Today ({dueToday.length})
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Upcoming Schedule ({upcoming.length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activeTab === 'overdue'
                ? 'bg-red-700 text-white shadow-xs'
                : 'text-red-700 hover:bg-red-50'
            }`}
          >
            Overdue ({overdue.length})
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search company, contact, city..."
            className="w-full rounded border border-slate-300 py-1 pl-8 pr-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Follow-up Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center text-slate-500 bg-white border border-slate-200 rounded">
            <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            No follow-up items in this queue.
          </div>
        ) : (
          filtered.map(cust => (
            <div
              key={cust.id}
              className="bg-white border border-slate-200 rounded p-4 hover:border-slate-300 transition-colors shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div
                      onClick={() => onSelectCustomer(cust.id)}
                      className="font-bold text-slate-900 hover:text-[#CC0000] cursor-pointer text-sm"
                    >
                      {cust.companyName}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {cust.contactPerson} • {cust.city}
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                      cust.nextFollowUpDate === todayStr
                        ? 'bg-red-50 text-[#CC0000] border-red-200'
                        : cust.nextFollowUpDate && cust.nextFollowUpDate < todayStr
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {cust.nextFollowUpDate}
                  </span>
                </div>

                <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
                  <div className="font-semibold text-slate-800 text-[10px] uppercase tracking-wider mb-0.5">
                    Account Notes / Objective
                  </div>
                  <p className="line-clamp-2">{cust.notes || 'Routine follow-up on consumable stock levels.'}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600 font-semibold">{cust.mobile}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkComplete(cust)}
                    className="px-2.5 py-1 rounded border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-medium"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => onLogCall(cust)}
                    className="flex items-center gap-1 px-3 py-1 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000] text-[11px]"
                  >
                    <PhoneCall className="h-3 w-3" />
                    <span>Call Now</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
