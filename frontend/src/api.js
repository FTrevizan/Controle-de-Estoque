import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// anexa o token em toda requisição
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// token expirado ou inválido: volta para o login
api.interceptors.response.use(
  (resp) => resp,
  (erro) => {
    const emLogin = erro.config?.url?.includes('/auth/login');
    if (erro.response?.status === 401 && !emLogin) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(erro);
  }
);

export default api;