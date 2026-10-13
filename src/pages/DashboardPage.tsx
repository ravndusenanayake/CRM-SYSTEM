import React from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Users,
  Target,
  PhoneCall,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle,
  PhoneOutgoing
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (module: string) => void;
  onOpenLogCall: () => void;
  onSelectCustomer: (customerId: string) => void;
  onOpenNewLead: () => void;
  onOpenNewCustomer: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenLogCall,
  onSelectCustomer,
  onOpenNewLead,
  onOpenNewCustomer
}) => {
  const {
    currentUser,
    customers,
    leads,
    calls,
    complaints,
    inquiries
  } = useCrm();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calls made today by current user
  const todayCalls = calls.filter(
    c => c.crmUserId === currentUser.id && c.callDate.startsWith(todayStr)
  );

  const targetCalls = currentUser.dailyCallTarget || 35;
  const targetProgress = Math.min(100, Math.round((todayCalls.length / targetCalls) * 100));

  // Open complaints
  const openComplaints = complaints.filter(
    c => c.status === 'Open' || c.status === 'Under Investigation'
  );

  // Total pipeline value in LKR
  const totalPipelineLkr = inquiries
    .filter(i => i.status !== 'Cancelled')
    .reduce((sum, i) => sum + i.estimatedValueLkr, 0);

  // Due followups today
  const dueFollowupsToday = customers.filter(
    c => c.nextFollowUpDate && c.nextFollowUpDate <= todayStr
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="bg-white border border-slate-200 rounded p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#CC0000] tracking-wider uppercase font-mono">
              Wurth Lanka Commercial Operations
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500 font-mono">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Welcome back, {currentUser.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active Workspace: {currentUser.role === 'ADMIN' ? 'Full Commercial Administrator' : `CRM Tele-Sales • Ext ${currentUser.extension}`}
          </p>
        </div>

        {/* Daily Call Target Widget */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 min-w-[240px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-700">Daily Call Target</span>
            <span className="font-mono font-bold text-[#CC0000]">
              {todayCalls.length} / {targetCalls} Calls
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#CC0000] h-full rounded-full transition-all duration-500"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
            <span>{targetProgress}% Quota Achieved</span>
            <span>{Math.max(0, targetCalls - todayCalls.length)} Remaining</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
          onClick={() => onNavigate('Customers')}
          className="bg-white border border-slate-200 p-4 rounded cursor-pointer hover:border-[#CC0000] transition-colors group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#CC0000]">
            <span className="text-xs font-semibold text-slate-600">Active Accounts</span>
            <Users className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{customers.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Managed Customers</div>
        </div>

        <div
          onClick={() => onNavigate('Leads')}
          className="bg-white border border-slate-200 p-4 rounded cursor-pointer hover:border-[#CC0000] transition-colors group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#CC0000]">
            <span className="text-xs font-semibold text-slate-600">Active Leads</span>
            <Target className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{leads.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">In Conversion Funnel</div>
        </div>

        <div
          onClick={() => onNavigate('Outbound Calls')}
          className="bg-white border border-slate-200 p-4 rounded cursor-pointer hover:border-[#CC0000] transition-colors group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#CC0000]">
            <span className="text-xs font-semibold text-slate-600">Calls Today</span>
            <PhoneCall className="h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">{todayCalls.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Logged Tele-calls</div>
        </div>

        <div
          onClick={() => onNavigate('Complaints')}
          className="bg-white border border-slate-200 p-4 rounded cursor-pointer hover:border-[#CC0000] transition-colors group shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#CC0000]">
            <span className="text-xs font-semibold text-slate-600">Open Complaints</span>
            <AlertTriangle className="h-4 w-4 text-[#CC0000]" />
          </div>
          <div className="text-2xl font-bold text-[#CC0000] mt-2 font-mono">
            {openComplaints.length}
          </div>
          <div className="text-[11px] text-red-600 mt-1 font-semibold">SLA Tracked</div>
        </div>

        <div
          onClick={() => onNavigate('Inquiries')}
          className="bg-white border border-slate-200 p-4 rounded cursor-pointer hover:border-[#CC0000] transition-colors group shadow-xs col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-[#CC0000]">
            <span className="text-xs font-semibold text-slate-600">Inquiry Value</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 mt-2 font-mono truncate">
            Rs. {(totalPipelineLkr / 1000000).toFixed(1)}M
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-semibold">Tenders & RFQs</div>
        </div>
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="bg-white border border-slate-200 p-4 rounded flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-slate-700 mr-2">Quick Actions:</span>
        <button
          onClick={onOpenLogCall}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#CC0000] text-white font-semibold hover:bg-[#B30000] transition-colors shadow-xs"
        >
          <PhoneOutgoing className="h-3.5 w-3.5" />
          <span>Record Outbound Call</span>
        </button>
        <button
          onClick={onOpenNewCustomer}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-slate-500" />
          <span>New Customer</span>
        </button>
        <button
          onClick={onOpenNewLead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
        >
          <Plus className="h-3.5 w-3.5 text-slate-500" />
          <span>Register Lead</span>
        </button>
        <button
          onClick={() => onNavigate('Customer Import')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors ml-auto"
        >
          <span>Bulk CSV Import</span>
        </button>
      </div>

      {/* Two-Column Priority Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Due Follow-ups Today */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#CC0000]" />
              <h3 className="font-bold text-slate-900 text-xs">Follow-ups Due Today</h3>
              <span className="bg-red-50 text-[#CC0000] text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-200">
                {dueFollowupsToday.length}
              </span>
            </div>
            <button
              onClick={() => onNavigate('Follow-ups')}
              className="text-[11px] font-semibold text-[#CC0000] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {dueFollowupsToday.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                No follow-ups due today. You are all caught up!
              </div>
            ) : (
              dueFollowupsToday.slice(0, 4).map(c => (
                <div key={c.id} className="p-3 hover:bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{c.companyName}</div>
                    <div className="text-[11px] text-slate-500">
                      {c.contactPerson} • {c.mobile} • {c.city}
                    </div>
                  </div>
                  <button
                    onClick={() => onSelectCustomer(c.id)}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 text-[11px] font-semibold hover:bg-slate-100"
                  >
                    Open Account
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaints SLA Watchlist */}
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#CC0000]" />
              <h3 className="font-bold text-slate-900 text-xs">Active Complaints SLA Radar</h3>
              <span className="bg-red-50 text-[#CC0000] text-[10px] font-bold px-1.5 py-0.2 rounded border border-red-200">
                {openComplaints.length}
              </span>
            </div>
            <button
              onClick={() => onNavigate('Complaints')}
              className="text-[11px] font-semibold text-[#CC0000] hover:underline flex items-center gap-1"
            >
              <span>Manage Tickets</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {openComplaints.length === 0 ? (
              <div className="p-6 text-center text-slate-500">
                No active complaints. Outstanding quality performance!
              </div>
            ) : (
              openComplaints.slice(0, 3).map(cmp => (
                <div key={cmp.id} className="p-3 hover:bg-red-50/30">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[#CC0000]">{cmp.id}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-[#CC0000]">
                      {cmp.priority}
                    </span>
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5">{cmp.companyName}</div>
                  <p className="text-slate-600 text-[11px] mt-0.5 truncate">{cmp.description}</p>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    SLA Deadline: {cmp.slaDeadline}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
