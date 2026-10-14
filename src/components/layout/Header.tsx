import React, { useState, useRef, useEffect } from 'react';
import { useCrm } from '../../context/CrmContext';
import { Logo } from '../common/Logo';
import {
  Search,
  PhoneCall,
  Bell,
  ChevronDown,
  Check,
  Shield,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  currentModule: string;
  onOpenLogCall: () => void;
  onSelectCustomer: (customerId: string) => void;
  onNavigateModule: (module: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onOpenLogCall,
  onSelectCustomer,
  onNavigateModule
}) => {
  const {
    currentUser,
    switchUser,
    users,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    allCustomers,
    allLeads,
    dbStatus
  } = useCrm();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchResults = searchQuery.trim()
    ? {
        customers: allCustomers
          .filter(
            c =>
              c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.mobile.includes(searchQuery) ||
              c.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 4),
        leads: allLeads
          .filter(
            l =>
              l.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              l.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
              l.phone.includes(searchQuery) ||
              l.id.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 3)
      }
    : { customers: [], leads: [] };

  const unreadCount = notifications.filter(
    n => !n.read && (!n.forCrmUserId || n.forCrmUserId === currentUser.id)
  ).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Title & Brand on mobile */}
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          <Logo variant="header" showSubtitle={false} />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{currentModule}</span>
            <span className="hidden sm:inline-block text-xs font-normal text-slate-400">|</span>
            <span className="hidden sm:inline-block text-xs font-normal text-slate-500">
              Wurth Lanka (Pvt) Ltd
            </span>
          </h1>
        </div>
      </div>

      {/* Global Instant Search */}
      <div className="relative mx-4 hidden md:block max-w-md w-full" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, company, mobile, lead ID..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full rounded border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#CC0000] focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-[#CC0000] transition-colors"
          />
        </div>

        {showSearchDropdown && searchQuery.trim() && (
          <div className="absolute left-0 mt-1 w-full rounded border border-slate-200 bg-white shadow-lg z-50 overflow-hidden">
            <div className="p-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-600">
              Search Results ({searchResults.customers.length + searchResults.leads.length})
            </div>

            {searchResults.customers.length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customers
                </div>
                {searchResults.customers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onNavigateModule('Customers');
                      onSelectCustomer(c.id);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-[#CC0000]">
                        {c.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {c.contactPerson} • {c.mobile}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.id}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchResults.leads.length > 0 && (
              <div className="py-1 border-t border-slate-100">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Leads
                </div>
                {searchResults.leads.map(l => (
                  <button
                    key={l.id}
                    onClick={() => {
                      onNavigateModule('Leads');
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-[#CC0000]">
                        {l.companyName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {l.contactName} • {l.phone}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {l.status}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {searchResults.customers.length === 0 && searchResults.leads.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching customers or leads found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Action Icons & User Switcher */}
      <div className="flex items-center gap-3">
        {/* Quick Log Call Shortcut */}
        <button
          onClick={onOpenLogCall}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#CC0000] text-white text-xs font-semibold hover:bg-[#B30000] transition-colors shadow-xs"
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Log Call</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            aria-label="Open notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#CC0000] text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="text-xs font-bold text-slate-800">
                  CRM Notifications ({unreadCount} unread)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] font-medium text-[#CC0000] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No notifications at this time
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkModule) {
                          onNavigateModule(n.linkModule);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        n.read ? '' : 'bg-red-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          {n.type === 'complaint' && (
                            <AlertCircle className="h-3.5 w-3.5 text-[#CC0000] shrink-0" />
                          )}
                          <span>{n.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {n.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 leading-snug">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Database Status Indicator */}
        <div className="hidden sm:flex items-center">
          {dbStatus === 'connected' && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
              title="Connected to SQLite REST API (server/data/crm.db)"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SQLite DB
            </span>
          )}
          {dbStatus === 'offline' && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"
              title="Backend offline: LocalStorage fallback active"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Offline (Local)
            </span>
          )}
          {dbStatus === 'connecting' && (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200"
              title="Connecting to SQLite Backend..."
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-ping" />
              Connecting...
            </span>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* User Switcher / Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded p-1 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-800 font-bold text-xs">
              {currentUser.name
                .split(' ')
                .map(n => n[0])
                .join('')}
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {currentUser.name}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span
                  className={`text-[10px] font-semibold px-1 py-0.2 rounded border ${
                    currentUser.role === 'ADMIN'
                      ? 'bg-red-50 text-[#CC0000] border-red-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {currentUser.role === 'ADMIN'
                    ? 'Administrator'
                    : `CRM Rep (Ext ${currentUser.extension})`}
                </span>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Current Session
                </div>
                <div className="font-bold text-slate-900 text-sm mt-0.5">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.email}</div>
                <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1 font-mono">
                  Role:{' '}
                  <strong className={currentUser.role === 'ADMIN' ? 'text-[#CC0000]' : 'text-slate-800'}>
                    {currentUser.role}
                  </strong>
                  {currentUser.role === 'CRM_USER' && ` • Ext ${currentUser.extension}`}
                </div>
              </div>

              <div className="p-2">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                  Switch Active User (RBAC Test)
                </div>
                {users.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded flex items-center justify-between transition-colors ${
                        isCurrent ? 'bg-red-50 text-[#CC0000] font-bold' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {u.role === 'ADMIN' ? (
                          <Shield className="h-3.5 w-3.5 text-[#CC0000]" />
                        ) : (
                          <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <div>
                          <div>{u.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {u.role === 'ADMIN' ? 'Full Administrator' : `CRM Rep • Ext ${u.extension}`}
                          </div>
                        </div>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-[#CC0000]" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 p-2 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Wurth Lanka CRM v2.4</span>
                <span className="font-mono text-[10px]">Pannipitiya HQ</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
