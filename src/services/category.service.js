import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const useQueryCategoryList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};

  const queryKey = ['GET_CATEGORY_LIST', page];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        console.log('Fetching categories for page:', page); // Debug log

        const response = await API.request({
          url: '/api/category/for-cms'
        });

        if (!response.success || !response.data) {
          throw new Error('Invalid API response');
        }

        const allCategories = response.data || [];

        // ✅ Pagination logic
        const pageSize = 10;
        const pageNumber = Number(page) - 1;
        const startIndex = pageNumber * pageSize;
        const endIndex = startIndex + pageSize;
        const pageCategories = allCategories.slice(startIndex, endIndex);

        console.log('Page data:', {
          page,
          pageNumber,
          startIndex,
          endIndex,
          totalCategories: allCategories.length,
          pageCategories: pageCategories.length
        }); // Debug log

        return {
          content: pageCategories,
          totalElements: allCategories.length,
          pageNumber: pageNumber,
          pageSize: pageSize,
          data: pageCategories
        };
      } catch (error) {
        console.error('Error fetching categories:', error);

        return {
          content: [],
          totalElements: 0,
          pageNumber: 0,
          pageSize: 10,
          data: []
        };
      }
    },
    retry: 1,
    retryDelay: 500,
    staleTime: 30 * 1000,
    cacheTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    keepPreviousData: false
  });
};

export const useRefreshCategoryList = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries(['GET_CATEGORY_LIST']);
    console.log('Category list cache invalidated'); // Debug log
  };
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

export const useQueryCategoriesForDropdown = () => {
  const queryKey = ['GET_CATEGORIES_FOR_DROPDOWN'];

  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const response = await API.request({
          url: '/api/category/for-cms'
        });

        if (!response.success || !response.data) {
          return [];
        }

        return response.data.map((cat) => ({
          id: cat.id,
          name: cat.name,
          displayName: cat.displayName || cat.name,
          value: cat.id,
          label: cat.displayName || cat.name,
          level: cat.level || 0,
          parent_id: cat.parent_id
        }));
      } catch (error) {
        console.error('Error fetching categories for dropdown:', error);
        return [];
      }
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
