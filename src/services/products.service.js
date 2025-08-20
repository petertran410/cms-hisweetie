import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { useSearchParams } from 'react-router-dom';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useQueryProductsList = () => {
  const [searchParams] = useSearchParams();

  const page = searchParams.get('page') || '1';
  const keyword = searchParams.get('keyword');
  const categoryId = searchParams.get('categoryId');
  const is_visible = searchParams.get('is_visible');

  const queryKey = ['GET_PRODUCTS_LIST', page, keyword, categoryId, is_visible];

  return useQuery({
    queryKey,
    queryFn: () => {
      const apiParams = {
        pageSize: 10,
        pageNumber: Number(page) - 1,
        includeHidden: true
      };

      if (keyword) {
        apiParams.title = keyword;
      }

      if (categoryId) {
        apiParams.categoryId = categoryId;
      }

      if (is_visible !== undefined && is_visible !== '') {
        apiParams.is_visible = is_visible;
      }

      return API.request({
        url: '/api/product/cms/get-all',
        params: apiParams
      });
    }
  });
};

export const useCreateProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) =>
      API.request({
        url: '/api/product',
        method: 'POST',
        params
      }),
    onSuccess: () => {
      showToast({ type: 'success', message: 'Tạo sản phẩm thành công' });
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
    },
    onError: (e) => {
      showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
    }
  });
};

export const useUpdateProducts = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      console.log('🚀 Update request data:', params);
      return API.request({
        url: `/api/product/${id}`,
        method: 'PATCH',
        params
      });
    },
    oonSuccess: (data) => {
      showToast({
        type: 'success',
        message: '✅ Cập nhật sản phẩm thành công!',
        duration: 3000
      });
    },
    onError: (e) => {
      showToast({
        type: 'error',
        message: `❌ Cập nhật thất bại: ${e.message}`,
        duration: 5000
      });
    }
  });
};

export const useDeleteProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      const { id } = params;
      return API.request({
        url: `/api/product/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      showToast({ type: 'success', message: 'Xoá sản phẩm thành công' });
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
    },
    onError: (e) => {
      showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
    }
  });
};

export const useQueryProductDetail = (id) => {
  const queryKey = ['GET_PRODUCT_DETAIL', id];

  return useQuery({
    queryKey,
    queryFn: () => API.request({ url: `/api/product/get-by-id/${id}` }),
    enabled: !!id
  });
};

export const useQueryProductsByHierarchicalCategories = (searchParams = {}) => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  // Merge URL params with provided search params
  const finalParams = {
    pageSize: 10,
    pageNumber: Number(page) - 1,
    title: keyword,
    ...searchParams
  };

  const queryKey = ['GET_PRODUCTS_HIERARCHICAL', finalParams];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/by-hierarchical-categories',
        params: finalParams
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });
};

export const useQueryCategoryHierarchyInfo = (categoryIds) => {
  const queryKey = ['GET_CATEGORY_HIERARCHY_INFO', categoryIds];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/categories/hierarchy-info',
        params: categoryIds ? { categoryIds } : {}
      }),
    staleTime: 10 * 60 * 1000,
    cacheTime: 30 * 60 * 1000
  });
};

export const useSyncProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      API.request({
        url: '/api/product/kiotviet/sync/products',
        method: 'POST'
      }),
    onSuccess: (data) => {
      showToast({
        type: 'success',
        message: `Đồng bộ thành công! ${data.summary?.synced || 0} sản phẩm đã được cập nhật.`
      });
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
      queryClient.invalidateQueries({ queryKey: ['GET_SYNC_STATUS'] });
    },
    onError: (e) => {
      showToast({
        type: 'error',
        message: `Đồng bộ thất bại: ${e.message}`
      });
    }
  });
};

export const useTestKiotVietConnection = () => {
  return useMutation({
    mutationFn: () => {
      return API.request({
        url: '/api/product/sync/test-connection',
        method: 'GET'
      });
    },
    onSuccess: (data) => {
      showToast({
        type: data.success ? 'success' : 'error',
        message: data.message,
        duration: 5000
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Kiểm tra kết nối thất bại: ${error.message}`,
        duration: 5000
      });
    }
  });
};

export const useQuerySyncStatus = () => {
  return useQuery({
    queryKey: ['GET_SYNC_STATUS'],
    queryFn: () => API.request({ url: '/api/product/kiotviet/sync/status' }),
    staleTime: 30000
  });
};

export const useToggleProductVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId }) => {
      return API.request({
        url: `/api/product/toggle-visibility/${productId}`,
        method: 'PATCH'
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCT_DETAIL'] });
    },
    onError: (error) => {
      console.error('Toggle visibility error:', error);
    }
  });
};

export const useBulkToggleVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productIds, is_visible }) => {
      return API.request({
        url: '/api/product/bulk-toggle-visibility',
        method: 'PATCH',
        params: {
          productIds,
          is_visible
        }
      });
    },
    onSuccess: (data) => {
      showToast({
        type: 'success',
        message: data.message || 'Cập nhật hàng loạt thành công'
      });
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
    },
    onError: (e) => {
      showToast({
        type: 'error',
        message: `Cập nhật hàng loạt thất bại: ${e.message}`
      });
    }
  });
};

export const useQueryVisibilityStats = () => {
  return useQuery({
    queryKey: ['GET_VISIBILITY_STATS'],
    queryFn: () => API.request({ url: '/api/product/visibility-stats' }),
    staleTime: 60000
  });
};

export const useQueryProductsForCMS = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword, categoryId, is_visible } = paramsURL || {};

  const queryKey = ['GET_PRODUCTS_FOR_CMS', page, keyword, categoryId, is_visible];

  return useQuery({
    queryKey,
    queryFn: () => {
      return API.request({
        url: '/api/product/cms/get-all',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          title: keyword,
          categoryId,
          is_visible
        }
      });
    }
  });
};

export const useQueryCategoriesForProductDropdown = () => {
  const queryKey = ['GET_CATEGORIES_FOR_PRODUCT_DROPDOWN'];

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

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, categoryId }) => {
      return API.request({
        url: `/api/product/${productId}/category`,
        method: 'PATCH',
        data: { category_id: categoryId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_PRODUCTS_FOR_CMS']);
      showToast({
        type: 'success',
        message: 'Cập nhật danh mục sản phẩm thành công'
      });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Cập nhật thất bại. ${error.message}`
      });
    }
  });
};
