'use client';

import { useEffect, useState } from 'react';
import { useToast } from '../Toast';
import Modal from '../Modal';
import { useRouter } from 'next/navigation';

import {
  getProfile,
  getNotificationSettings,
  updateNotificationSettings,
  updateProfile,
  changePassword,
} from '@/lib/profile';

import { useAuth } from '@/lib/AuthContext';

export default function ProfilPage() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [passOpen, setPassOpen] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [notif, setNotif] = useState<any>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);

      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const [profileRes, notifRes] = await Promise.all([
        getProfile(token),
        getNotificationSettings(token),
      ]);

      const profileData = profileRes.data.profile;
      const notifData = notifRes.data.notificationSettings;

      setProfile(profileData);
      setNotif(notifData);

      setForm({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
      });
    } catch (err) {
      showToast('Error', 'Gagal mengambil data profile');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
  }

  // VALIDASI PASSWORD
  function validatePassword() {
    const { oldPassword, newPassword, confirmPassword } = passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('Error', 'Semua field wajib diisi');
      return false;
    }

    if (newPassword.length < 8) {
      showToast('Error', 'Password minimal 8 karakter');
      return false;
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (!hasLetter || !hasNumber) {
      showToast('Error', 'Password harus mengandung huruf dan angka');
      return false;
    }

    if (oldPassword === newPassword) {
      showToast('Error', 'Password baru tidak boleh sama dengan password lama');
      return false;
    }

    if (newPassword !== confirmPassword) {
      showToast('Error', 'Konfirmasi password tidak cocok');
      return false;
    }

    return true;
  }

  // UPDATE PROFILE
  async function handleUpdateProfile() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setSavingProfile(true);

    const prev = profile;
    setProfile({ ...profile, ...form });

    try {
      await updateProfile(token, form);

      showToast('Sukses', 'Profil berhasil diperbarui');
      setEditOpen(false);
    } catch (err) {
      setProfile(prev);
      showToast('Error', 'Gagal update profile');
    } finally {
      setSavingProfile(false);
    }
  }

  // UPDATE NOTIFIKASI
  async function toggleSwitch(key: string) {
    const token = localStorage.getItem('accessToken');
    if (!token || !notif) return;

    const prev = notif;

    const updated = {
      ...notif,
      [key]: !notif[key],
    };

    setNotif(updated);

    try {
      await updateNotificationSettings(token, {
        alertBudget: updated.alertBudget,
        transactionReminder: updated.transactionReminder,
        emailNotification: updated.emailNotification,
      });

      showToast(
        'Pengaturan',
        updated[key] ? 'Notifikasi diaktifkan' : 'Notifikasi dimatikan',
      );
    } catch (err) {
      setNotif(prev);
      showToast('Error', 'Gagal update pengaturan');
    }
  }

  // CHANGE PASSWORD
  async function handleChangePassword() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (!validatePassword()) return;

    setSavingPassword(true);

    try {
      await changePassword(token, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });

      showToast('Sukses', 'Password berhasil diubah');

      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setPassOpen(false);
    } catch (err) {
      showToast('Error', 'Gagal mengubah password');
    } finally {
      setSavingPassword(false);
    }
  }

  function handleLogout() {
    logout();
    showToast('Logout', 'Kamu telah keluar');
    router.push('/login');
  }

  if (loading) {
    return <div style={{ padding: 20 }}>Memuat profile...</div>;
  }

  const initials = profile?.avatar_initials || '??';
  const name = profile?.name || '-';
  const email = profile?.email || '-';
  const phone = profile?.phone || '-';
  const plan = profile?.plan || 'free';
  const currency = profile?.currency || 'IDR';

  return (
    <div>
      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-avatar-big">{initials}</div>

        <div>
          <div className="profile-name">{name}</div>
          <div className="profile-email">{email}</div>

          <div
            className={`plan-badge ${
              plan === 'pro' ? 'plan-pro' : 'plan-free'
            }`}
          >
            {plan === 'pro' ? 'Pro Plan Aktif' : 'Free Plan Aktif'}
          </div>
        </div>

        <button
          className="btn-primary"
          style={{ marginLeft: 'auto' }}
          onClick={() => setEditOpen(true)}
        >
          Edit Profil
        </button>
      </div>

      {/* ACCOUNT */}
      <div className="section-title">Pengaturan Akun</div>
      <div className="setting-section">
        <div className="setting-item">
          <span className="setting-label">Email</span>
          <span className="setting-val">{email}</span>
        </div>

        <div className="setting-item" onClick={() => setPassOpen(true)}>
          <span className="setting-label">Password</span>
          <span className="setting-val">Ubah password →</span>
        </div>

        <div className="setting-item">
          <span className="setting-label">Mata Uang</span>
          <span className="setting-val">{currency}</span>
        </div>

        <div className="setting-item">
          <span className="setting-label">Phone</span>
          <span className="setting-val">{phone}</span>
        </div>
      </div>

      {/* NOTIFICATION */}
      <div className="section-title">Notifikasi</div>
      <div className="setting-section">
        {[
          { label: 'Alert Budget', key: 'alert_budget' },
          { label: 'Pengingat Transaksi', key: 'transaction_rimender' },
          // { label: 'Email Notifikasi', key: 'email_notification' },
        ].map((item) => (
          <div key={item.key} className="setting-item">
            <span className="setting-label">{item.label}</span>

            <div
              className={`toggle ${notif?.[item.key] ? 'on' : ''}`}
              onClick={() => toggleSwitch(item.key)}
            />
          </div>
        ))}
      </div>

      {/* LOGOUT */}
      <div className="setting-section">
        <div className="setting-item" onClick={handleLogout}>
          <span style={{ color: 'var(--red)' }}>Keluar dari Akun</span>
        </div>
      </div>

      {/* EDIT PROFILE */}
      <Modal
        id='edit-profil-modal'
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Profil"
      >
        <label className="form-label">Username</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="form-input"
        />
        <label className="form-label">Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          className="form-input"
        />
        <label className="form-label">Phone</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="form-input"
        />

        <div className="btn-group">
          <button className="btn-cancel" onClick={() => setEditOpen(false)}>
            Batal
          </button>
          <button
            className="btn-save"
            onClick={handleUpdateProfile}
            disabled={savingProfile}
          >
            {savingProfile ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </Modal>

      {/* CHANGE PASSWORD */}
      <Modal
        id='change-password-modal'
        open={passOpen}
        onClose={() => setPassOpen(false)}
        title="Ganti Password"
      >
        <label className="form-label">Password Lama</label>
        <input
          type="password"
          name="oldPassword"
          value={passwordForm.oldPassword}
          onChange={handlePasswordChange}
          placeholder="Password lama"
          className="form-input"
        />

        <label className="form-label">Password Baru</label>
        <input
          type="password"
          name="newPassword"
          value={passwordForm.newPassword}
          onChange={handlePasswordChange}
          placeholder="Password baru"
          className="form-input"
        />

        <label className="form-label">Konfirmasi Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={passwordForm.confirmPassword}
          onChange={handlePasswordChange}
          placeholder="Konfirmasi password"
          className="form-input"
        />

        <div className="btn-group">
          <button className="btn-cancel" onClick={() => setPassOpen(false)}>
            Batal
          </button>
          <button
            className="btn-save"
            onClick={handleChangePassword}
            disabled={savingPassword}
          >
            {savingPassword ? 'Mengubah...' : 'Ganti'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
