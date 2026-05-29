'use client';
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  id: string;
  open: boolean;
  onClose: () => void;
  title: string;
  sub?: string;
  children: ReactNode;
}

export default function Modal({
  open,
  onClose,
  title,
  sub,
  children,
}: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className={`modal-overlay${open ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-title">{title}</div>
        {sub && <div className="modal-sub">{sub}</div>}
        {children}
      </div>
    </div>
  );
}
