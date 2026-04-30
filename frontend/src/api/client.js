import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

const client = axios.create({ baseURL: API_BASE, timeout: 10000 });

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
    }
    return Promise.reject(err);
  }
);

export default client;

// Helpers
export const collegesAPI = {
  list: (params) => client.get('/colleges', { params }),
  get: (id) => client.get(`/colleges/${id}`),
  filters: () => client.get('/colleges/meta/filters'),
  postReview: (id, data) => client.post(`/colleges/${id}/reviews`, data),
};

export const compareAPI = {
  compare: (ids) => client.get('/compare', { params: { ids: ids.join(',') } }),
};

export const predictAPI = {
  predict: (data) => client.post('/predict', data),
  exams: () => client.get('/predict/exams'),
};

export const qaAPI = {
  list: (params) => client.get('/questions', { params }),
  get: (id) => client.get(`/questions/${id}`),
  ask: (data) => client.post('/questions', data),
  answer: (id, data) => client.post(`/questions/${id}/answers`, data),
};

export const authAPI = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  me: () => client.get('/auth/me'),
};

export const savedAPI = {
  getColleges: () => client.get('/saved/colleges'),
  saveCollege: (college_id) => client.post('/saved/colleges', { college_id }),
  unsaveCollege: (id) => client.delete(`/saved/colleges/${id}`),
  getComparisons: () => client.get('/saved/comparisons'),
  saveComparison: (data) => client.post('/saved/comparisons', data),
  deleteComparison: (id) => client.delete(`/saved/comparisons/${id}`),
};
