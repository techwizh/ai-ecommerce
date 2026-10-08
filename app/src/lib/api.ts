import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Only needed when testing on a real phone on your home Wi-Fi
const LAN_IP = "192.168.88.10";

// In production, set EXPO_PUBLIC_API_URL (for example https://your-api.onrender.com/api)
const DEFAULT_URL =
  Platform.OS === "web"
    ? "http://localhost:5000/api"
    : `http://${LAN_IP}:5000/api`;

export const API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

export const TOKEN_KEY = "auth_token";

const api = axios.create({ baseURL: API_URL, timeout: 30000 });

// Attach the saved token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getErrorMessage = (err: any): string =>
  err?.response?.data?.message || err?.message || "Something went wrong";

export default api;