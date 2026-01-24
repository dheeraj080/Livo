import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useMemo } from "react";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

export const usePrivateApi = () => {
  const { getAccessTokenSilently } = useAuth0();

  // We use useMemo to ensure we don't recreate the interceptor on every render
  useMemo(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      try {
        const token = await getAccessTokenSilently();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Auth0 Token Error", error);
      }
      return config;
    });

    return () => api.interceptors.request.eject(interceptor);
  }, [getAccessTokenSilently]);

  return api;
};