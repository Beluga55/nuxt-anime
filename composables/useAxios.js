import axios from "axios";

export function useAxios() {
  const axiosInstance = ref(null);

  const createAxiosClient = () => {
    const instance = axios.create({
      baseURL: useRuntimeConfig().public.apiUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("token");
          // You might want to redirect to login page or refresh the token here
        }
        return Promise.reject(error);
      }
    );

    axiosInstance.value = instance;
    return instance;
  };

  return {
    axiosInstance,
    createAxiosClient,
  };
}
