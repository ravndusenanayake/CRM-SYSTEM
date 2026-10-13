import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { CallRecord } from '../types/crm';
import {
  PhoneCall,
  Plus,
  Search,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  FileQuestion,
  CheckCircle2
} from 'lucide-react';

interface OutboundCallsPageProps {
  onOpenLogCall: () => void;
  onSelectCustomer: (customerId: string) => void;
}

export const OutboundCallsPage: React.FC<OutboundCallsPageProps> = ({
  onOpenLogCall,
  onSelectCustomer
}) => {
  const { calls, users } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('ALL');

  const filtered = calls.filter(c => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery) ||
      c.notes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOutcome = outcomeFilter === 'ALL' || c.outcome === outcomeFilter;
    return matchesSearch && matchesOutcome;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Outbound Call Records & Telephony Log</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {filtered.length} Logged Calls
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time PBX telephony logs, tele-sales outreach, customer feedback, and follow-up schedules.
          </p>
        </div>

        <button
          onClick={onOpenLogCall}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#CC0000] text-white text-xs font-bold hover:bg-[#B30000] shadow-xs transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Record Outbound Call</span>
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
            placeholder="Search company, phone, discussion notes..."
            className="w-full rounded border border-slate-300 py-1.5 pl-8 pr-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>

        <select
          value={outcomeFilter}
          onChange={e => setOutcomeFilter(e.target.value)}
          className="rounded border border-slate-300 py-1.5 px-2 bg-white text-xs"
        >
          <option value="ALL">All Outcomes</option>
          <option value="Answered - Positive">Positive Refill / Interest</option>
          <option value="Answered - Follow-up Needed">Follow-up Needed</option>
          <option value="Answered - Complaint Raised">Complaint Raised</option>
          <option value="Answered - Inquiry Created">Inquiry Created</option>
          <option value="No Answer">No Answer</option>
          <option value="Busy">Line Busy</option>
        </select>
      </div>

      {/* Calls Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Call Ref & Time</th>
                <th className="px-4 py-3">Client & Contact</th>
                <th className="px-4 py-3">Phone Dialed</th>
                <th className="px-4 py-3">Talk-Time</th>
                <th className="px-4 py-3">Outcome</th>
                <th className="px-4 py-3">Discussion Summary</th>
                <th className="px-4 py-3">CRM Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No calls match the search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(call => {
                  const rep = users.find(u => u.id === call.crmUserId);
                  return (
                    <tr key={call.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{call.id}</div>
                        <div className="text-[10px] font-mono text-slate-400">{call.callDate}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          onClick={() => call.customerId && onSelectCustomer(call.customerId)}
                          className={`font-bold text-slate-900 ${
                            call.customerId ? 'hover:text-[#CC0000] cursor-pointer' : ''
                          }`}
                        >
                          {call.companyName}
                        </div>
                        <div className="text-[11px] text-slate-500">{call.contactName}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {call.phoneNumber}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            call.outcome.includes('Positive')
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : call.outcome.includes('Complaint')
                              ? 'bg-red-50 text-[#CC0000] border border-red-200'
                              : call.outcome.includes('Inquiry')
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {call.outcome}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-w-sm">
                        <p className="text-slate-700 leading-snug line-clamp-2">{call.notes}</p>
                        {call.nextFollowUpDate && (
                          <div className="text-[10px] text-[#CC0000] font-mono font-semibold mt-0.5">
                            Follow-up: {call.nextFollowUpDate}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{rep?.name || 'Agent'}</div>
                        <div className="text-[10px] font-mono text-slate-400">Ext {rep?.extension}</div>
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
