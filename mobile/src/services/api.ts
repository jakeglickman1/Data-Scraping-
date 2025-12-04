import axios, { AxiosHeaders, AxiosRequestHeaders } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "travelmate_token";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
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
    const message =
      error.response?.data?.message ?? error.message ?? "Request failed";
    return Promise.reject(new Error(message));
  },
);

export const tokenStorage = {
  get: () => AsyncStorage.getItem(TOKEN_KEY),
  set: (value: string) => AsyncStorage.setItem(TOKEN_KEY, value),
  clear: () => AsyncStorage.removeItem(TOKEN_KEY),
};
