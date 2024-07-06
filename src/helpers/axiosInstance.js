import axios from 'axios';

// Create an instance of Axios
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL, 
});


axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
