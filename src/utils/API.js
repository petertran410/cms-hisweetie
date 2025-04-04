import { CK_JWT_TOKEN } from '@/states/common';
import axios from 'axios';
import Cookies from 'js-cookie';

export const API = {
  request: (config) => {
    const websiteCode = localStorage.getItem('website');
    const baseUrlDefault =
      websiteCode === 'dieptra' ? import.meta.env.VITE_DIEP_TRA_API_DOMAIN : import.meta.env.VITE_LERMAO_API_DOMAIN;

    const { baseUrl = baseUrlDefault, method = 'GET', url, params, headers, isUpload } = config;
    const token = Cookies.get(CK_JWT_TOKEN);
    const requestConfig = {
      url: `${baseUrl}${url}`,
      method,
      headers: {
        'Content-Type': isUpload ? 'multipart/form-data' : 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
        ...headers
      },
      data: method !== 'GET' ? params : undefined,
      params: method === 'GET' ? params : undefined,
      timeout: 60000,
      timeoutErrorMessage: 'Hệ thống không phản hồi. Vui lòng thử lại sau!'
    };

    return axios(requestConfig)
      .then((response) => {
        return response.data;
      })
      .catch((e) => {
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

    const requestConfig = {
      url: `${baseUrlDefault}${url}`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token ? `Bearer ${token}` : undefined,
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
        console.log('ducnh e', e);

        return Promise.reject(e?.response?.data || e);
      });
  }
};
