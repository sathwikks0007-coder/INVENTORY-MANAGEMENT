import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/inventory/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      // Ignore background errors
    }
  }, []);

  const markAsRead = async (id = null) => {
    try {
      await api.put('/inventory/notifications/read', { notificationId: id });
      if (id) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        notifications,
        addToast,
        removeToast,
        fetchNotifications,
        markAsRead,
        showSuccess: (msg) => addToast(msg, 'success'),
        showError: (msg) => addToast(msg, 'error'),
        showInfo: (msg) => addToast(msg, 'info'),
        showWarning: (msg) => addToast(msg, 'warning')
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 text-white';
          if (toast.type === 'success') bg = 'bg-emerald-600 text-white';
          if (toast.type === 'error') bg = 'bg-rose-600 text-white';
          if (toast.type === 'warning') bg = 'bg-amber-500 text-white';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 ${bg}`}
            >
              <div className="text-sm font-medium">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 opacity-70 hover:opacity-100 text-lg leading-none"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
