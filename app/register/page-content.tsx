'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirm
    ) {
      setError('Semua field wajib diisi');
      return;
    }

    if (form.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (form.password !== form.confirm) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    try {
      setLoading(true);

      await registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Gagal register');
    } finally {
      setLoading(false);
    }
  }

  const strength =
    form.password.length === 0
      ? 0
      : form.password.length < 8
        ? 1
        : form.password.length < 10
          ? 2
          : 3;

  const strengthLabel = ['', 'Lemah', 'Sedang', 'Kuat'][strength];

  const strengthColor = ['', 'var(--red)', 'var(--yellow)', 'var(--green)'][
    strength
  ];

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-gem">
            <svg viewBox="0 0 16 16">
              <path d="M8 1L15 5.5V10.5L8 15L1 10.5V5.5L8 1Z" />
            </svg>
          </div>

          <div>
            <div className="auth-logo-name">FinWise</div>
            <div className="auth-logo-sub">Finance App</div>
          </div>
        </div>

        <div className="auth-title">Buat Akun Baru</div>

        <div className="auth-sub">Mulai kelola keuangan kamu dengan cerdas</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label">Username</label>

            <input
              className="form-input"
              type="text"
              placeholder="Nama kamu"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>

            <input
              className="form-input"
              type="email"
              placeholder="nama@email.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nomor HP</label>

            <input
              className="form-input"
              type="text"
              placeholder="08xxxxxxxxxx"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>

            <div className="input-wrapper">
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 karakter"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="input-eye"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 9.5" />
                    <path d="M4.2 4.3C2.8 5.2 1.7 6.5 1 8c1.3 3 4 5 7 5 1.4 0 2.7-.4 3.8-1.1M6 3.1C6.6 3 7.3 3 8 3c3 0 5.7 2 7 5-.4.9-1 1.8-1.7 2.5" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M1 8c1.3-3 4-5 7-5s5.7 2 7 5c-1.3 3-4 5-7 5s-5.7-2-7-5z" />
                    <circle cx="8" cy="8" r="2" />
                  </svg>
                )}
              </button>
            </div>

            {form.password && (
              <div
                style={{
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: '4px',
                    background: 'var(--bg4)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(strength / 3) * 100}%`,
                      height: '100%',
                      background: strengthColor,
                      transition: 'all 0.3s',
                      borderRadius: '4px',
                    }}
                  />
                </div>

                <span
                  style={{
                    fontSize: '10px',
                    color: strengthColor,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {strengthLabel}
                </span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Konfirmasi Password</label>

            <input
              className="form-input"
              type={showPass ? 'text' : 'password'}
              placeholder="Ulangi password"
              value={form.confirm}
              onChange={(e) => set('confirm', e.target.value)}
              autoComplete="new-password"
            />

            {form.confirm && (
              <div
                style={{
                  marginTop: '4px',
                  fontSize: '11px',
                  color:
                    form.password === form.confirm
                      ? 'var(--green)'
                      : 'var(--red)',
                }}
              >
                {form.password === form.confirm
                  ? '✓ Password cocok'
                  : '✗ Password tidak cocok'}
              </div>
            )}
          </div>

          <button className="btn-auth" type="submit" disabled={loading}>
            {loading ? 'Membuat akun...' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="auth-switch">
          Sudah punya akun? <Link href="/login">Masuk di sini</Link>
        </div>
      </div>
    </div>
  );
}
