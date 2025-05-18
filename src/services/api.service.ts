// services/api.service.ts
import axios from 'axios';

// Base API service
export class ApiService {
  baseUrl = process.env.VITE_API_URL || 'http://localhost:8084/api';

  // Get JWT token from cookies
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Create axios instance with auth headers
  protected createAxiosInstance() {
    const token = this.getToken();
    return axios.create({
      baseURL: this.baseUrl,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  // Generic GET request
  async get(url: string, params?: any) {
    try {
      const instance = this.createAxiosInstance();
      const response = await instance.get(url, { params });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic POST request
  async post(url: string, data?: any) {
    try {
      const instance = this.createAxiosInstance();
      const response = await instance.post(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic PUT request
  async put(url: string, data?: any) {
    try {
      const instance = this.createAxiosInstance();
      const response = await instance.put(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic PATCH request
  async patch(url: string, data?: any) {
    try {
      const instance = this.createAxiosInstance();
      const response = await instance.patch(url, data);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Generic DELETE request
  async delete(url: string) {
    try {
      const instance = this.createAxiosInstance();
      const response = await instance.delete(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any) {
    console.error('API Error:', error);
    throw error;
  }
}
