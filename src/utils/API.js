import { CK_JWT_TOKEN } from '@/states/common';
import axios from 'axios';
import Cookies from 'js-cookie';

const getWebsiteCode = () => localStorage.getItem('website') || 'lermao';

let isRenewing = false;
let renewPromise = null;

const getBaseUrl = () => {
  const websiteCode = getWebsiteCode();
  const baseUrlDefault =
    websiteCode === 'dieptra' ? import.meta.env.VITE_DIEP_TRA_API_DOMAIN : import.meta.env.VITE_LERMAO_API_DOMAIN;
  return baseUrlDefault || 'https://api.gaulermao.com';
};

const renewToken = async () => {
  // Nếu đang renew rồi thì chờ kết quả
  if (isRenewing && renewPromise) {
    return renewPromise;
  }

  isRenewing = true;
  renewPromise = (async () => {
    try {
      const currentToken = Cookies.get(CK_JWT_TOKEN);
      if (!currentToken) return null;

      const response = await axios({
        url: `${getBaseUrl()}/api/auth/renew`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
          'X-Site-Code': getWebsiteCode()
        },
        timeout: 10000
      });

      const newToken = response.data?.token;
      if (newToken) {
        Cookies.set(CK_JWT_TOKEN, newToken, { expires: 60 });
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('Token renew failed:', error?.response?.status);
      return null;
    } finally {
      isRenewing = false;
      renewPromise = null;
    }
  })();

  return renewPromise;
};

export const API = {
  request: (config) => {
    const websiteCode = getWebsiteCode();
    const apiUrl = getBaseUrl();

    const { baseUrl = apiUrl, method = 'GET', url, params, headers, isUpload } = config;

    const token = Cookies.get(CK_JWT_TOKEN);

    const requestConfig = {
      url: `${baseUrl}${url}`,
      method,
      headers: {
        'Content-Type': isUpload ? 'multipart/form-data' : 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Site-Code': websiteCode,
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
      .catch(async (e) => {
        const status = e?.response?.status;

        // 401: thử renew token 1 lần trước khi logout
        if (status === 401 && !config._retried) {
          const newToken = await renewToken();

          if (newToken) {
            // Retry request gốc với token mới
            config._retried = true;
            requestConfig.headers.Authorization = `Bearer ${newToken}`;
            try {
              const retryResponse = await axios(requestConfig);
              return retryResponse.data;
            } catch (retryError) {
              // Retry cũng fail → logout
              Cookies.remove(CK_JWT_TOKEN);
              window.location.href = '/login';
              return Promise.reject(retryError);
            }
          } else {
            // Renew thất bại → logout
            Cookies.remove(CK_JWT_TOKEN);
            window.location.href = '/login';
            return Promise.reject(e);
          }
        }

        console.error('❌ API Error:', {
          url: requestConfig.url,
          status,
          message: e?.response?.data?.message || e.message
        });

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

    const websiteCode = getWebsiteCode();
    const apiUrl = getBaseUrl();

    const requestConfig = {
      url: `${apiUrl}${url}`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Force-Signature': import.meta.env.VITE_API_KEY,
        'X-Site-Code': websiteCode,
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
