import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = {
  getApplications: (search = '') =>
    axios.get(`${API_BASE}/applications`, { params: search ? { search } : {} }),

  getApplication: (id) =>
    axios.get(`${API_BASE}/applications/${id}`),

  updateReviewStatus: (id, reviewStatus) =>
    axios.put(`${API_BASE}/applications/${id}/review-status`, { review_status: reviewStatus }),

  sendChat: (sessionId, message, applicationId = null) =>
    axios.post(`${API_BASE}/chat`, {
      session_id: sessionId,
      message,
      application_id: applicationId,
    }),

  getChatHistory: (sessionId) =>
    axios.get(`${API_BASE}/chat/${sessionId}/history`),

  seedDatabase: () =>
    axios.post(`${API_BASE}/seed`),
};
