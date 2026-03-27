import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type='info', ttl=4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), ttl);
  }, []);

  const api = { push };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 w-72">
        {toasts.map(t => (
          <div key={t.id} className={`px-4 py-3 rounded shadow text-sm text-white animate-fadeIn ${
            t.type==='success' ? 'bg-green-600' : t.type==='error' ? 'bg-red-600' : 'bg-gray-800'
          }`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
