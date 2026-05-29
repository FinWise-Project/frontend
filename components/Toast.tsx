'use client';
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from 'react';

interface Toast {
  title: string;
  sub: string;
}
interface ToastContextType {
  showToast: (title: string, sub: string) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((title: string, sub: string) => {
    setToast({ title, sub });
    setVisible(true);
    setTimeout(() => setVisible(false), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={`toast success${visible ? ' show' : ''}`}>
        <div className="toast-title">{toast?.title}</div>
        <div className="toast-sub">{toast?.sub}</div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
