'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from './Toast';
import { useRouter } from 'next/navigation';

type Page =
  | 'dashboard'
  | 'transaksi'
  | 'analisis'
  | 'prediksi'
  | 'budget'
  | 'laporan'
  | 'profil';

interface SidebarProps {
  activePage: Page;
  onNavigate: (p: Page) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  function handleLogout() {
    logout();
    showToast('Logout', 'Kamu telah keluar dari FinWise');
    router.push('/login');
  }

  function handleNavigate(p: Page) {
    onNavigate(p);
    setIsOpen(false);
  }

  const navItems: {
    id: Page;
    label: string;
    badge?: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="5" height="5" rx="1.5" />
          <rect x="9" y="2" width="5" height="5" rx="1.5" />
          <rect x="2" y="9" width="5" height="5" rx="1.5" />
          <rect x="9" y="9" width="5" height="5" rx="1.5" />
        </svg>
      ),
    },
    {
      id: 'transaksi',
      label: 'Transaksi',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 5h12M2 8h12M2 11h7" />
          <circle cx="12" cy="11" r="3" />
        </svg>
      ),
    },
    {
      id: 'analisis',
      label: 'Analisis',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <polyline points="2,12 5,7 8,9 11,5 14,8" />
        </svg>
      ),
    },
    {
      id: 'prediksi',
      label: 'Prediksi AI',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3l2 2" />
        </svg>
      ),
    },
  ];

  const manageItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    {
      id: 'budget',
      label: 'Budget',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="12" height="10" rx="2" />
          <path d="M2 6h12" />
          <circle cx="8" cy="10" r="1.5" />
        </svg>
      ),
    },
    {
      id: 'laporan',
      label: 'Laporan',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 2h5l4 4v8H4V2z" />
          <path d="M9 2v4h4" />
          <path d="M6 9h4M6 12h2" />
        </svg>
      ),
    },
    {
      id: 'profil',
      label: 'Profil',
      icon: (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="5" r="3" />
          <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Hamburger Button - hanya muncul di mobile */}
      {!isOpen && (
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      )}

      {/* Overlay gelap saat sidebar terbuka di mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-gem">
              <svg viewBox="0 0 16 16">
                <path d="M8 1L15 5.5V10.5L8 15L1 10.5V5.5L8 1Z" />
              </svg>
            </div>
            <div>
              <div className="logo-name">FinWise</div>
              <div className="logo-sub">Finance App</div>
            </div>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M6 6L18 18M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section-label">Utama</div>
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => handleNavigate(item.id)}
            >
              {item.icon}
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
          <div className="nav-section-label">Kelola</div>
          {manageItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => handleNavigate(item.id)}
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>

        <div className="sidebar-user">
          <div className="user-card" onClick={() => handleNavigate('profil')}>
            <div className="user-avatar">{user?.initials || 'U'}</div>
            <div className="user-info">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-plan">{user?.plan || 'Pro Plan'}</div>
            </div>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="var(--text3)"
              strokeWidth="1.5"
            >
              <polyline points="3,4 6,7 9,4" />
            </svg>
          </div>
          <div style={{ marginTop: '6px', padding: '0 2px' }}>
            <div
              className="dd-item danger"
              style={{ borderRadius: '8px', fontSize: '12px' }}
              onClick={handleLogout}
            >
              <svg viewBox="0 0 16 16">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l4-3-4-3M14 8H6" />
              </svg>
              Keluar
            </div>
          </div>
        </div>
      </div>
    </>
  );
}