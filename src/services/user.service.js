import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

export const useQueryUserList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_USER_LIST', page, keyword];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/admin/users',
        params: { pageSize: 10, pageNumber: Number(page) - 1, keyword }
      })
  });
};

export const useCreateUser = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/user',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Tạo user thành công' });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useUpdateUser = (id) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/user/${id}`,
        method: 'PATCH',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Tạo user thành công' });
          queryClient.resetQueries({ queryKey: ['GET_USER_LIST'] });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      const { id } = params;
      return API.request({
        url: `/api/user/${id}`,
        method: 'DELETE'
      })
        .then(() => {
          showToast({ type: 'success', message: 'Xoá user thành công' });
          queryClient.resetQueries({ queryKey: ['GET_USER_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useChangeUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/admin/authority',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Đổi role thành công' });
          queryClient.resetQueries({ queryKey: ['GET_USER_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/admin/ban',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Ban người dùng thành công' });
          queryClient.resetQueries({ queryKey: ['GET_USER_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useQueryUserDetail = (id) => {
  const queryKey = ['GET_USER_DETAIL', id];
  const queryClient = useQueryClient();
  const dataClient = queryClient.getQueryData(queryKey);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: `/api/user/${id}`
      }).then((res) => res.data),
    enabled: !!id
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};
