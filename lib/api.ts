const BASE_URL = 'https://finwise-api-beta.vercel.app';

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newAccessToken = data.data.accessToken;

    localStorage.setItem('accessToken', newAccessToken);

    return newAccessToken;
  } catch {
    return null;
  }
}

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  let token = localStorage.getItem('accessToken');

  const doFetch = (t: string | null) =>
    fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(options.headers || {}),
      },
    });

  let response = await doFetch(token);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();

    if (!newToken) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('finwise_user');
      window.location.href = '/login';
      throw new Error('Sesi berakhir, silakan login kembali');
    }

    response = await doFetch(newToken);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || JSON.stringify(data) || 'Terjadi kesalahan',
    );
  }

  return data;
}
