import axios from 'axios';
import config from '../config';

// Add token to all requests if it exists
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => axios.post(`${config.apiUrl}${config.endpoints.auth.login}`, credentials),
  register: (userData) => axios.post(`${config.apiUrl}${config.endpoints.auth.register}`, userData),
};

export const pagesAPI = {
  getAllPages: () => axios.get(`${config.apiUrl}${config.endpoints.pages.base}`),
  getPageById: (id) => axios.get(`${config.apiUrl}${config.endpoints.pages.base}/${id}`),
  createPage: (pageData) => axios.post(`${config.apiUrl}${config.endpoints.pages.base}`, pageData),
  updatePage: (id, pageData) => axios.put(`${config.apiUrl}${config.endpoints.pages.base}/${id}`, pageData),
  deletePage: (id) => axios.delete(`${config.apiUrl}${config.endpoints.pages.base}/${id}`),
  reorderPage: (id, newPosition) =>
    axios.put(`${config.apiUrl}${config.endpoints.pages.reorder(id)}`, { newPosition }),
};

export const sectionsAPI = {
  getSections: (pageId) => axios.get(`${config.apiUrl}${config.endpoints.sections.base}?pageId=${pageId}`),
  getSectionById: (id) => axios.get(`${config.apiUrl}${config.endpoints.sections.base}/${id}`),
  createSection: (sectionData) => axios.post(`${config.apiUrl}${config.endpoints.sections.base}`, sectionData),
  updateSection: (id, sectionData) =>
    axios.put(`${config.apiUrl}${config.endpoints.sections.base}/${id}`, sectionData),
  deleteSection: (id) => axios.delete(`${config.apiUrl}${config.endpoints.sections.base}/${id}`),
  reorderSection: (id, newPosition) =>
    axios.put(`${config.apiUrl}${config.endpoints.sections.reorder(id)}`, { newPosition }),
};

export const uploadAPI = {
  uploadFile: (formData) =>
    axios.post(`${config.apiUrl}${config.endpoints.upload}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      maxContentLength: config.fileUploadSizeLimit,
      maxBodyLength: config.fileUploadSizeLimit,
    }),
};

export default {
  auth: authAPI,
  pages: pagesAPI,
  sections: sectionsAPI,
  upload: uploadAPI,
};
