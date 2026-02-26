import axios from 'axios';
import { env } from '../config/env';

const API_BASE_URL = env.apiUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AUTH_KEY = 'compras_app_auth_key';

export const authStorage = {
  getToken: () => localStorage.getItem(AUTH_KEY),
  setToken: (token: string) => localStorage.setItem(AUTH_KEY, token),
  removeToken: () => localStorage.removeItem(AUTH_KEY),
};

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();

  if (token) {
    config.headers['x-api-token'] = token;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const request = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: any
): Promise<T> => {
  return api.request({
    method,
    params: { path },
    data,
  }).then(res => res.data);
};