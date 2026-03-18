import axios from 'axios';

/**
 * Merkezi Axios instance.
 *
 * Base URL: application.yml'de context-path: /api tanımlı.
 * Controller'lar /v1/... ile başlıyor.
 * Dolayısıyla tam adres: http://localhost:8080/api/v1
 *
 * Endpoint → Tam URL eşleşmesi:
 *   api.post('/auth/login')          → POST   /api/v1/auth/login
 *   api.post('/auth/register')       → POST   /api/v1/auth/register
 *   api.get('/dashboard')            → GET    /api/v1/dashboard
 *   api.get('/transactions')         → GET    /api/v1/transactions
 *   api.post('/transactions')        → POST   /api/v1/transactions
 *   api.delete(`/transactions/${id}`)→ DELETE /api/v1/transactions/{id}
 *   api.get('/coach/advice')         → GET    /api/v1/coach/advice
 *   api.get('/analytics/savings')    → GET    /api/v1/analytics/savings
 *   api.get('/market-prices/...')    → GET    /api/v1/market-prices/...
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 20 saniye timeout — AI coach bazen uzun sürebilir
  timeout: 20000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Her istek gitmeden önce localStorage'dan token'ı alıp Authorization header'a ekle
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// 401 gelirse token'ı temizle ve login'e yönlendir
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        // Login sayfasında tekrar 401 döngüsüne girme
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);