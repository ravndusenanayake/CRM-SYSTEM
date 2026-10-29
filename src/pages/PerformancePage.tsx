import React, { useState, useMemo } from 'react';
import { useCrm } from '../context/CrmContext';
import { User, CallRecord } from '../types/crm';
import {
  TrendingUp,
  PhoneCall,
  CheckCircle,
  Clock,
  Award,
  Search,
  Users,
  Calendar,
  Filter,
  Plus,
  ExternalLink,
  X,
  AlertCircle,
  BarChart3,
  Building2,
  Eye,
  PhoneForwarded,
  ArrowRight
} from 'lucide-react';

interface PerformancePageProps {
  onSelectCustomer?: (customerId: string) => void;
  onOpenLogCall?: () => void;
}

type TimeframeOption = 'today' | 'week' | 'month' | 'all';

export const PerformancePage: React.FC<PerformancePageProps> = ({
  onSelectCustomer,
  onOpenLogCall
}) => {
  const { users, calls, inquiries, complaints } = useCrm();
  const [timeframe, setTimeframe] = useState<TimeframeOption>('today');
  const [viewMode, setViewMode] = useState<'cards' | 'leaderboard'>('cards');
  const [selectedAgentForModal, setSelectedAgentForModal] = useState<User | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const crmUsers = useMemo(() => users.filter(u => u.role === 'CRM_USER'), [users]);

  // Current date constants
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // "YYYY-MM"

  // Filter calls by timeframe
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      const callDateStr = c.callDate || '';
      if (timeframe === 'all') return true;
      if (timeframe === 'today') {
        return callDateStr.startsWith(todayStr);
      }
      if (timeframe === 'week') {
        const datePart = callDateStr.substring(0, 10);
        return datePart >= sevenDaysAgo && datePart <= todayStr;
      }
      if (timeframe === 'month') {
        return callDateStr.startsWith(currentMonthPrefix);
      }
      return true;
    });
  }, [calls, timeframe, todayStr, sevenDaysAgo, currentMonthPrefix]);

  // Target multiplier per timeframe
  const targetMultiplier = timeframe === 'today' ? 1 : timeframe === 'week' ? 5 : 22;

  // Aggregate Team KPIs
  const teamAggregateTarget = crmUsers.reduce((sum, u) => sum + ((u.dailyCallTarget || 35) * targetMultiplier), 0);
  const totalCallsCount = filteredCalls.length;
  const teamQuotaPercent = teamAggregateTarget > 0 ? Math.min(100, Math.round((totalCallsCount / teamAggregateTarget) * 100)) : 0;

  const answeredCalls = filteredCalls.filter(c => c.durationSeconds > 0 && !c.outcome.toLowerCase().includes('no answer') && !c.outcome.toLowerCase().includes('busy'));
  const connectionRate = totalCallsCount > 0 ? Math.round((answeredCalls.length / totalCallsCount) * 100) : 0;

  const productiveCalls = filteredCalls.filter(c => {
    const o = (c.outcome || '').toLowerCase();
    return o.includes('positive') || o.includes('inquir') || o.includes('order') || o.includes('demo') || o.includes('follow-up');
  });
  const productiveRate = totalCallsCount > 0 ? Math.round((productiveCalls.length / totalCallsCount) * 100) : 0;

  const teamTotalDuration = filteredCalls.reduce((sum, c) => sum + (c.durationSeconds || 0), 0);
  const avgTeamCallDuration = totalCallsCount > 0 ? Math.round(teamTotalDuration / totalCallsCount) : 0;

  const inquiriesGenerated = filteredCalls.filter(c => c.linkedInquiryId || c.outcome.toLowerCase().includes('inquiry') || c.outcome.toLowerCase().includes('order'));
  const complaintsLogged = filteredCalls.filter(c => c.linkedComplaintId || c.outcome.toLowerCase().includes('complaint'));

  // Call Outcomes Breakdown
  const outcomesCount = useMemo(() => {
    const map: Record<string, number> = {
      positive: 0,
      inquiry: 0,
      followup: 0,
      complaint: 0,
      unreached: 0
    };
    filteredCalls.forEach(c => {
      const o = (c.outcome || '').toLowerCase();
      if (o.includes('complaint')) map.complaint++;
      else if (o.includes('inquir') || o.includes('order')) map.inquiry++;
      else if (o.includes('positive') || o.includes('demo')) map.positive++;
      else if (o.includes('follow-up') || o.includes('needed')) map.followup++;
      else map.unreached++;
    });
    return map;
  }, [filteredCalls]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m >= 60) {
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM}m`;
    }
    return `${m}m ${s}s`;
  };

  // Agent call history modal data
  const selectedAgentCalls = useMemo(() => {
    if (!selectedAgentForModal) return [];
    return filteredCalls.filter(c => c.crmUserId === selectedAgentForModal.id);
  }, [selectedAgentForModal, filteredCalls]);

  const filteredModalCalls = useMemo(() => {
    const q = modalSearchQuery.toLowerCase();
    return selectedAgentCalls.filter(c =>
      c.contactName.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.phoneNumber.includes(q) ||
      c.outcome.toLowerCase().includes(q) ||
      c.notes.toLowerCase().includes(q)
    );
  }, [selectedAgentCalls, modalSearchQuery]);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>CRM Team Outbound Performance & KPI Analytics</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {crmUsers.length} Tele-Agents
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational telemetry for Wurth Lanka tele-sales, customer retention, inquiry conversions, and SLA resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Timeframe Filter Buttons */}
          <div className="flex items-center bg-slate-100 rounded p-0.5 border border-slate-200 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                timeframe === 'today' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                timeframe === 'week' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                timeframe === 'month' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                timeframe === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Record Call Button */}
          {onOpenLogCall && (
            <button
              type="button"
              onClick={onOpenLogCall}
              className="px-3 py-1.5 rounded bg-[#CC0000] hover:bg-[#990000] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record Call</span>
            </button>
          )}
        </div>
      </div>

      {/* Date Indicator Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 bg-white px-4 py-2 rounded border border-slate-200">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>
            Active Telemetry Period:{' '}
            <strong className="text-slate-800">
              {timeframe === 'today'
                ? `Today (${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})`
                : timeframe === 'week'
                ? `Last 7 Days (${new Date(now.getTime() - 7 * 86400000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})`
                : timeframe === 'month'
                ? `Current Month (${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })})`
                : 'All Recorded CRM Outbound Calls'}
            </strong>
          </span>
        </div>

        {/* View Switcher: Cards vs Table */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-0.5 rounded cursor-pointer font-medium transition-colors ${
              viewMode === 'cards' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500'
            }`}
          >
            Agent Cards
          </button>
          <button
            type="button"
            onClick={() => setViewMode('leaderboard')}
            className={`px-2.5 py-0.5 rounded cursor-pointer font-medium transition-colors ${
              viewMode === 'leaderboard' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-500'
            }`}
          >
            Leaderboard Table
          </button>
        </div>
      </div>

      {/* Team KPI Overview (5 Modern Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Total Calls */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Total Calls</span>
            <PhoneCall className="h-4 w-4 text-[#CC0000]" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalCallsCount}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Quota: {teamAggregateTarget}</span>
            <span className="font-bold text-[#CC0000] font-mono">{teamQuotaPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-[#CC0000] h-full rounded-full transition-all duration-500"
              style={{ width: `${teamQuotaPercent}%` }}
            />
          </div>
        </div>

        {/* Connection Rate */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Connected Rate</span>
            <PhoneForwarded className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600">{connectionRate}%</div>
          <div className="text-[11px] text-slate-500">
            {answeredCalls.length} answered / {totalCallsCount} total
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${connectionRate}%` }}
            />
          </div>
        </div>

        {/* Productive Rate */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Productive Rate</span>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-600">{productiveRate}%</div>
          <div className="text-[11px] text-slate-500">
            {productiveCalls.length} positive / order discussions
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${productiveRate}%` }}
            />
          </div>
        </div>

        {/* Inquiries Generated */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Inquiries Raised</span>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{inquiriesGenerated.length}</div>
          <div className="text-[11px] text-slate-500">
            Commercial pipeline leads created
          </div>
          <div className="text-[10px] text-amber-700 font-mono font-medium">
            Tenders & bulk quotes
          </div>
        </div>

        {/* Total Talk Time */}
        <div className="bg-white p-3.5 rounded border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Team Talk-Time</span>
            <Clock className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{formatDuration(teamTotalDuration)}</div>
          <div className="text-[11px] text-slate-500">
            Avg Handling Time: <strong className="font-mono text-slate-700">{formatDuration(avgTeamCallDuration)}</strong>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Complaints logged: {complaintsLogged.length}
          </div>
        </div>
      </div>

      {/* Call Disposition & Outcomes Distribution Bar */}
      <div className="bg-white p-4 rounded border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-[#CC0000]" />
            <span>Call Disposition Breakdown ({filteredCalls.length} Total Calls)</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Answered {connectionRate}% • Unreached {100 - connectionRate}%
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
          {totalCallsCount > 0 ? (
            <>
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{ width: `${(outcomesCount.positive / totalCallsCount) * 100}%` }}
                title={`Positive / Service Satisfaction: ${outcomesCount.positive}`}
              />
              <div
                className="bg-blue-500 h-full transition-all duration-500"
                style={{ width: `${(outcomesCount.inquiry / totalCallsCount) * 100}%` }}
                title={`Order & Inquiry Created: ${outcomesCount.inquiry}`}
              />
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${(outcomesCount.followup / totalCallsCount) * 100}%` }}
                title={`Follow-up Required: ${outcomesCount.followup}`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{ width: `${(outcomesCount.complaint / totalCallsCount) * 100}%` }}
                title={`Customer Dispute / Defect: ${outcomesCount.complaint}`}
              />
              <div
                className="bg-slate-300 h-full transition-all duration-500"
                style={{ width: `${(outcomesCount.unreached / totalCallsCount) * 100}%` }}
                title={`No Answer / Line Busy: ${outcomesCount.unreached}`}
              />
            </>
          ) : (
            <div className="w-full bg-slate-200 h-full" />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs flex-wrap pt-1 text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span>Positive / Satisfaction: <strong>{outcomesCount.positive}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span>Order / Inquiry Created: <strong>{outcomesCount.inquiry}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span>Follow-up Needed: <strong>{outcomesCount.followup}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span>Disputes / Defects: <strong>{outcomesCount.complaint}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span>No Answer / Busy: <strong>{outcomesCount.unreached}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Content Area: Cards View or Leaderboard Table */}
      {viewMode === 'cards' ? (
        /* Agent Telemetry Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crmUsers.map(agent => {
            const agentCalls = filteredCalls.filter(c => c.crmUserId === agent.id);
            const target = (agent.dailyCallTarget || 35) * targetMultiplier;
            const progress = target > 0 ? Math.min(100, Math.round((agentCalls.length / target) * 100)) : 0;
            const totalSeconds = agentCalls.reduce((sum, c) => sum + (c.durationSeconds || 0), 0);
            const avgSeconds = agentCalls.length ? Math.round(totalSeconds / agentCalls.length) : 0;

            const answered = agentCalls.filter(c => c.durationSeconds > 0 && !c.outcome.toLowerCase().includes('no answer') && !c.outcome.toLowerCase().includes('busy'));
            const agentConnRate = agentCalls.length ? Math.round((answered.length / agentCalls.length) * 100) : 0;

            const agentInquiries = agentCalls.filter(c => c.linkedInquiryId || c.outcome.toLowerCase().includes('inquiry') || c.outcome.toLowerCase().includes('order'));

            // Status Badge
            const isTop = progress >= 100;
            const isOnTrack = progress >= 70;
            const isInProgress = progress >= 40;

            return (
              <div
                key={agent.id}
                className="bg-white border border-slate-200 rounded p-4 shadow-xs space-y-3.5 hover:border-slate-300 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Agent Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{agent.name}</h3>
                        <span className="font-mono text-[10px] font-bold bg-[#CC0000] text-white px-1.5 py-0.5 rounded">
                          Ext {agent.extension}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">
                        {agent.assignedRegion || agent.department || 'Outbound Telesales'}
                      </div>
                    </div>

                    {/* Performance Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isTop
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : isOnTrack
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isInProgress
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isTop ? '🏆 Top Performer' : isOnTrack ? '⭐ On Track' : isInProgress ? '⏱️ In Progress' : '⚠️ Needs Push'}
                    </span>
                  </div>

                  {/* Quota Gauge with Dynamic Target */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        {timeframe === 'today'
                          ? 'Daily Quota'
                          : timeframe === 'week'
                          ? 'Weekly Quota'
                          : timeframe === 'month'
                          ? 'Monthly Quota'
                          : 'Overall Quota'}
                      </span>
                      <span className="font-mono font-bold text-[#CC0000]">
                        {agentCalls.length} / {target} calls
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 90 ? 'bg-emerald-600' : progress >= 60 ? 'bg-amber-500' : 'bg-[#CC0000]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>{progress}% Achieved</span>
                      <span>Target: {target} Calls</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Talk-Time</div>
                      <div className="font-bold font-mono text-slate-900 mt-0.5">
                        {formatDuration(totalSeconds)}
                      </div>
                    </div>
                    <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Duration</div>
                      <div className="font-bold font-mono text-slate-900 mt-0.5">
                        {formatDuration(avgSeconds)}
                      </div>
                    </div>
                    <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Connect Rate</div>
                      <div className="font-bold font-mono text-emerald-700 mt-0.5">
                        {agentConnRate}% ({answered.length})
                      </div>
                    </div>
                    <div className="p-2 border border-slate-100 rounded bg-slate-50/50">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Inquiries</div>
                      <div className="font-bold font-mono text-blue-700 mt-0.5">
                        {agentInquiries.length} Generated
                      </div>
                    </div>
                  </div>
                </div>

                {/* View Call Log Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAgentForModal(agent);
                    setModalSearchQuery('');
                  }}
                  className="w-full mt-2 py-2 px-3 text-xs font-semibold rounded bg-slate-100 hover:bg-[#CC0000] text-slate-700 hover:text-white border border-slate-200 hover:border-[#CC0000] transition-colors flex items-center justify-center gap-1.5 cursor-pointer group shadow-2xs"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-slate-400 group-hover:text-white" />
                  <span>View Call History ({agentCalls.length})</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* Performance Leaderboard Table View */
        <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-3.5 py-3">Rank</th>
                  <th className="px-3.5 py-3">Agent</th>
                  <th className="px-3.5 py-3">Extension</th>
                  <th className="px-3.5 py-3">Calls / Target</th>
                  <th className="px-3.5 py-3">Achievement</th>
                  <th className="px-3.5 py-3">Talk-Time</th>
                  <th className="px-3.5 py-3">Avg Duration</th>
                  <th className="px-3.5 py-3">Connect %</th>
                  <th className="px-3.5 py-3">Inquiries</th>
                  <th className="px-3.5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...crmUsers]
                  .map(agent => {
                    const agentCalls = filteredCalls.filter(c => c.crmUserId === agent.id);
                    const target = (agent.dailyCallTarget || 35) * targetMultiplier;
                    const progress = target > 0 ? Math.min(100, Math.round((agentCalls.length / target) * 100)) : 0;
                    const totalSec = agentCalls.reduce((s, c) => s + (c.durationSeconds || 0), 0);
                    const avgSec = agentCalls.length ? Math.round(totalSec / agentCalls.length) : 0;
                    const answered = agentCalls.filter(c => c.durationSeconds > 0 && !c.outcome.toLowerCase().includes('no answer') && !c.outcome.toLowerCase().includes('busy'));
                    const connRate = agentCalls.length ? Math.round((answered.length / agentCalls.length) * 100) : 0;
                    const inquiriesCount = agentCalls.filter(c => c.linkedInquiryId || c.outcome.toLowerCase().includes('inquiry')).length;
                    return { agent, agentCalls, target, progress, totalSec, avgSec, connRate, inquiriesCount };
                  })
                  .sort((a, b) => b.agentCalls.length - a.agentCalls.length)
                  .map((row, idx) => (
                    <tr key={row.agent.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-500">
                        {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-slate-900">{row.agent.name}</div>
                        <div className="text-[10px] text-slate-400">{row.agent.assignedRegion || row.agent.department}</div>
                      </td>
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-700">
                        Ext {row.agent.extension}
                      </td>
                      <td className="px-3.5 py-3 font-mono font-bold text-slate-900">
                        {row.agentCalls.length} / {row.target}
                      </td>
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs">{row.progress}%</span>
                          <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                row.progress >= 90 ? 'bg-emerald-600' : 'bg-[#CC0000]'
                              }`}
                              style={{ width: `${row.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-800">
                        {formatDuration(row.totalSec)}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-slate-600">
                        {formatDuration(row.avgSec)}
                      </td>
                      <td className="px-3.5 py-3 font-mono font-medium text-emerald-700">
                        {row.connRate}%
                      </td>
                      <td className="px-3.5 py-3 font-mono font-bold text-blue-700">
                        {row.inquiriesCount}
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAgentForModal(row.agent);
                            setModalSearchQuery('');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-red-50 hover:bg-[#CC0000] text-[#CC0000] hover:text-white rounded border border-red-200 hover:border-[#CC0000] transition-colors cursor-pointer"
                        >
                          View Log
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Agent Call Log Modal */}
      {selectedAgentForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold bg-[#CC0000] text-white px-2 py-0.5 rounded">
                    Ext {selectedAgentForModal.extension}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Call Telemetry: {selectedAgentForModal.name}
                  </h3>
                  <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                    {timeframe.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {selectedAgentForModal.assignedRegion || selectedAgentForModal.department || 'Outbound Telesales'} • {selectedAgentCalls.length} calls recorded during this period
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAgentForModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal KPI Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 sm:p-4 bg-white border-b border-slate-100 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Calls in Period</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  {selectedAgentCalls.length}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Talk-Time</span>
                <span className="text-base font-bold text-purple-700 font-mono">
                  {formatDuration(selectedAgentCalls.reduce((s, c) => s + (c.durationSeconds || 0), 0))}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Connected</span>
                <span className="text-base font-bold text-emerald-700 font-mono">
                  {selectedAgentCalls.filter(c => c.durationSeconds > 0 && !c.outcome.toLowerCase().includes('no answer') && !c.outcome.toLowerCase().includes('busy')).length} calls
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Inquiries Raised</span>
                <span className="text-base font-bold text-blue-700 font-mono">
                  {selectedAgentCalls.filter(c => c.linkedInquiryId || c.outcome.toLowerCase().includes('inquiry')).length}
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={e => setModalSearchQuery(e.target.value)}
                  placeholder="Search calls by company, contact person, phone, outcome or notes..."
                  className="w-full rounded border border-slate-300 py-1.5 pl-9 pr-3 text-xs focus:border-[#CC0000] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Call Log List Table */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4">
              {filteredModalCalls.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <PhoneCall className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium text-slate-600">No calls found</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {modalSearchQuery ? 'Try clearing your search query' : 'No calls recorded for this agent in the selected timeframe.'}
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs divide-y divide-slate-200">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-3.5 py-2.5">Date & Time</th>
                        <th className="px-3.5 py-2.5">Customer & Account</th>
                        <th className="px-3.5 py-2.5">Contact & Phone</th>
                        <th className="px-3.5 py-2.5">Duration</th>
                        <th className="px-3.5 py-2.5">Disposition / Outcome</th>
                        <th className="px-3.5 py-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredModalCalls.map(c => {
                        const o = (c.outcome || '').toLowerCase();
                        const isComplaint = o.includes('complaint');
                        const isInquiry = o.includes('inquir') || o.includes('order');
                        const isPositive = o.includes('positive') || o.includes('demo');
                        const isUnreached = o.includes('no answer') || o.includes('busy');

                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-3.5 py-2.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                              {c.callDate}
                            </td>
                            <td className="px-3.5 py-2.5">
                              {c.customerId && onSelectCustomer ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedAgentForModal(null);
                                    onSelectCustomer(c.customerId!);
                                  }}
                                  className="font-bold text-slate-900 hover:text-[#CC0000] text-left cursor-pointer flex items-center gap-1 group"
                                  title="View customer profile"
                                >
                                  <span>{c.companyName}</span>
                                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ) : (
                                <span className="font-bold text-slate-900">{c.companyName}</span>
                              )}
                              <div className="font-mono text-[10px] text-slate-400">{c.id}</div>
                            </td>
                            <td className="px-3.5 py-2.5">
                              <div className="font-medium text-slate-800">{c.contactName}</div>
                              <div className="font-mono text-[11px] text-slate-500">{c.phoneNumber}</div>
                            </td>
                            <td className="px-3.5 py-2.5 font-mono text-slate-700 whitespace-nowrap">
                              {formatDuration(c.durationSeconds || 0)}
                            </td>
                            <td className="px-3.5 py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  isComplaint
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : isInquiry
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : isPositive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isUnreached
                                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                              >
                                {c.outcome}
                              </span>
                              {c.linkedInquiryId && (
                                <span className="block mt-1 font-mono text-[9px] font-bold text-blue-600">
                                  🔗 {c.linkedInquiryId}
                                </span>
                              )}
                              {c.linkedComplaintId && (
                                <span className="block mt-1 font-mono text-[9px] font-bold text-rose-600">
                                  ⚠️ {c.linkedComplaintId}
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600 max-w-xs text-[11px]">
                              {c.notes || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Showing {filteredModalCalls.length} of {selectedAgentCalls.length} calls
              </span>
              <button
                type="button"
                onClick={() => setSelectedAgentForModal(null)}
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
