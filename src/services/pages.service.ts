// src/services/pages.service.js
import { API } from '../utils/API';
import { showToast, useGetParamsURL } from '../utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

// =================================
// QUERY HOOKS (Lấy dữ liệu)
// =================================

export const useQueryPagesList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, title, slug, parentId, isActive } = paramsURL || {};

  const queryKey = ['GET_PAGES_LIST', page, title, slug, parentId, isActive];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/pages/admin/get-all',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          title,
          slug,
          parent_id: parentId,
          is_active: isActive
        }
      })
  });
};

export const useQueryPagesDetail = (id) => {
  const queryKey = ['GET_PAGES_DETAIL', id];
  const queryClient = useQueryClient();
  const dataClient = queryClient.getQueryData(queryKey);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: `/api/pages/admin/${id}`
      }),
    enabled: !!id
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};

// Lấy danh sách trang cha (để chọn parent)
export const useQueryParentPagesList = () => {
  const queryKey = ['GET_PARENT_PAGES_LIST'];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/pages/admin/get-all',
        params: {
          pageSize: 100,
          pageNumber: 0,
          parent_id: null, // Chỉ lấy trang gốc
          is_active: true
        }
      })
  });
};

// Lấy hierarchy cho client (dùng trong preview)
export const useQueryPagesHierarchy = (parentSlug) => {
  const queryKey = ['GET_PAGES_HIERARCHY', parentSlug];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/pages/client/hierarchy',
        params: parentSlug ? { parentSlug } : {}
      })
  });
};

// =================================
// MUTATION HOOKS (Thay đổi dữ liệu)
// =================================

export const useCreatePages = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/pages',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Tạo trang thành công' });
          navigate('/pages');
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useUpdatePages = (id) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/pages/${id}`,
        method: 'PATCH',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Cập nhật trang thành công' });
          navigate('/pages');
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useDeletePages = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/pages/${id}`,
        method: 'DELETE'
      })
        .then(() => {
          showToast({ type: 'success', message: 'Xoá trang thành công' });
          queryClient.resetQueries({ queryKey: ['GET_PAGES_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

// =================================
// CLIENT HOOKS (Dùng cho client preview)
// =================================

export const useQueryPageBySlug = (slug) => {
  const queryKey = ['GET_PAGE_BY_SLUG', slug];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: `/api/pages/client/by-slug/${slug}`
      }),
    enabled: !!slug
  });
};
