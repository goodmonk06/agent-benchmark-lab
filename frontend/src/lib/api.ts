const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Task Suites
  async getSuites() {
    return this.request('/suites');
  }

  async getSuite(id: string) {
    return this.request(`/suites/${id}`);
  }

  async createSuite(data: any) {
    return this.request('/suites', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSuite(id: string, data: any) {
    return this.request(`/suites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSuite(id: string) {
    return this.request(`/suites/${id}`, {
      method: 'DELETE',
    });
  }

  // Task Items
  async createTask(data: any) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: any) {
    return this.request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  // Agent Profiles
  async getAgents() {
    return this.request('/agents');
  }

  async getAgent(id: string) {
    return this.request(`/agents/${id}`);
  }

  async createAgent(data: any) {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAgent(id: string, data: any) {
    return this.request(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAgent(id: string) {
    return this.request(`/agents/${id}`, {
      method: 'DELETE',
    });
  }

  // Benchmark Runs
  async getRuns() {
    return this.request('/runs');
  }

  async getRun(id: string) {
    return this.request(`/runs/${id}`);
  }

  async createRun(data: any) {
    return this.request('/runs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteRun(id: string) {
    return this.request(`/runs/${id}`, {
      method: 'DELETE',
    });
  }

  async getRunMatrix(id: string) {
    return this.request(`/runs/${id}/matrix`);
  }

  async getRunStatus(id: string) {
    return this.request(`/runs/${id}/status`);
  }
}

export const api = new ApiClient(API_URL);
