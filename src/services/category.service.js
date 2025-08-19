// src/services/category.service.js (CMS) - Thay thế hoàn toàn
import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// ✅ Hook để lấy danh sách categories có phân trang (cho Category List)
export const useQueryCategoryList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};

  const queryKey = ['GET_CATEGORY_LIST', page];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/paginated',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1
        }
      });

      // Transform data để match với component hiện tại
      return {
        content: response?.data || [],
        totalElements: response?.pagination?.total || 0,
        pageNumber: response?.pagination?.pageNumber || 0,
        pageSize: response?.pagination?.pageSize || 10
      };
    }
  });
};

// ✅ Hook để lấy categories theo parent ID (cho Sort feature)
export const useQueryCategoryListByParentId = (parentId) => {
  const queryKey = ['GET_CATEGORY_LIST_BY_PARENT_ID', parentId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/paginated',
        params: {
          pageSize: 1000,
          pageNumber: 0,
          parentId: parentId === 'HOME' ? undefined : parentId
        }
      });

      return response?.data || [];
    },
    enabled: parentId !== undefined
  });
};

// ✅ Hook để lấy categories cho dropdown (tất cả categories)
export const useQueryCategoriesForDropdown = () => {
  const queryKey = ['GET_CATEGORIES_FOR_DROPDOWN'];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/for-cms'
      });

      return response?.data || [];
    },
    staleTime: 5 * 60 * 1000
  });
};

// ✅ Mutation để tạo category mới
export const useCreateCategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/category',
        method: 'POST',
        params
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_CATEGORY_LIST']);
      queryClient.invalidateQueries(['GET_CATEGORIES_FOR_DROPDOWN']);

      showToast({ type: 'success', message: 'Tạo danh mục thành công' });
      navigate('/categories');
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
        url: `/api/category/${id}`,
        method: 'PATCH',
        params
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_CATEGORY_LIST']);
      queryClient.invalidateQueries(['GET_CATEGORIES_FOR_DROPDOWN']);

      showToast({ type: 'success', message: 'Cập nhật danh mục thành công' });
      navigate('/categories');
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
    mutationFn: ({ id }) => {
      return API.request({
        url: `/api/category/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_CATEGORY_LIST']);
      queryClient.invalidateQueries(['GET_CATEGORIES_FOR_DROPDOWN']);

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

// ✅ Hook để lấy category detail
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

// ✅ Mutation để sort categories (function bị thiếu)
export const useSortCategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => {
      // API để update priority của multiple categories
      const updatePromises = items.map((item) =>
        API.request({
          url: `/api/category/${item.id}`,
          method: 'PATCH',
          params: { priority: item.priority }
        })
      );

      return Promise.all(updatePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_CATEGORY_LIST']);
      queryClient.invalidateQueries(['GET_CATEGORIES_FOR_DROPDOWN']);

      showToast({ type: 'success', message: 'Sắp xếp danh mục thành công' });
      navigate('/categories');
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Sắp xếp thất bại. ${error.message}`
      });
    }
  });
};
