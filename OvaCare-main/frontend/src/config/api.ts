// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  ML_API_URL: import.meta.env.VITE_ML_API_URL || 'http://localhost:5001',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
};

export default API_CONFIG;