import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { PabxRecord } from '../types/crm';
import { Modal } from '../components/common/Modal';
import {
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  UserPlus,
  Search,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface PabxImportPageProps {
  onOpenLogCallForCustomer?: (customerId: string) => void;
  onOpenNewLeadWithPhone?: (phone: string) => void;
}

export const PabxImportPage: React.FC<PabxImportPageProps> = () => {
  const { pabxRecords, convertPabxRecordToLead } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState('ALL');
  const [selectedPabx, setSelectedPabx] = useState<PabxRecord | null>(null);
  const [leadCompany, setLeadCompany] = useState('');
  const [leadContact, setLeadContact] = useState('');

  const filtered = pabxRecords.filter(p => {
    const matchesSearch =
      p.externalNumber.includes(searchQuery) ||
      p.extension.includes(searchQuery) ||
      (p.matchedCompanyName && p.matchedCompanyName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDirection = directionFilter === 'ALL' || p.direction === directionFilter;
    return matchesSearch && matchesDirection;
  });

  const handleOpenLeadModal = (cdr: PabxRecord) => {
    setSelectedPabx(cdr);
    setLeadCompany(cdr.matchedCompanyName || 'Inbound Prospect Company');
    setLeadContact(cdr.matchedCustomerName || 'Inbound Caller');
  };

  const handleConvertLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPabx) return;
    convertPabxRecordToLead(selectedPabx.id, leadCompany, leadContact);
    setSelectedPabx(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>PABX Telephony CDR Integration</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {pabxRecords.length} Logged PBX Calls
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Synchronize Wurth Lanka Head Office PBX call logs, automatically match caller IDs to accounts, and detect new lead inquiries.
          </p>
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
            placeholder="Search external number, extension, matched customer..."
            className="w-full rounded border border-slate-300 py-1.5 pl-8 pr-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
          />
        </div>

        <select
          value={directionFilter}
          onChange={e => setDirectionFilter(e.target.value)}
          className="rounded border border-slate-300 py-1.5 px-2 bg-white text-xs"
        >
          <option value="ALL">All Directions</option>
          <option value="Inbound">Inbound Calls</option>
          <option value="Outbound">Outbound Calls</option>
        </select>
      </div>

      {/* PABX Records Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">CDR ID & Timestamp</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">PBX Ext</th>
                <th className="px-4 py-3">External Number</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Matched Account</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(cdr => {
                const isMatched = !!cdr.matchedCustomerId;
                const isConverted = !!cdr.isLeadConverted;

                return (
                  <tr key={cdr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900">{cdr.id}</div>
                      <div className="font-mono text-[10px] text-slate-400">{cdr.callTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {cdr.direction === 'Inbound' ? (
                          <PhoneIncoming className="h-3.5 w-3.5 text-blue-600" />
                        ) : (
                          <PhoneOutgoing className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        <span className="font-semibold text-slate-800">{cdr.direction}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 font-semibold">
                      Ext {cdr.extension}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-900 font-bold">
                      {cdr.externalNumber}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {Math.floor(cdr.durationSeconds / 60)}m {cdr.durationSeconds % 60}s
                    </td>
                    <td className="px-4 py-3">
                      {isMatched ? (
                        <div>
                          <div className="font-bold text-slate-900">{cdr.matchedCompanyName}</div>
                          <div className="text-[10px] text-slate-500">{cdr.matchedCustomerName}</div>
                        </div>
                      ) : isConverted ? (
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                          Converted to Lead
                        </span>
                      ) : (
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                          Unrecognized Number
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!isMatched && !isConverted ? (
                        <button
                          onClick={() => handleOpenLeadModal(cdr)}
                          className="flex items-center gap-1 ml-auto px-2.5 py-1 rounded bg-[#CC0000] text-white font-bold text-[11px] hover:bg-[#B30000] shadow-xs"
                        >
                          <UserPlus className="h-3 w-3" />
                          <span>Auto Register Lead</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">Matched</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Convert to Lead Modal */}
      {selectedPabx && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedPabx(null)}
          title="Promote Inbound PBX Caller to Trade Lead"
          subtitle={`Caller Number: ${selectedPabx.externalNumber} • Ext: ${selectedPabx.extension}`}
        >
          <form onSubmit={handleConvertLead} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company / Workshop Name *</label>
              <input
                type="text"
                required
                value={leadCompany}
                onChange={e => setLeadCompany(e.target.value)}
                placeholder="e.g. Apex Marine Bodyshop"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={leadContact}
                onChange={e => setLeadContact(e.target.value)}
                placeholder="e.g. Priyantha Ekanayake"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPabx(null)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000]"
              >
                Register as Active Lead
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
