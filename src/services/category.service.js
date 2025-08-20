import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const useQueryCategoryList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_CATEGORY_LIST', page, keyword];

  return useQuery({
    queryKey,
    queryFn: () => {
      return API.request({
        url: '/api/category/paginated',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          name: keyword
        }
      });
    }
  });
};

export const useQueryCategoryListByParentId = (parentId) => {
  const queryKey = ['GET_CATEGORY_LIST_BY_PARENT_ID', parentId];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/for-cms'
      });

      const allCategories = response?.data || [];

      // Filter by parent ID
      if (parentId === 'HOME' || !parentId) {
        return allCategories.filter((cat) => !cat.parent_id);
      } else {
        return allCategories.filter((cat) => cat.parent_id === parentId);
      }
    },
    enabled: parentId !== undefined
  });
};

export const useQueryCategoriesForProductDropdown = () => {
  const queryKey = ['GET_CATEGORIES_FOR_PRODUCT_DROPDOWN'];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/category/dropdown'
      });

      return Array.isArray(response) ? response : [];
    },
    staleTime: 5 * 60 * 1000
  });
};

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

export const useSortCategory = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items) => {
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
