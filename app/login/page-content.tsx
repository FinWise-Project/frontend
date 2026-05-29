'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/auth';
import { useAuth } from '@/lib/AuthContext';

export default function LoginPage() {
  const router = useRouter();

  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (loading) return;

    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser({ email, password });

      const profileRes = await fetch(
        'https://finwise-api-beta.vercel.app/users/profile',
        {
          headers: {
            Authorization: `Bearer ${response.data.accessToken}`,
          },
        },
      );
      const profileData = await profileRes.json();

      login(
        profileData.data.profile,
        response.data.accessToken,
        response.data.refreshToken,
      );

      router.push('/dashboard');
      // ← tidak ada setLoading(false) di sini
      // loading tetap true sampai halaman berpindah
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Email atau password salah');
      setLoading(false); // ← hanya reset saat error
    }
  }

  function demoLogin() {
    setEmail('demo@finwise.id');
    setPassword('demo1234');
  }

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

        <div className="auth-title">Selamat Datang Kembali</div>

        <div className="auth-sub">Masuk ke akun FinWise kamu</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label">Email</label>

            <input
              className="form-input"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>

            <div className="input-wrapper">
              <input
                className="form-input"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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
          </div>

          <button
            className="btn-auth"
            type="submit"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              pointerEvents: loading ? 'none' : 'auto', // ← blokir semua klik saat loading
            }}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>

          <div className="auth-divider">
            <span>atau</span>
          </div>

          {/* <button
            type="button"
            className="btn-auth"
            style={{
              background: 'var(--bg3)',
              border:
                '1px solid var(--border2)',
              color: 'var(--text2)',
            }}
            onClick={demoLogin}
          >
            🎯 Coba dengan Akun Demo
          </button> */}
        </form>

        <div className="auth-switch">
          Belum punya akun? <Link href="/register">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  );
}
