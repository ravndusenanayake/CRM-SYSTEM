import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { Download, BarChart3, Filter } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { calls, inquiries, complaints, salespersons, users } = useCrm();
  const [reportType, setReportType] = useState<'calls' | 'inquiries' | 'complaints' | 'sales'>('calls');

  const handleExport = () => {
    const today = new Date().toISOString().split('T')[0];
    let filename = `Wurth_CRM_${reportType}_Report_${today}.csv`;
    let headers: string[] = [];
    let rows: any[] = [];

    if (reportType === 'calls') {
      headers = ['Call ID', 'Date', 'Customer/Company', 'Contact', 'Phone', 'Duration (s)', 'Outcome', 'CRM Rep'];
      rows = calls.map(c => [
        c.id,
        c.callDate,
        `"${c.companyName}"`,
        `"${c.contactName}"`,
        c.phoneNumber,
        c.durationSeconds,
        c.outcome,
        users.find(u => u.id === c.crmUserId)?.name || c.crmUserId
      ]);
    } else if (reportType === 'inquiries') {
      headers = ['Inquiry ID', 'Date', 'Company', 'Contact', 'Division', 'Value (LKR)', 'Status'];
      rows = inquiries.map(i => [
        i.id,
        i.createdAt,
        `"${i.companyName}"`,
        `"${i.contactPerson}"`,
        i.division,
        i.estimatedValueLkr,
        i.status
      ]);
    } else if (reportType === 'complaints') {
      headers = ['Complaint ID', 'Date', 'Company', 'Invoice/Ref', 'Nature', 'Priority', 'Status', 'SLA Deadline'];
      rows = complaints.map(c => [
        c.id,
        c.createdAt,
        `"${c.companyName}"`,
        c.invoiceOrItemRef,
        `"${c.nature}"`,
        c.priority,
        c.status,
        c.slaDeadline
      ]);
    } else {
      headers = ['Rep Code', 'Name', 'Region', 'Division', 'Current Sales (LKR)', 'Quarter Target (LKR)', 'Achievement %'];
      rows = salespersons.map(s => [
        s.code,
        `"${s.name}"`,
        s.region,
        s.division,
        s.currentSalesLkr,
        s.targetQuarterLkr,
        `${((s.currentSalesLkr / s.targetQuarterLkr) * 100).toFixed(1)}%`
      ]);
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Executive CRM Reports & Operational Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export comprehensive commercial operations data for management reviews, salesperson reviews, and monthly KPIs.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#CC0000] text-white text-xs font-bold hover:bg-[#B30000] shadow-xs"
        >
          <Download className="h-4 w-4" />
          <span>Export {reportType.toUpperCase()} CSV</span>
        </button>
      </div>

      {/* Select Report View */}
      <div className="flex items-center gap-2 bg-white p-3 rounded border border-slate-200 text-xs">
        <button
          onClick={() => setReportType('calls')}
          className={`px-3 py-1.5 rounded font-bold transition-colors ${
            reportType === 'calls' ? 'bg-[#CC0000] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Outbound Calls ({calls.length})
        </button>
        <button
          onClick={() => setReportType('inquiries')}
          className={`px-3 py-1.5 rounded font-bold transition-colors ${
            reportType === 'inquiries' ? 'bg-[#CC0000] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inquiries & Quotes ({inquiries.length})
        </button>
        <button
          onClick={() => setReportType('complaints')}
          className={`px-3 py-1.5 rounded font-bold transition-colors ${
            reportType === 'complaints' ? 'bg-[#CC0000] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Complaints & SLA ({complaints.length})
        </button>
        <button
          onClick={() => setReportType('sales')}
          className={`px-3 py-1.5 rounded font-bold transition-colors ${
            reportType === 'sales' ? 'bg-[#CC0000] text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Field Sales Reps ({salespersons.length})
        </button>
      </div>

      {/* Preview Table */}
      <div className="bg-white border border-slate-200 rounded p-4">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Report Preview
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-200 rounded">
          {reportType === 'calls' && (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="px-3 py-2">Call ID</th>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Duration</th>
                  <th className="px-3 py-2">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calls.map(c => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-mono font-bold">{c.id}</td>
                    <td className="px-3 py-2 font-mono">{c.callDate}</td>
                    <td className="px-3 py-2 font-bold">{c.companyName}</td>
                    <td className="px-3 py-2 font-mono">{c.durationSeconds}s</td>
                    <td className="px-3 py-2">{c.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'inquiries' && (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="px-3 py-2">Inquiry ID</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Division</th>
                  <th className="px-3 py-2">Value (LKR)</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map(i => (
                  <tr key={i.id}>
                    <td className="px-3 py-2 font-mono font-bold text-[#CC0000]">{i.id}</td>
                    <td className="px-3 py-2 font-bold">{i.companyName}</td>
                    <td className="px-3 py-2">{i.division}</td>
                    <td className="px-3 py-2 font-mono">Rs. {i.estimatedValueLkr.toLocaleString()}</td>
                    <td className="px-3 py-2">{i.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'complaints' && (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="px-3 py-2">Ticket ID</th>
                  <th className="px-3 py-2">Company</th>
                  <th className="px-3 py-2">Nature</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">SLA Deadline</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td className="px-3 py-2 font-mono font-bold text-[#CC0000]">{c.id}</td>
                    <td className="px-3 py-2 font-bold">{c.companyName}</td>
                    <td className="px-3 py-2">{c.nature}</td>
                    <td className="px-3 py-2 font-bold">{c.priority}</td>
                    <td className="px-3 py-2 font-mono">{c.slaDeadline}</td>
                    <td className="px-3 py-2">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'sales' && (
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Current Sales</th>
                  <th className="px-3 py-2">Target</th>
                  <th className="px-3 py-2">Achieved %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salespersons.map(s => (
                  <tr key={s.id}>
                    <td className="px-3 py-2 font-mono font-bold text-[#CC0000]">{s.code}</td>
                    <td className="px-3 py-2 font-bold">{s.name}</td>
                    <td className="px-3 py-2">{s.region}</td>
                    <td className="px-3 py-2 font-mono">Rs. {s.currentSalesLkr.toLocaleString()}</td>
                    <td className="px-3 py-2 font-mono">Rs. {s.targetQuarterLkr.toLocaleString()}</td>
                    <td className="px-3 py-2 font-bold font-mono">
                      {((s.currentSalesLkr / s.targetQuarterLkr) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
