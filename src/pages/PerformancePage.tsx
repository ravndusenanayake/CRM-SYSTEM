import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { TrendingUp, PhoneCall, CheckCircle, Clock, Award } from 'lucide-react';

export const PerformancePage: React.FC = () => {
  const { users, calls, inquiries } = useCrm();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

  const crmUsers = users.filter(u => u.role === 'CRM_USER');

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>CRM Team Outbound Performance & KPI Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational telemetry for Wurth Lanka tele-sales, customer retention, inquiry conversions, and SLA resolutions.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 rounded p-0.5 border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setTimeframe('today')}
            className={`px-3 py-1 rounded transition-colors ${
              timeframe === 'today' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`px-3 py-1 rounded transition-colors ${
              timeframe === 'week' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1 rounded transition-colors ${
              timeframe === 'month' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Agents Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crmUsers.map(agent => {
          const agentCalls = calls.filter(c => c.crmUserId === agent.id);
          const target = agent.dailyCallTarget || 35;
          const progress = Math.min(100, Math.round((agentCalls.length / target) * 100));
          const totalSeconds = agentCalls.reduce((sum, c) => sum + c.durationSeconds, 0);
          const avgSeconds = agentCalls.length ? Math.round(totalSeconds / agentCalls.length) : 0;

          return (
            <div
              key={agent.id}
              className="bg-white border border-slate-200 rounded p-4 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{agent.name}</h3>
                  <div className="text-[11px] font-mono text-slate-500">
                    PBX Extension: Ext {agent.extension}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{agent.assignedRegion}</div>
                </div>
                <Award className="h-5 w-5 text-amber-500" />
              </div>

              {/* Quota Gauge */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 font-medium">Daily Outbound Quota</span>
                  <span className="font-mono font-bold text-[#CC0000]">
                    {agentCalls.length} / {target}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#CC0000] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 text-right font-mono">{progress}% Reached</div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 border border-slate-100 rounded bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Talk-Time</div>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">
                    {Math.floor(totalSeconds / 60)}m {totalSeconds % 60}s
                  </div>
                </div>
                <div className="p-2 border border-slate-100 rounded bg-white">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Avg Call Length</div>
                  <div className="font-bold font-mono text-slate-900 mt-0.5">
                    {Math.floor(avgSeconds / 60)}m {avgSeconds % 60}s
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
