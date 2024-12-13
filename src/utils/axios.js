import axios from 'axios';

const instance = axios.create({
    baseURL: "https://cms.emkaan.sa/api"
});

// Request interceptor
instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
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
        // Check if error is due to invalid token
        const isAuthError = error.response?.status === 401 &&
            (error.response?.data?.error === 'Unauthorized: Please re-login to continue.' ||
                error.response?.data?.error === 'Not authorized, no token' ||
                error.response?.data?.error === 'User not found');
        if (isAuthError) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default instance;
