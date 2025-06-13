// src/services/products.service.js - CMS services for React + Vite

import { useMutation, useQuery } from '@tanstack/react-query';
import { API } from '../utils/API';
import { useGetParamsURL } from '../utils/helper';

/**
 * Get products list for CMS (includes all products, both visible and hidden)
 */
export const useQueryProductsList = () => {
  const params = useGetParamsURL();
  const { page = 1, keyword } = params;
  const queryKey = ['GET_PRODUCTS_LIST', page, keyword];

  return useQuery({
    queryKey,
    queryFn: () => {
      return API.request({
        url: '/api/product/admin/all', // Use admin endpoint to get all products
        params: {
          pageNumber: page - 1,
          pageSize: 10,
          ...(keyword && { title: keyword })
        }
      });
    }
  });
};

/**
 * Get single product details
 */
export const useQueryProductDetail = (id, options = {}) => {
  return useQuery({
    queryKey: ['GET_PRODUCT_DETAIL', id],
    queryFn: () => {
      return API.request({
        url: `/api/product/${id}`
      });
    },
    enabled: !!id,
    ...options
  });
};

/**
 * Create new product
 */
export const useCreateProduct = () => {
  return useMutation({
    mutationFn: (data) => {
      return API.request({
        url: '/api/product',
        method: 'POST',
        data
      });
    }
  });
};

/**
 * Update existing product
 */
export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: ({ id, ...data }) => {
      return API.request({
        url: `/api/product/${id}`,
        method: 'PATCH',
        data
      });
    }
  });
};

/**
 * Delete product
 */
export const useDeleteProduct = () => {
  return useMutation({
    mutationFn: (id) => {
      return API.request({
        url: `/api/product/${id}`,
        method: 'DELETE'
      });
    }
  });
};

/**
 * Toggle single product visibility - NEW FEATURE
 */
export const useToggleProductVisibility = () => {
  return useMutation({
    mutationFn: (productId) => {
      return API.request({
        url: `/api/product/${productId}/toggle-visibility`,
        method: 'PATCH'
      });
    }
  });
};

/**
 * Bulk toggle product visibility - NEW FEATURE
 */
export const useBulkToggleVisibility = () => {
  return useMutation({
    mutationFn: ({ productIds, isVisible }) => {
      return API.request({
        url: '/api/product/bulk-toggle-visibility',
        method: 'PATCH',
        data: {
          productIds,
          isVisible
        }
      });
    }
  });
};

/**
 * Get product visibility statistics - NEW FEATURE
 */
export const useQueryVisibilityStats = () => {
  return useQuery({
    queryKey: ['GET_VISIBILITY_STATS'],
    queryFn: () => {
      return API.request({
        url: '/api/product/visibility-stats'
      });
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};

/**
 * Search products with advanced filters including visibility
 */
export const useQueryProductsSearch = (filters = {}) => {
  const queryKey = ['SEARCH_PRODUCTS', filters];

  return useQuery({
    queryKey,
    queryFn: () => {
      return API.request({
        url: '/api/product/admin/all',
        params: {
          pageNumber: 0,
          pageSize: 100,
          ...filters
        }
      });
    },
    enabled: Object.keys(filters).length > 0
  });
};

/**
 * Sync products from external source (KiotViet)
 */
export const useSyncProducts = () => {
  return useMutation({
    mutationFn: (params = {}) => {
      return API.request({
        url: '/api/product/kiotviet/clean-and-sync',
        method: 'POST',
        data: params
      });
    }
  });
};

/**
 * Get sync status
 */
export const useQuerySyncStatus = () => {
  return useQuery({
    queryKey: ['GET_SYNC_STATUS'],
    queryFn: () => {
      return API.request({
        url: '/api/product/kiotviet/sync-status'
      });
    },
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchIntervalInBackground: false
  });
};

/**
 * Export products data
 */
export const useExportProducts = () => {
  return useMutation({
    mutationFn: (params = {}) => {
      return API.request({
        url: '/api/product/export',
        method: 'GET',
        params,
        responseType: 'blob'
      });
    }
  });
};

/**
 * Import products data
 */
export const useImportProducts = () => {
  return useMutation({
    mutationFn: (formData) => {
      return API.request({
        url: '/api/product/import',
        method: 'POST',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  });
};

/**
 * Get featured products (for dashboard preview)
 */
export const useQueryFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: ['GET_FEATURED_PRODUCTS', limit],
    queryFn: () => {
      return API.request({
        url: '/api/product/admin/all',
        params: {
          pageNumber: 0,
          pageSize: limit
          // Get both visible and hidden featured products for admin dashboard
        }
      });
    }
  });
};
