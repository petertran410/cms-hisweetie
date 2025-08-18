import { CK_JWT_TOKEN } from '@/states/common';
import axios from 'axios';
import Cookies from 'js-cookie';

export const API = {
  request: (config) => {
    const websiteCode = localStorage.getItem('website');
    const baseUrlDefault =
      websiteCode === 'dieptra' ? import.meta.env.VITE_DIEP_TRA_API_DOMAIN : import.meta.env.VITE_LERMAO_API_DOMAIN;

    const fallbackUrl = 'https://api.gaulermao.com';
    const apiUrl = baseUrlDefault || fallbackUrl;

    const { baseUrl = apiUrl, method = 'GET', url, params, headers, isUpload } = config;

    const token = Cookies.get(CK_JWT_TOKEN);

    const requestConfig = {
      url: `${baseUrl}${url}`,
      method,
      headers: {
        'Content-Type': isUpload ? 'multipart/form-data' : 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      data: method !== 'GET' ? params : undefined,
      params: method === 'GET' ? params : undefined,
      timeout: 60000,
      timeoutErrorMessage: 'Hệ thống không phản hồi. Vui lòng thử lại sau!'
    };

    return axios(requestConfig)
      .then((response) => {
        console.log('✅ API Success:', response.status);
        return response.data;
      })
      .catch((e) => {
        console.error('❌ API Error:', {
          url: requestConfig.url,
          status: e?.response?.status,
          message: e?.response?.data?.message || e.message,
          data: e?.response?.data
        });

        if (e?.response?.status === 401) {
          console.log('🚨 401 Unauthorized - Clearing token');
          Cookies.remove(CK_JWT_TOKEN);
          window.location.href = '/login';
        }

        const error = e?.response?.data ? { message: e?.response?.data?.description } : e;
        return Promise.reject(error);
      });
  },

  upload: (config) => {
    const { headers, file, url = '/api/file/upload', responseType } = config;

    const token = Cookies.get(CK_JWT_TOKEN);

    if (!file) {
      return Promise.resolve(null);
    }

    const formData = new FormData();
    formData.append('file', file);

    const websiteCode = localStorage.getItem('website');
    const baseUrlDefault =
      websiteCode === 'dieptra' ? import.meta.env.VITE_DIEP_TRA_API_DOMAIN : import.meta.env.VITE_LERMAO_API_DOMAIN;

    // Fallback nếu environment variable không được set
    const fallbackUrl = 'https://api.gaulermao.com';
    const apiUrl = baseUrlDefault || fallbackUrl;

    const requestConfig = {
      url: `${apiUrl}${url}`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Force-Signature': import.meta.env.VITE_API_KEY,
        ...headers
      },
      data: formData,
      timeout: 20000,
      timeoutErrorMessage: 'Hệ thống không phản hồi. Vui lòng thử lại sau!',
      responseType
    };

    return axios(requestConfig)
      .then((response) => {
        return response.data;
      })
      .catch((e) => {
        console.error('❌ Upload Error:', e);
        return Promise.reject(e?.response?.data || e);
      });
  }
};
