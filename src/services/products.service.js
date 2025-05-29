import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

export const useQueryProductsList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_PRODUCTS_LIST', page, keyword];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/by-categories',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          title: keyword
        }
      }),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });
};

/**
 * Hook to create a new product
 */
export const useCreateProducts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/product',
        method: 'POST',
        params
      });
    },
    onSuccess: () => {
      showToast({ type: 'success', message: 'Tạo sản phẩm thành công' });
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
      navigate(-1);
    },
    onError: (error) => {
      showToast({ type: 'error', message: `Thao tác thất bại. ${error.message}` });
    }
  });
};

export const useUpdateProducts = (id) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/product/${id}`,
        method: 'PATCH',
        params
      });
    },
    onSuccess: () => {
      showToast({ type: 'success', message: 'Cập nhật sản phẩm thành công' });
      // Invalidate both the list and detail cache
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_DETAIL', id] });
      navigate(-1);
    },
    onError: (error) => {
      showToast({ type: 'error', message: `Thao tác thất bại. ${error.message}` });
    }
  });
};

/**
 * Hook to delete a product
 */
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
      // Invalidate the products list cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
    },
    onError: (error) => {
      showToast({ type: 'error', message: `Thao tác thất bại. ${error.message}` });
    }
  });
};

/**
 * Hook to get product details by ID
 */
export const useQueryProductsDetail = (id) => {
  const queryKey = ['GET_PRODUCTS_DETAIL', id];
  const queryClient = useQueryClient();
  const dataClient = queryClient.getQueryData(queryKey);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: `/api/product/get-by-id/${id}`
      }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000 // 10 minutes
  });

  // Return cached data if available
  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }

  return { data, isLoading, error };
};

/**
 * Advanced hook to get products from specific hierarchical categories
 * This is used for more advanced filtering scenarios
 */
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

/**
 * Hook to get category hierarchy information
 */
export const useQueryCategoryHierarchyInfo = (categoryIds) => {
  const queryKey = ['GET_CATEGORY_HIERARCHY_INFO', categoryIds];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/categories/hierarchy-info',
        params: categoryIds ? { categoryIds } : {}
      }),
    staleTime: 10 * 60 * 1000, // 10 minutes - category structure doesn't change often
    cacheTime: 30 * 60 * 1000 // 30 minutes
  });
};

/**
 * Hook to sync products from KiotViet
 */
export const useSyncProducts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (syncParams = {}) => {
      return API.request({
        url: '/api/product/sync/target-categories',
        method: 'POST',
        params: syncParams
      });
    },
    onSuccess: (data) => {
      const message = data.success
        ? `Đồng bộ thành công ${data.totalSynced} sản phẩm từ Lermao và Trà Phượng Hoàng`
        : `Đồng bộ hoàn tất với ${data.errors?.length || 0} lỗi`;

      showToast({
        type: data.success ? 'success' : 'warning',
        message,
        duration: 10000 // Show for 10 seconds
      });

      // Invalidate products cache to refresh the listing
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
      queryClient.invalidateQueries({ queryKey: ['GET_PRODUCTS_HIERARCHICAL'] });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Đồng bộ thất bại: ${error.message}`,
        duration: 10000
      });
    }
  });
};

/**
 * Hook to test KiotViet connection
 */
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

/**
 * Hook to get sync status
 */
export const useQuerySyncStatus = () => {
  const queryKey = ['GET_SYNC_STATUS'];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/sync/status',
        method: 'GET'
      }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
  });
};
