import { notification } from 'antd';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { API } from './API';
import { toast } from 'react-toastify';

// Convert timestamp to readable format
export const convertTimestamp = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }

    // Format: DD/MM/YYYY HH:mm
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return '';
  }
};

// Convert timestamp to date only (DD/MM/YYYY)
export const convertTimestampToDate = (timestamp) => {
  if (!timestamp) return '';

  try {
    const date = new Date(timestamp);

    if (isNaN(date.getTime())) {
      return '';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error converting timestamp to date:', error);
    return '';
  }
};

// Get current params from URL
export const useGetParamsURL = () => {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(window.location.search);
  const params = {};

  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }

  return params;
};

export const showToast = ({ type = 'success', message = '' }) => {
  const toastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true
  };

  switch (type) {
    case 'success':
      toast.success(message, toastOptions);
      break;
    case 'error':
      toast.error(message, toastOptions);
      break;
    case 'warning':
      toast.warning(message, toastOptions);
      break;
    case 'info':
      toast.info(message, toastOptions);
      break;
    default:
      toast(message, toastOptions);
  }
};

export const formatNumber = (number) => {
  if (!number && number !== 0) return '';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const convertSlugURL = (str) => {
  if (!str) return '';

  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random string
export const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const paramsToObject = (entries) => {
  const result = {};
  for (const [key, value] of entries) {
    result[key] = value;
  }
  return result;
};

export const useSetParamsURL = () => {
  const setSearchParams = useSearchParams()[1];

  return (params) => setSearchParams(new URLSearchParams(params));
};

export const useRemoveParamURL = () => {
  const setSearchParams = useSearchParams()[1];

  return (keys = []) =>
    setSearchParams((curr) => {
      const newParams = paramsToObject(curr.entries());
      keys.forEach((key) => {
        delete newParams[key];
      });
      return new URLSearchParams(newParams);
    });
};

export const useParamsURL = () => {
  const paramsURL = useGetParamsURL();
  const setParamsURL = useSetParamsURL();
  return { paramsURL, setParamsURL };
};

export const convertFileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

export const formatCurrency = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price));

export const uploadFileCdn = (fileData) => {
  const { url, file } = fileData || {};

  if (!url && !file) {
    return Promise.resolve(null);
  }

  return url ? Promise.resolve(url) : API.upload({ file });
};

export const useFormType = () => {
  const location = useLocation();
  const { pathname } = location;

  const isCreate = pathname.includes('/create');
  const isEdit = pathname.includes('/edit');
  const isDetail = pathname.includes('/detail');

  return {
    isCreate,
    isEdit,
    isDetail,
    formType: isCreate ? 'create' : isEdit ? 'edit' : isDetail ? 'detail' : 'unknown'
  };
};

export const useScrollTop = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
};

export const transformHtmlWithHeadingId = (html) => {
  let idCounter = 0; // Dùng để tạo id duy nhất

  // Sử dụng DOMParser để chuyển chuỗi HTML thành Document object
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Duyệt qua các thẻ heading (h1 đến h6)
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

  headings.forEach((heading) => {
    // Kiểm tra nếu thẻ chưa có id, thì thêm id duy nhất
    if (!heading.id) {
      heading.id = `heading-${idCounter++}`;
    }
  });

  // Trả về chuỗi HTML đã cập nhật
  return doc.documentElement.outerHTML;
};

export const getHtmlContentWithTOC = (htmlContent, hasTableOfContents) => {
  if (!htmlContent) return '';

  if (hasTableOfContents) {
    // Thêm TOC marker vào đầu content
    return htmlContent.startsWith('<toc></toc>') ? htmlContent : `<toc></toc>${htmlContent}`;
  } else {
    // Remove TOC marker nếu có
    return htmlContent.replace('<toc></toc>', '');
  }
};

const attachMediaListener = (query, callback) => {
  try {
    query.addEventListener('change', callback);
    return () => query.removeEventListener('change', callback);
  } catch (e) {
    query.addListener(callback);
    return () => query.removeListener(callback);
  }
};

const getInitialValueMedia = (query, initialValue) => {
  if (typeof initialValue === 'boolean') {
    return initialValue;
  }

  if (typeof window !== 'undefined' && 'matchMedia' in window) {
    return window.matchMedia(query).matches;
  }

  return false;
};

export const useMediaQuery = (query, initialValue = true, getInitialValueInEffect = false) => {
  const [matches, setMatches] = useState(
    getInitialValueInEffect ? initialValue : getInitialValueMedia(query, initialValue)
  );
  const queryRef = useRef();

  useEffect(() => {
    if ('matchMedia' in window) {
      queryRef.current = window.matchMedia(query);
      setMatches(queryRef?.current?.matches);
      return attachMediaListener(queryRef.current, (event) => setMatches(event.matches));
    }

    return undefined;
  }, [query]);

  return matches;
};
