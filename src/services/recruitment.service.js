import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

export const useQueryRecruitmentList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword, status } = paramsURL || {};

  const queryKey = ['GET_RECRUITMENT_LIST', page, keyword, status];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/job/client/search',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          title: keyword,
          applicationDeadline: status === 'NOT_EXPIRED' ? dayjs().format('YYYY-MM-DD') : undefined
        }
      })
  });
};

export const useQueryApplyList = (jobTitle) => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword, status } = paramsURL || {};

  const queryKey = ['GET_APPLY_LIST', page, keyword, status];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/job/admin/apply/search',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          title: jobTitle
        }
      }),
    enabled: !!jobTitle
  });
};

export const useCreateRecruitment = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/job/admin',
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Tạo việc làm thành công' });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useChangeApplyStatus = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/job/admin/change-status/${id}`,
        method: 'POST',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Thay đổi trạng thái thành công' });
          queryClient.resetQueries({ queryKey: ['GET_APPLY_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
          throw new Error(e.message);
        });
    }
  });
};

export const useUpdateRecruitment = (id) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/job/admin/${id}`,
        method: 'PUT',
        params
      })
        .then(() => {
          showToast({ type: 'success', message: 'Cập nhật việc làm thành công' });
          navigate(-1);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useDeleteRecruitment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      const { id } = params;
      return API.request({
        url: `/api/recruitment/${id}`,
        method: 'DELETE'
      })
        .then(() => {
          showToast({ type: 'success', message: 'Xoá việc làm thành công' });
          queryClient.resetQueries({ queryKey: ['GET_RECRUITMENT_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};

export const useQueryRecruitmentDetail = (id) => {
  const queryKey = ['GET_RECRUITMENT_DETAIL', id];
  const queryClient = useQueryClient();
  const dataClient = queryClient.getQueryData(queryKey);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => API.request({ url: `/api/job/client/${id}` }),
    enabled: !!id
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};
