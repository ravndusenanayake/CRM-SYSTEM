import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Download,
  CheckCircle,
  Building,
  Server,
  Clock
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDatabase, allCustomers, calls, inquiries, complaints } = useCrm();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [pbxHost, setPbxHost] = useState(settings.pbxHost);
  const [criticalSlaHours, setCriticalSlaHours] = useState(settings.criticalSlaHours);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      phone,
      email,
      address,
      pbxHost,
      criticalSlaHours: Number(criticalSlaHours)
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExportBackup = () => {
    const backup = {
      exportTimestamp: new Date().toISOString(),
      company: companyName,
      version: '2.4.0',
      database: {
        customersCount: allCustomers.length,
        callsCount: calls.length,
        inquiriesCount: inquiries.length,
        complaintsCount: complaints.length
      }
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Wurth_CRM_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (window.confirm('Reset all CRM data back to initial factory demo state? This will clear local modifications.')) {
      resetDatabase();
      alert('Database restored to initial state.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>System Settings & Operational Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Wurth Lanka (Pvt) Ltd corporate profile, PBX communication gateways, SLA parameters, and data backups.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>System configuration parameters successfully saved!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded p-5 space-y-4 text-xs">
        {/* Corporate Identity */}
        <div>
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-3">
            <Building className="h-4 w-4 text-[#CC0000]" />
            <span>Corporate Identity & Sri Lanka HQ Profile</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Legal Entity *</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Corporate Hotline</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Corporate Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Headquarters Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Telephony Gateway */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-3">
            <Server className="h-4 w-4 text-blue-600" />
            <span>PBX Gateway & Telephony Settings</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">PBX SIP Host Server</label>
              <input
                type="text"
                value={pbxHost}
                onChange={e => setPbxHost(e.target.value)}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Critical Complaint SLA Window (Hours)</label>
              <input
                type="number"
                value={criticalSlaHours}
                onChange={e => setCriticalSlaHours(Number(e.target.value))}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000] shadow-xs"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Database Maintenance & Backups */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-3 text-xs">
        <h3 className="font-bold text-slate-900 text-sm">Database Maintenance & Local Data Storage</h3>
        <p className="text-slate-500">
          Data is saved continuously in your browser’s LocalStorage. You can export a snapshot JSON backup or reset demo fixtures anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-4 py-2 rounded border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Export Full JSON Backup</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded border border-red-300 text-[#CC0000] font-bold hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Restore Demo Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};
