const API_BASE = process.env.NEXT_PUBLIC_API || 'http://localhost:3001';

type HeadersLike = Record<string, string>;

const TOKEN_KEY = 'access_token';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path: string, opts: RequestInit = {}) {
  const headers: HeadersLike = { 'Content-Type': 'application/json', ...(opts.headers as any) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err: any = new Error(res.statusText || 'API error');
    err.status = res.status;
    err.body = text;
    throw err;
  }

  // try JSON
  try {
    return await res.json();
  } catch {
    return null;
  }
}

const auth = {
  async login(email: string, password: string) {
    const body = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (body?.access_token) setToken(body.access_token);
    return body;
  },
  async register(payload: any) {
    const body = await request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
    if (body?.access_token) setToken(body.access_token);
    return body;
  },
  async me() {
    return await request('/auth/me');
  },
  logout() {
    setToken(null);
  },
  getToken,
  setToken,
};

const campaigns = {
  list() {
    return request('/campaigns');
  },
  create(payload: any) {
    return request('/campaigns', { method: 'POST', body: JSON.stringify(payload) });
  },
  update(id: string, payload: any) {
    return request(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
};

const applications = {
  create(payload: any) {
    return request('/applications', { method: 'POST', body: JSON.stringify(payload) });
  },
  updateStatus(id: string, status: string) {
    return request(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
};

const creators = {
  patchMe(payload: any) {
    return request('/creators/me', { method: 'PATCH', body: JSON.stringify(payload) });
  },
};

const companies = {
  patchMe(payload: any) {
    return request('/companies/me', { method: 'PATCH', body: JSON.stringify(payload) });
  },
};

const messages = {
  post(payload: any) {
    return request('/messages', { method: 'POST', body: JSON.stringify(payload) });
  },
  markRead(id: string) {
    return request(`/messages/${id}/read`, { method: 'PATCH' });
  },
};

const reviews = {
  create(payload: any) {
    return request('/reviews', { method: 'POST', body: JSON.stringify(payload) });
  },
  listReceived() {
    return request('/reviews');
  },
  listGiven() {
    return request('/reviews/given');
  },
};

export default { auth, campaigns, applications, creators, companies, messages, reviews };
