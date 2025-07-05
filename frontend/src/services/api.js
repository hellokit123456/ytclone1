import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
                        refresh: refreshToken
                    });
                    localStorage.setItem('access_token', response.data.access);
                    return api.request(error.config);
                } catch (refreshError) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: (credentials) => api.post('/auth/login/', credentials),
    register: (userData) => api.post('/auth/register/', userData),
    logout: () => api.post('/auth/logout/'),
};

export const videoService = {
    getVideos: (params) => api.get('/videos/', { params }),
    getVideo: (id) => api.get(`/videos/${id}/`),
    uploadVideo: (formData) => api.post('/videos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    likeVideo: (id, likeType) => api.post(`/videos/${id}/like/`, { like_type: likeType }),
    addToWatchLater: (id) => api.post(`/videos/${id}/watch-later/`),
    getComments: (videoId) => api.get(`/videos/${videoId}/comments/`),
    addComment: (videoId, content) => api.post(`/videos/${videoId}/comments/`, { content }),
    subscribe: (userId) => api.post(`/users/${userId}/subscribe/`),
    search: (query) => api.get('/videos/search/', { params: { q: query } }),
};

export default api;
