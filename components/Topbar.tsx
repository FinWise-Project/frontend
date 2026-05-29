'use client';

import { useEffect, useState } from 'react';
import { useToast } from './Toast';
import {
  getNotifications,
  markAllNotificationsAsRead,
} from '@/lib/notification';

type Page =
  | 'dashboard'
  | 'transaksi'
  | 'analisis'
  | 'prediksi'
  | 'budget'
  | 'laporan'
  | 'profil';

const titles: Record<Page, string> = {
  dashboard: 'Dashboard',
  transaksi: 'Transaksi',
  analisis: 'Analisis Keuangan',
  prediksi: 'Prediksi AI',
  budget: 'Budget & Target',
  laporan: 'Laporan',
  profil: 'Profil & Settings',
};

const subs: Record<Page, string> = {
  dashboard: 'April 2025 • Selamat datang!',
  transaksi: 'Riwayat dan kelola transaksi',
  analisis: 'Insight mendalam keuangan kamu',
  prediksi: 'Prediksi berbasis AI',
  budget: 'Monitor budget per kategori',
  laporan: 'Export dan ringkasan laporan',
  profil: 'Kelola akun dan pengaturan',
};

interface TopbarProps {
  activePage: Page;
  onAddTx: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function Topbar({ activePage, onAddTx }: TopbarProps) {
  const { showToast } = useToast();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';

      const response = await getNotifications(token);

      setNotifications(response.data.notifications || []);

      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Gagal mengambil notifikasi:', error);
    }
  };

  const handleReadAll = async () => {
    try {
      const token = localStorage.getItem('accessToken') || '';

      await markAllNotificationsAsRead(token);

      setNotifications((prev) =>
        prev.map((notif) => ({
          ...notif,
          isRead: true,
        })),
      );

      setUnreadCount(0);

      showToast('Notifikasi', 'Semua notifikasi telah dibaca');
    } catch (error) {
      console.error('Gagal menandai notifikasi:', error);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div className="topbar">
      <div className="topbar-title">
        <div className="topbar-h1">{titles[activePage]}</div>

        <div className="topbar-sub">{subs[activePage]}</div>
      </div>

      <div className="topbar-right">
        <div
          className="btn-icon"
          onClick={async () => {
            if (!notifOpen) {
              await fetchNotifications();
            }

            setNotifOpen(!notifOpen);
          }}
        >
          <svg viewBox="0 0 16 16">
            <path d="M8 2a5 5 0 00-5 5v2l-1 2h12l-1-2V7a5 5 0 00-5-5z" />
            <path d="M6.5 13.5a1.5 1.5 0 003 0" />
          </svg>

          {unreadCount > 0 && <div className="notif-dot" />}
        </div>

        <div
          className={`notif-panel${notifOpen ? ' open' : ''}`}
          style={{ top: '46px' }}
        >
          <div className="notif-header">
            <span className="notif-title">Notifikasi</span>

            {unreadCount > 0 && (
              <span
                className="notif-clear"
                onClick={async () => {
                  await handleReadAll();
                  setNotifOpen(false);
                }}
              >
                Tandai semua dibaca
              </span>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-item">Tidak ada notifikasi</div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="notif-item"
                onClick={() => setNotifOpen(false)}
                style={{
                  opacity: notif.isRead ? 0.7 : 1,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    className="notif-icon"
                    style={{
                      background:
                        notif.type === 'transaction'
                          ? 'rgba(74,222,128,0.15)'
                          : 'rgba(250,204,21,0.15)',
                    }}
                  >
                    {notif.type === 'transaction' ? '💸' : '🔔'}
                  </div>

                  <div>
                    <div className="notif-msg">{notif.title}</div>

                    <div
                      style={{
                        fontSize: '13px',
                        opacity: 0.8,
                        marginTop: '2px',
                      }}
                    >
                      {notif.message}
                    </div>

                    <div className="notif-time">
                      {formatTime(notif.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
