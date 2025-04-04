import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

export const useQueryVideoList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_VIDEO_LIST', page, keyword];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/news/get-all',
        params: { pageSize: 10, pageNumber: Number(page) - 1, keyword, type: 'VIDEO' }
      })
  });
};

export const useCreateVideo = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/news',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Tạo video thành công' });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useUpdateVideo = (id) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/news/${id}`,
        method: 'PATCH',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Cập nhật video thành công' });
          queryClient.resetQueries({ queryKey: ['GET_VIDEO_LIST'] });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      const { id } = params;
      return API.request({
        url: `/api/news/${id}`,
        method: 'DELETE'
      })
        .then(() => {
          showToast({ type: 'success', message: 'Xoá video thành công' });
          queryClient.resetQueries({ queryKey: ['GET_VIDEO_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useQueryVideoDetail = (id) => {
  const queryKey = ['GET_VIDEO_DETAIL', id];
  const queryClient = useQueryClient();
  const dataClient = queryClient.getQueryData(queryKey);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: `/api/news/${id}`
      }).then((res) => res),
    enabled: !!id
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};
