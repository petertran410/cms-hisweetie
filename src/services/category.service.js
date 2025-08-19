// src/services/category.service.js (CMS) - Thay đổi hoàn toàn
import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// ✅ Hook mới để lấy categories cho CMS với endpoint mới
export const useQueryCategoryList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};

  const queryKey = ['GET_CATEGORY_LIST', page];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/paginated', // ✅ Endpoint mới
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1
        }
      });

      return response;
    }
  });
};

// ✅ Hook để lấy categories cho dropdown/select
export const useQueryCategoriesForCMS = () => {
  const queryKey = ['GET_CATEGORIES_FOR_CMS'];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/for-cms' // ✅ Endpoint mới cho CMS
      });

      return response?.data || [];
    },
    staleTime: 5 * 60 * 1000 // Cache 5 phút
  });
};

// ✅ Hook để lấy categories theo parent (cho hierarchy)
export const useQueryCategoryListByParentId = (parentId) => {
  const queryKey = ['GET_CATEGORY_LIST_BY_PARENT_ID', parentId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/paginated', // ✅ Endpoint mới
        params: {
          pageSize: 1000,
          pageNumber: 0,
          parentId
        }
      });

      return response?.data || [];
    },
    enabled: typeof parentId !== 'undefined' && !!`${parentId}`.length
  });
};

// ✅ Hook để lấy tree structure
export const useQueryCategoryTree = () => {
  const queryKey = ['GET_CATEGORY_TREE'];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/tree' // ✅ Endpoint mới
      });

      return response?.data || [];
    }
  });
};

// ✅ Mutation để tạo category mới
export const useCreateCategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/category', // ✅ Endpoint mới
        method: 'POST',
        params
      });
    },
    onSuccess: () => {
      // Invalidate các cache liên quan
      queryClient.invalidateQueries(['GET_CATEGORY_LIST']);
      queryClient.invalidateQueries(['GET_CATEGORIES_FOR_CMS']);
      queryClient.invalidateQueries(['GET_CATEGORY_TREE']);

      showToast({ type: 'success', message: 'Tạo danh mục thành công' });
      navigate(-1);
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Tạo danh mục thất bại. ${error.message}`
      });
    }
  });
};

// ✅ Mutation để cập nhật category
export const useUpdateCategory = (id) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/category/${id}`, // ✅ Endpoint mới
        method: 'PATCH',
        params
      });
    },
    onSuccess: () => {
      // Invalidate các cache liên quan
      queryClient.invalidateQueries(['GET_CATEGORY_LIST']);
      queryClient.invalidateQueries(['GET_CATEGORIES_FOR_CMS']);
      queryClient.invalidateQueries(['GET_CATEGORY_TREE']);

      showToast({ type: 'success', message: 'Cập nhật danh mục thành công' });
      navigate(-1);
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Cập nhật thất bại. ${error.message}`
      });
    }
  });
};

// ✅ Mutation để xóa category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => {
      return API.request({
        url: `/api/category/${id}`, // ✅ Endpoint mới
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      // Invalidate các cache liên quan
      queryClient.invalidateQueries(['GET_CATEGORY_LIST']);
      queryClient.invalidateQueries(['GET_CATEGORIES_FOR_CMS']);
      queryClient.invalidateQueries(['GET_CATEGORY_TREE']);

      showToast({ type: 'success', message: 'Xóa danh mục thành công' });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Xóa danh mục thất bại. ${error.message}`
      });
    }
  });
};

export const useQueryCategoryDetail = (id) => {
  const queryKey = ['GET_CATEGORY_DETAIL', id];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: `/api/category/${id}`
      });

      return response?.data || null;
    },
    enabled: !!id
  });
};
