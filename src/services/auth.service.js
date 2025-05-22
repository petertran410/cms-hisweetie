import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { tokenState, userInfoAtom } from '@/states/common';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

export const useMutateLogin = () => {
  const navigate = useNavigate();
  const setToken = useSetRecoilState(tokenState);

  return useMutation({
    mutationFn: async (params) => {
      console.log('Login params:', params); // Debug log

      const response = await API.request({
        url: '/api/auth/login',
        method: 'POST',
        params: {
          phone: params.username, // Your backend expects 'phone', not 'username'
          password: params.password
        }
      });

      console.log('Login response:', response); // Debug log
      return response;
    },
    onSuccess: (response) => {
      const token = response.token;
      console.log('Setting token:', token); // Debug log
      setToken(token);
      navigate('/');
    },
    onError: (error) => {
      console.error('Login error:', error); // Debug log
      showToast({
        type: 'error',
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }
  });
};

export const useQueryUserInfo = () => {
  const setUserInfo = useSetRecoilState(userInfoAtom);

  return useQuery({
    queryKey: ['GET_USER_INFO'],
    queryFn: async () => {
      const response = await API.request({
        url: '/api/user',
        method: 'GET'
      });

      // Set user info in Recoil state
      setUserInfo(response);

      return response;
    },
    retry: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
