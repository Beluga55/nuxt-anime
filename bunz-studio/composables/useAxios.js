import axios from "axios";

export function useAxios() {
  const axiosInstance = ref(null);

  const createAxiosClient = () => {
    const instance = axios.create({
      baseURL: useRuntimeConfig().public.apiUrl || 'http://localhost:8080',
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        if (process.client) {
          const token = localStorage.getItem("token");
          const tokenExpiration = localStorage.getItem("tokenExpiration");
          
          // Check token expiration before making request
          if (token && tokenExpiration) {
            const expirationDate = new Date(tokenExpiration);
            const currentDate = new Date();
            
            if (currentDate > expirationDate) {
              // Token expired, clear it
              localStorage.removeItem("token");
              localStorage.removeItem("tokenExpiration");
              localStorage.removeItem("userInfo");
              
              // Redirect to login if not already there
              if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
                window.location.href = '/login';
              }
              
              return Promise.reject(new Error('Token expired'));
            }
            
            config.headers.Authorization = `Bearer ${token}`;
          }
          
          // Add CSRF protection for non-GET requests
          if (config.method !== 'get') {
            config.headers['X-Requested-With'] = 'XMLHttpRequest';
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with retry logic
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response && error.response.status === 401) {
          // Don't retry if this is already a retry attempt
          if (originalRequest._retry) {
            if (process.client) {
              localStorage.removeItem("token");
              localStorage.removeItem("tokenExpiration");
              localStorage.removeItem("userInfo");
              
              // Redirect to login
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
            }
            return Promise.reject(error);
          }
          
          originalRequest._retry = true;
          
          // If refresh failed, clear auth and redirect
          if (process.client) {
            localStorage.removeItem("token");
            localStorage.removeItem("tokenExpiration");
            localStorage.removeItem("userInfo");
            
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
        
        // Handle network errors
        if (error.code === 'ECONNABORTED') {
          error.message = 'Request timeout. Please try again.';
        } else if (!error.response) {
          error.message = 'Network error. Please check your connection.';
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
