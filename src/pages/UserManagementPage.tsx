import React, { useState } from 'react';
import { useCrm } from '../context/CrmContext';
import { User, UserRole } from '../types/crm';
import { Modal } from '../components/common/Modal';
import { ShieldCheck, Plus, User as UserIcon, Phone, Mail, Award } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { users, addUser, updateUser } = useCrm();
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('CRM_USER');
  const [extension, setExtension] = useState('206');
  const [phone, setPhone] = useState('+94 77 220 1006');
  const [dailyCallTarget, setDailyCallTarget] = useState(35);
  const [assignedRegion, setAssignedRegion] = useState('Southern Province & Galle Coast');
  const [department, setDepartment] = useState('CRM Outbound Operations');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
      name,
      email,
      role,
      extension,
      phone,
      dailyCallTarget: Number(dailyCallTarget),
      active: true,
      assignedRegion,
      department
    });
    setShowAddModal(false);
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>CRM Team & User Account Administration</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {users.length} Active System Accounts
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage Wurth Lanka CRM operational agents, PBX extension mappings, daily call quotas, and access control.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#CC0000] text-white text-xs font-bold hover:bg-[#B30000] shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add System User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-slate-200">
            <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Account Name</th>
                <th className="px-4 py-3">Role & Authority</th>
                <th className="px-4 py-3">PBX Extension</th>
                <th className="px-4 py-3">Contact Email & Phone</th>
                <th className="px-4 py-3">Daily Call Quota</th>
                <th className="px-4 py-3">Territory / Territory Focus</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    <div>{u.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{u.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'ADMIN'
                          ? 'bg-red-50 text-[#CC0000] border border-red-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">
                    Ext {u.extension}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800">{u.email}</div>
                    <div className="font-mono text-[10px] text-slate-500">{u.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">
                    {u.dailyCallTarget ? `${u.dailyCallTarget} Calls/day` : 'N/A (Admin)'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {u.assignedRegion || u.department}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Provision New CRM User Account"
        subtitle="Configure tele-sales credentials and PBX extension mapping"
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Kasun Fernando"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Corporate Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="kasun.f@wurth.lk"
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Role Permission</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full rounded border border-slate-300 bg-white py-1.5 px-2.5 text-xs font-semibold"
              >
                <option value="CRM_USER">CRM Tele-Sales Agent</option>
                <option value="ADMIN">Commercial Administrator</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">PBX Extension *</label>
              <input
                type="text"
                required
                value={extension}
                onChange={e => setExtension(e.target.value)}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Daily Call Target</label>
              <input
                type="number"
                value={dailyCallTarget}
                onChange={e => setDailyCallTarget(Number(e.target.value))}
                className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Region / Territory Focus</label>
            <input
              type="text"
              value={assignedRegion}
              onChange={e => setAssignedRegion(e.target.value)}
              placeholder="e.g. Kandy & Central Province Automotive Accounts"
              className="w-full rounded border border-slate-300 py-1.5 px-2.5 text-xs focus:border-[#CC0000] focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded border border-slate-300 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#CC0000] text-white font-bold hover:bg-[#B30000]"
            >
              Provision Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
