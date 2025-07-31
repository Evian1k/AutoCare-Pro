// API Service for CMIS Backend Connection
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // Helper method to make API calls
  async apiCall(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials) {
    return this.apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.apiCall('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Vehicle endpoints
  async getVehicles() {
    return this.apiCall('/api/vehicles');
  }

  async createVehicle(vehicleData) {
    return this.apiCall('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  }

  async updateVehicle(id, vehicleData) {
    return this.apiCall(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  async deleteVehicle(id) {
    return this.apiCall(`/api/vehicles/${id}`, {
      method: 'DELETE',
    });
  }

  // Service endpoints
  async getServices() {
    return this.apiCall('/api/services');
  }

  async createService(serviceData) {
    return this.apiCall('/api/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  }

  async updateService(id, serviceData) {
    return this.apiCall(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  }

  // Parts endpoints
  async getParts() {
    return this.apiCall('/api/parts');
  }

  async createPart(partData) {
    return this.apiCall('/api/parts', {
      method: 'POST',
      body: JSON.stringify(partData),
    });
  }

  async updatePart(id, partData) {
    return this.apiCall(`/api/parts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(partData),
    });
  }

  // Appointment endpoints
  async getAppointments() {
    return this.apiCall('/api/appointments');
  }

  async createAppointment(appointmentData) {
    return this.apiCall('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id, appointmentData) {
    return this.apiCall(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id) {
    return this.apiCall(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Incident Report endpoints
  async getIncidentReports() {
    return this.apiCall('/api/incident-reports');
  }

  async createIncidentReport(reportData) {
    return this.apiCall('/api/incident-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateIncidentReport(id, reportData) {
    return this.apiCall(`/api/incident-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async deleteIncidentReport(id) {
    return this.apiCall(`/api/incident-reports/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload endpoint
  async uploadFile(file, reportId) {
    const formData = new FormData();
    formData.append('file', file);
    if (reportId) {
      formData.append('report_id', reportId);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Health check endpoint
  async healthCheck() {
    return this.apiCall('/api/health');
  }

  // Test connection
  async testConnection() {
    try {
      const response = await this.healthCheck();
      return { success: true, data: response };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;