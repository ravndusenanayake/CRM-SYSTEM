import React from 'react';
import { useCrm } from '../../context/CrmContext';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  Users,
  Target,
  PhoneCall,
  FileQuestion,
  AlertTriangle,
  CalendarClock,
  Briefcase,
  PhoneIncoming,
  UploadCloud,
  BarChart3,
  TrendingUp,
  Bell,
  ShieldCheck,
  Settings,
  Lock
} from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onSelectModule: (module: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentModule, onSelectModule }) => {
  const {
    currentUser,
    isAdmin,
    customers,
    leads,
    complaints,
    calls,
    notifications
  } = useCrm();

  const openComplaintsCount = complaints.filter(
    c => c.status === 'Open' || c.status === 'Under Investigation'
  ).length;

  const todayStr = new Date().toISOString().split('T')[0];
  const dueFollowupsCount = customers.filter(
    c => c.nextFollowUpDate && c.nextFollowUpDate <= todayStr
  ).length;

  const unreadNotificationsCount = notifications.filter(
    n => !n.read && (!n.forCrmUserId || n.forCrmUserId === currentUser.id)
  ).length;

  const navItems = [
    { id: 'Dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'Customers', name: 'Customers', icon: Users, badgeCount: customers.length },
    { id: 'Leads', name: 'Leads', icon: Target, badgeCount: leads.length },
    { id: 'Outbound Calls', name: 'Outbound Calls', icon: PhoneCall },
    { id: 'Inquiries', name: 'Inquiries', icon: FileQuestion },
    {
      id: 'Complaints',
      name: 'Complaints',
      icon: AlertTriangle,
      badgeCount: openComplaintsCount > 0 ? openComplaintsCount : undefined
    },
    {
      id: 'Follow-ups',
      name: 'Follow-ups',
      icon: CalendarClock,
      badgeCount: dueFollowupsCount > 0 ? dueFollowupsCount : undefined
    },
    { id: 'Salespersons', name: 'Salespersons', icon: Briefcase },
    { id: 'PABX Import', name: 'PABX Import', icon: PhoneIncoming, adminOnly: true },
    { id: 'Customer Import', name: 'Customer Import', icon: UploadCloud, adminOnly: true },
    { id: 'Reports', name: 'Reports', icon: BarChart3, adminOnly: true },
    { id: 'Performance', name: 'Performance', icon: TrendingUp },
    {
      id: 'Notifications',
      name: 'Notifications',
      icon: Bell,
      badgeCount: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined
    },
    { id: 'User Management', name: 'User Management', icon: ShieldCheck, adminOnly: true },
    { id: 'Settings', name: 'Settings', icon: Settings }
  ];

  const coreItems = navItems.slice(0, 8);
  const adminItems = navItems.slice(8);

  return (
    <aside className="w-64 shrink-0 flex flex-col border-r border-slate-200 bg-white min-h-screen">
      {/* Header Logo */}
      <div className="h-16 px-5 border-b border-slate-200 flex items-center bg-white">
        <Logo variant="sidebar" />
      </div>

      {/* Active User Status Bar */}
      <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          <span className="font-semibold text-slate-800 truncate">{currentUser.name}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
            isAdmin
              ? 'bg-red-50 text-[#CC0000] border-red-200'
              : 'bg-slate-200 text-slate-700 border-slate-300'
          }`}
        >
          {isAdmin ? 'ADMIN' : `EXT ${currentUser.extension}`}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Operations
        </div>

        {coreItems.map(item => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#CC0000] text-white shadow-xs font-semibold'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.name}</span>
              </div>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span
                  className={`ml-2 px-1.5 py-0.2 text-[10px] font-bold rounded tabular-nums ${
                    isActive
                      ? 'bg-white text-[#CC0000]'
                      : item.id === 'Complaints'
                      ? 'bg-red-100 text-[#CC0000]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Administration & Tools
        </div>

        {adminItems.map(item => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          const isRestricted = item.adminOnly && !isAdmin;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#CC0000] text-white shadow-xs font-semibold'
                  : isRestricted
                  ? 'text-slate-400 hover:bg-slate-50'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : isRestricted ? 'text-slate-300' : 'text-slate-500'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>

              {isRestricted ? (
                <span title="Administrator access required" className="flex items-center">
                  <Lock className="h-3 w-3 text-slate-300 shrink-0" />
                </span>
              ) : item.badgeCount !== undefined && item.badgeCount > 0 ? (
                <span
                  className={`ml-2 px-1.5 py-0.2 text-[10px] font-bold rounded tabular-nums ${
                    isActive ? 'bg-white text-[#CC0000]' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badgeCount}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Footer info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-800">Wurth Lanka (Pvt) Ltd</div>
        <div className="text-[10px] text-slate-400 mt-0.5">Commercial CRM • Colombo HQ</div>
      </div>
    </aside>
  );
};
