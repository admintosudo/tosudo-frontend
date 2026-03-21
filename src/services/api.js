import axios from 'axios';

const HUB_URL = import.meta.env.VITE_HUB_URL || 'https://hub.tosudo.vn';
const WMS_URL = import.meta.env.VITE_WMS_URL || 'https://hub.tosudo.vn';
const AI_URL  = import.meta.env.VITE_AI_URL  || 'https://hub.tosudo.vn';

// ── Axios instances ──────────────────────────────────────
const hub = axios.create({ baseURL: HUB_URL });
const wms = axios.create({ baseURL: WMS_URL });
const ai  = axios.create({ baseURL: AI_URL });

// ── Auth token interceptor ────────────────────────────────
[hub, wms, ai].forEach(instance => {
  instance.interceptors.request.use(config => {
    const token = localStorage.getItem('tosudo_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  instance.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        localStorage.removeItem('tosudo_token');
        localStorage.removeItem('tosudo_user');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }
  );
});

// ── Auth API ─────────────────────────────────────────────
export const authAPI = {
  login: (phone, password) =>
    hub.post('/v1/auth/login', { phone, password }),
  refresh: () =>
    hub.post('/v1/auth/refresh', {
      refreshToken: localStorage.getItem('tosudo_refresh')
    }),
  logout: () => hub.post('/v1/auth/logout'),
};

// ── Users API ─────────────────────────────────────────────
export const usersAPI = {
  me: () => hub.get('/v1/users/me'),
  list: (params) => hub.get('/v1/users', { params }),
  create: (data) => hub.post('/v1/users', data),
  update: (id, data) => hub.patch(`/v1/users/${id}`, data),
};

// ── WMS API ───────────────────────────────────────────────
export const inventoryAPI = {
  list: (params) => wms.get('/v1/inventory', { params }),
  get: (sku) => wms.get(`/v1/inventory/${sku}`),
  in: (data) => wms.post('/v1/inventory/in', data),
  out: (data) => wms.post('/v1/inventory/out', data),
  adjust: (data) => wms.post('/v1/inventory/adjust', data),
};

export const ordersAPI = {
  list: (params) => wms.get('/v1/orders', { params }),
  get: (id) => wms.get(`/v1/orders/${id}`),
  create: (data) => wms.post('/v1/orders', data),
  updateStatus: (id, data) => wms.patch(`/v1/orders/${id}/status`, data),
  summary: (params) => wms.get('/v1/orders/stats/summary', { params }),
};

export const warehousesAPI = {
  list: () => wms.get('/v1/warehouses'),
};

// ── AI API ────────────────────────────────────────────────
export const agentsAPI = {
  list: () => ai.get('/v1/agents'),
  chat: (code, data) => ai.post(`/v1/agents/${code}/chat`, data),
  council: (data) => ai.post('/v1/council', data),
  usage: () => ai.get('/v1/usage'),
};

export const moduleAPI = {
  chat: (moduleCode, data) => ai.post(`/v1/module/${moduleCode}/chat`, data),
};

export { hub, wms, ai };
