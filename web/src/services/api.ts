import axios, { AxiosHeaders } from "axios";
import type { AxiosRequestHeaders } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "travelmate_token";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getSync();
  if (token) {
    const headers =
      config.headers instanceof AxiosHeaders
        ? config.headers
        : AxiosHeaders.from(config.headers as AxiosRequestHeaders);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message ?? error.message ?? "Request failed";
    return Promise.reject(new Error(message));
  },
);

export const tokenStorage = {
  get: () => Promise.resolve(localStorage.getItem(TOKEN_KEY)),
  getSync: () => localStorage.getItem(TOKEN_KEY),
  set: (value: string) => {
    localStorage.setItem(TOKEN_KEY, value);
    return Promise.resolve();
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    return Promise.resolve();
  },
};
