import { notification } from 'antd';
import queryString from 'query-string';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { API } from './API';

export const showToast = (config) => {
  const { type = 'success', message, content, duration } = config;
  notification[type]({ message, description: content, duration });
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

export const useGetParamsURL = () => {
  const location = useLocation();
  return queryString.parse(location.search);
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
  const { pathname } = useLocation();
  return {
    isCreate: !pathname.includes('/edit') && !pathname.includes('/detail'),
    isUpdate: pathname.includes('/edit'),
    isDetail: pathname.includes('/detail')
  };
};

export const useScrollTop = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
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

export const getHtmlContentWithTOC = (html, hasTOC) => {
  if (!hasTOC) {
    return html.replace('<toc></toc>', '');
  }
  if (html.startsWith('<toc></toc>')) {
    return transformHtmlWithHeadingId(html);
  }
  return `<toc></toc>${transformHtmlWithHeadingId(html)}`;
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
