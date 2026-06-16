import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const useQueryRedirectList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_REDIRECT_LIST', page, keyword];

  return useQuery({
    queryKey,
    queryFn: () => {
      return API.request({
        url: '/api/redirect/paginated',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          keyword
        }
      });
    }
  });
};

export const useQueryRedirectDetail = (id) => {
  const queryKey = ['GET_REDIRECT_DETAIL', id];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: `/api/redirect/${id}`
      });

      return response?.data || null;
    },
    enabled: !!id
  });
};

export const useCreateRedirect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/redirect',
        method: 'POST',
        params
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_REDIRECT_LIST']);

      showToast({ type: 'success', message: 'Tạo redirect thành công' });
      navigate('/redirects');
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Tạo redirect thất bại. ${error.message}`
      });
    }
  });
};

export const useUpdateRedirect = (id) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/redirect/${id}`,
        method: 'PATCH',
        params
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_REDIRECT_LIST']);

      showToast({ type: 'success', message: 'Cập nhật redirect thành công' });
      navigate('/redirects');
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Cập nhật thất bại. ${error.message}`
      });
    }
  });
};

export const useDeleteRedirect = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => {
      return API.request({
        url: `/api/redirect/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_REDIRECT_LIST']);

      showToast({ type: 'success', message: 'Xóa redirect thành công' });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Xóa redirect thất bại. ${error.message}`
      });
    }
  });
};
