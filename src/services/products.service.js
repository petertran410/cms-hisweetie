import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

export const useQueryProductsList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword, categoryNames, categoryIds, productTypes } = paramsURL || {};

  const queryKey = ['GET_PRODUCTS_LIST', page, keyword, categoryNames, categoryIds, productTypes];
  return useQuery({
    queryKey,
    queryFn: () => {
      const params = {
        pageSize: 50, // Increased from 10 to 50 to show more products
        pageNumber: Number(page) - 1,
        title: keyword
      };

      // Add category filtering if present
      if (categoryNames) {
        params.categoryNames = categoryNames;
      }
      if (categoryIds) {
        params.categoryIds = categoryIds;
      }

      // Add product types filtering if present (supports multiple types)
      if (productTypes) {
        params.productTypes = productTypes;
      }

      console.log('Products search params:', params); // Debug log

      return API.request({
        url: '/api/product/search',
        params
      });
    }
  });
};

// New hook to get all products in target categories (no pagination)
export const useQueryAllTargetProducts = () => {
  const queryKey = ['GET_ALL_TARGET_PRODUCTS'];
  return useQuery({
    queryKey,
    queryFn: () => {
      const params = {
        pageSize: 1000, // Large number to get all products
        pageNumber: 0,
        categoryNames: 'Trà Phượng Hoàng,Lermao'
      };

      console.log('Getting all target products with params:', params);

      return API.request({
        url: '/api/product/search',
        params
      });
    }
  });
};

// New hook to get categories debug info
export const useQueryCategoriesDebug = () => {
  const queryKey = ['GET_CATEGORIES_DEBUG'];
  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/debug/categories-analysis'
      }),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
};

// New hook to test search functionality
export const useQuerySearchDebug = (categoryNames, pageSize = 50) => {
  const queryKey = ['GET_SEARCH_DEBUG', categoryNames, pageSize];
  return useQuery({
    queryKey,
    queryFn: () => {
      const params = {
        pageSize: pageSize.toString(),
        includeTypes: 'true'
      };

      if (categoryNames) {
        params.categoryNames = categoryNames;
      }

      console.log('Debug search params:', params);

      return API.request({
        url: '/api/product/debug/search-test',
        params
      });
    },
    enabled: !!categoryNames,
    staleTime: 2 * 60 * 1000 // Cache for 2 minutes
  });
};

// New hook to get all categories for filtering
export const useQueryCategoriesList = () => {
  const queryKey = ['GET_CATEGORIES_LIST'];
  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/categories'
      })
  });
};

// New hook to get product types for specific categories
export const useQueryProductTypesByCategories = (categoryNames) => {
  const queryKey = ['GET_PRODUCT_TYPES_BY_CATEGORIES', categoryNames];
  return useQuery({
    queryKey,
    queryFn: () => {
      if (!categoryNames || categoryNames.length === 0) {
        return { types: [], totalTypes: 0 };
      }
      return API.request({
        url: '/api/product/types-by-categories',
        params: { categoryNames: categoryNames.join(',') }
      });
    },
    enabled: !!categoryNames && categoryNames.length > 0
  });
};

export const useCreateProducts = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/product',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Tạo sản phẩm thành công' });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
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
      })
        .then(() => {
          showToast({ type: 'success', message: 'Cập nhật sản phẩm thành công' });
          queryClient.resetQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
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
      })
        .then(() => {
          showToast({ type: 'success', message: 'Xoá sản phẩm thành công' });
          queryClient.resetQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

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
    enabled: !!id
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};
