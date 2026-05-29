'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/components/Toast';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Modal from '@/components/Modal';
import DashboardPage from '@/components/pages/DashboardPage';
import TransaksiPage from '@/components/pages/TransaksiPage';
import AnalisisPage from '@/components/pages/AnalisisPage';
import PrediksiPage from '@/components/pages/PrediksiPage';
import BudgetPage from '@/components/pages/BudgetPage';
import LaporanPage from '@/components/pages/LaporanPage';
import ProfilPage from '@/components/pages/ProfilPage';

type Page =
  | 'dashboard'
  | 'transaksi'
  | 'analisis'
  | 'prediksi'
  | 'budget'
  | 'laporan'
  | 'profil';

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [addTxOpen, setAddTxOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'var(--text3)',
          fontSize: '14px',
        }}
      >
        Memuat...
      </div>
    );

  if (!user) return null;

  return (
    <div className="app">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="main">
        <Topbar activePage={activePage} onAddTx={() => setAddTxOpen(true)} />
        <div className="content" onClick={() => {}}>
          {activePage === 'dashboard' && (
            <DashboardPage onNavigate={setActivePage} />
          )}
          {activePage === 'transaksi' && (
            <TransaksiPage onAddTx={() => setAddTxOpen(true)} />
          )}
          {activePage === 'analisis' && <AnalisisPage />}
          {activePage === 'prediksi' && <PrediksiPage />}
          {activePage === 'budget' && <BudgetPage />}
          {activePage === 'laporan' && <LaporanPage />}
          {activePage === 'profil' && <ProfilPage />}
        </div>
      </div>

      <Modal
        id="addTx"
        open={addTxOpen}
        onClose={() => setAddTxOpen(false)}
        title="Tambah Transaksi"
        sub="Catat pemasukan atau pengeluaran baru"
      >
        <div className="form-group">
          <label className="form-label">Tipe</label>
          <select className="form-select">
            <option>Pengeluaran</option>
            <option>Pemasukan</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Nominal (Rp)</label>
          <input className="form-input" type="number" placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label">Keterangan</label>
          <input
            className="form-input"
            type="text"
            placeholder="Contoh: Makan siang"
          />
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
          }}
        >
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select">
              <option>Makanan</option>
              <option>Transport</option>
              <option>Hiburan</option>
              <option>Kesehatan</option>
              <option>Lainnya</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              className="form-input"
              type="date"
              defaultValue={new Date().toLocaleDateString('sv-SE')}
            />
          </div>
        </div>
        <div className="btn-group">
          <button className="btn-cancel" onClick={() => setAddTxOpen(false)}>
            Batal
          </button>
          <button
            className="btn-save"
            onClick={() => {
              setAddTxOpen(false);
              showToast(
                'Transaksi ditambahkan',
                'Transaksi baru berhasil disimpan ✓',
              );
            }}
          >
            Simpan Transaksi
          </button>
        </div>
      </Modal>
    </div>
  );
}
