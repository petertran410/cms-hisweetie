import { tokenState, userInfoAtom } from '@/states/common';
import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil';

export const useMutateLogin = () => {
  const navigate = useNavigate();
  const setToken = useSetRecoilState(tokenState);

  return useMutation({
    mutationFn: async (params) => {
      // Return the result from API.request
      const response = await API.request({
        url: '/api/auth/login',
        method: 'POST',
        params: params
      });

      return response; // Return the response so we can use it in onSuccess
    },
    onSuccess: (response) => {
      const token = response.token;
      setToken(token);
      navigate('/');
    },
    onError: () => {
      showToast({
        type: 'error',
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }
  });
};

export const useQueryUserInfo = () => {
  const queryKey = ['GET_USER_INFO'];
  const queryClient = useQueryClient();
  const dataClient = queryClient.getQueryData(queryKey);
  const setUserInfo = useSetRecoilState(userInfoAtom);
  const [token, setToken] = useRecoilState(tokenState);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await API.request({
        url: '/api/user'
      });

      // const userRoles = res?.authorities?.map((i) => i.role) || [];

      // if (!userRoles?.includes('ROLE_SUPER_ADMIN') && !userRoles?.includes('ROLE_ADMIN')) {
      //   throw new Error('Bạn không có quyền đăng nhập hệ thống');
      // }

      setUserInfo(res);
      return res;
    },
    onError: (err) => {
      showToast({
        type: 'error',
        message: err.message
      });
      setToken(undefined);
    },
    enabled: isEmpty(dataClient) && !!token,
    retry: false
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};
