const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  removeToken() {
    localStorage.removeItem('token');
  }

  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.auth !== false),
    };

    console.log('[API] Request:', { url, method: config.method || 'GET', body: config.body });

    try {
      const response = await fetch(url, config);

      console.log('[API] Response:', { status: response.status, statusText: response.statusText });

      if (response.status === 401) {
        this.removeToken();
        window.location.href = '/login';
        throw new Error('Unauthorized');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        console.error('[API] Error response:', error);
        throw new Error(error.detail || 'Request failed');
      }

      // For blob responses (file downloads)
      if (options.responseType === 'blob') {
        return response.blob();
      }

      // For empty responses
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      console.log('[API] Response data:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async register(username, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      auth: false,
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  logout() {
    this.removeToken();
  }

  // Project endpoints
  async getProjects() {
    return this.request('/projects/');
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`);
  }

  async createProject(projectData) {
    return this.request('/projects/', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(projectId, updates) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Generation endpoints
  async generateOutline(topic, docType, numItems = 5) {
    return this.request('/generate/outline', {
      method: 'POST',
      body: JSON.stringify({ topic, doc_type: docType, num_items: numItems }),
    });
  }

  async generateContent(projectId) {
    return this.request('/generate/content', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
  }

  async refineContent(sectionId, prompt) {
    return this.request('/generate/refine', {
      method: 'POST',
      body: JSON.stringify({ section_id: sectionId, prompt }),
    });
  }

  async addFeedback(sectionId, feedback, comment = null) {
    return this.request('/generate/feedback', {
      method: 'POST',
      body: JSON.stringify({ section_id: sectionId, feedback, comment }),
    });
  }

  // Export endpoint
  async exportDocument(projectId) {
    const blob = await this.request(`/export/${projectId}`, {
      responseType: 'blob',
    });
    return blob;
  }
}

export const apiService = new ApiService();
