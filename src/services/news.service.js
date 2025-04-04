import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

export const useQueryNewsList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_NEWS_LIST', page, keyword];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/news/get-all',
        params: { pageSize: 10, pageNumber: Number(page) - 1, title: keyword, type: 'NEWS' }
      })
  });
};

export const useCreateNews = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/news',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Tạo tin tức thành công' });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useUpdateNews = (id) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/news/${id}`,
        method: 'PATCH',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Cập nhật tin tức thành công' });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      const { id } = params;
      return API.request({
        url: `/api/news/${id}`,
        method: 'DELETE'
      })
        .then(() => {
          showToast({ type: 'success', message: 'Xoá tin tức thành công' });
          queryClient.resetQueries({ queryKey: ['GET_NEWS_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useQueryNewsDetail = (id) => {
  const queryKey = ['GET_NEWS_DETAIL', id];
  const queryClient = useQueryClient();
  const dataClient = queryClient.getQueryData(queryKey);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => API.request({ url: `/api/news/${id}` }),
    enabled: !!id
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};
