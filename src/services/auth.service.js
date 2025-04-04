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
    mutationFn: (params) => {
      return API.request({
        url: '/api/auth/login',
        method: 'POST',
        params: params
      })
        .then((res) => {
          const token = res.token;
          setToken(token);
          navigate('/');
        })
        .catch(() => {
          showToast({ type: 'error', message: 'Tài khoản hoặc mật khẩu không chính xác' });
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
    queryFn: () =>
      API.request({
        url: '/api/user'
      }).then((res) => {
        const userRoles = res?.authorities?.map((i) => i.role) || [];

        if (!userRoles?.includes('ROLE_SUPER_ADMIN') && !userRoles?.includes('ROLE_ADMIN')) {
          showToast({
            type: 'error',
            message: 'Bạn không có quyền đăng nhập hệ thống'
          });
          setToken(undefined);
          return;
        }

        setUserInfo(res);
        return res;
      }),
    enabled: isEmpty(dataClient) && !!token
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};
