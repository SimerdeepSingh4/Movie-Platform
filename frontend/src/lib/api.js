import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // The backend uses cookies for auth (req.cookies.token), so withCredentials: true
    // is all that is needed. No need to manually attach a Bearer token.
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., clear user state and redirect to login)
      localStorage.removeItem('movie_user');
      // If window is defined, you can redirect: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
