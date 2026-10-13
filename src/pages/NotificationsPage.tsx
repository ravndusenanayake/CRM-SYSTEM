import React from 'react';
import { useCrm } from '../context/CrmContext';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  FileQuestion,
  Calendar
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (module: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useCrm();

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Operational Notification Center</span>
            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {notifications.filter(n => !n.read).length} Unread
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time alerts for customer SLA limits, high-value inquiries, due follow-ups, and inbound PBX logs.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="px-3.5 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded divide-y divide-slate-100 shadow-xs">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No notifications available.
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationAsRead(n.id);
                if (n.linkModule) onNavigate(n.linkModule);
              }}
              className={`p-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                n.read ? 'bg-white' : 'bg-red-50/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {n.type === 'complaint' && <AlertCircle className="h-5 w-5 text-[#CC0000]" />}
                  {n.type === 'inquiry' && <FileQuestion className="h-5 w-5 text-blue-600" />}
                  {n.type === 'followup' && <Clock className="h-5 w-5 text-amber-600" />}
                  {n.type === 'alert' && <Bell className="h-5 w-5 text-purple-600" />}
                </div>

                <div>
                  <div className="font-bold text-slate-900 text-xs">{n.title}</div>
                  <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  {n.linkModule && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-[#CC0000] hover:underline">
                      View in {n.linkModule} &rarr;
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono text-[10px] text-slate-400">{n.timestamp}</span>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-[#CC0000] ml-auto mt-1" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
