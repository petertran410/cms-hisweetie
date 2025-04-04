import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

export const useQueryRecipeList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_RECIPE_LIST', page, keyword];
  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/search',
        params: { pageSize: 10, pageNumber: Number(page) - 1, title: keyword, type: 'CONG_THUC' }
      })
  });
};

export const useCreateRecipe = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/product',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Tạo công thức thành công' });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useUpdateRecipe = (id) => {
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
          showToast({ type: 'success', message: 'Cập nhật công thức thành công' });
          queryClient.resetQueries({ queryKey: ['GET_RECIPE_LIST'] });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useDeleteRecipe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => {
      const { id } = params;
      return API.request({
        url: `/api/product/${id}`,
        method: 'DELETE'
      })
        .then(() => {
          showToast({ type: 'success', message: 'Xoá công thức thành công' });
          queryClient.resetQueries({ queryKey: ['GET_RECIPE_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useQueryRecipeDetail = (id) => {
  const queryKey = ['GET_RECIPE_DETAIL', id];
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
