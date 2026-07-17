import React, { useState, useEffect } from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { PushNotification } from '../types';
import { ClinicDatabase } from '../db/mockDb';

interface PushNotificationCenterProps {
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onClearNotification: (id: string) => void;
}

export default function PushNotificationCenter({
  notifications,
  onMarkAllAsRead,
  onClearNotification
}: PushNotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" id="notification-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer"
        title="Alertas urgentes"
        id="btn-bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600" />
              <h3 className="font-semibold text-slate-800 text-sm">Alertas em Tempo Real</h3>
              {unreadCount > 0 && (
                <span className="bg-teal-100 text-teal-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} novos
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                  id="mark-all-read"
                >
                  Lidas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
                id="close-notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                Nenhum alerta recente.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex gap-3 transition-colors ${notif.read ? 'bg-white' : 'bg-teal-50/40'}`}
                  id={`notif-${notif.id}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'urgent' && (
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
                    )}
                    {notif.type === 'success' && (
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
                    )}
                    {notif.type === 'info' && (
                      <Info className="w-4.5 h-4.5 text-sky-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${notif.read ? 'text-slate-700' : 'text-slate-950'}`}>
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.body}</p>
                  </div>
                  <button
                    onClick={() => onClearNotification(notif.id)}
                    className="text-slate-300 hover:text-slate-500 self-start p-0.5 hover:bg-slate-100 rounded cursor-pointer"
                    title="Remover alerta"
                    id={`clear-notif-${notif.id}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="p-2.5 bg-slate-50 text-center border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-mono">
              Notificações urgentes ativas (Push Simulado)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
