import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { tokenState, userInfoAtom } from '@/states/common';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import Cookies from 'js-cookie';
import { CK_JWT_TOKEN } from '@/states/common';

export const useMutateLogin = () => {
  const navigate = useNavigate();
  const setToken = useSetRecoilState(tokenState);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params) => {
      if (!params.username || !params.password) {
        throw new Error('Username and password are required');
      }

      console.log('Login params:', params);

      const response = await API.request({
        url: '/api/auth/login',
        method: 'POST',
        params: {
          phone: params.username, // Your backend expects 'phone', not 'username'
          password: params.password
        }
      });

      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }

      console.log('Login response:', response);
      return response;
    },
    onSuccess: async (response) => {
      const token = response.token;
      console.log('Setting token:', token);

      // Set token in both Recoil state and cookie directly
      setToken(token);
      Cookies.set(CK_JWT_TOKEN, token, { expires: 60, secure: true });

      // Wait a bit for cookie to be set
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Invalidate and refetch user info
      queryClient.invalidateQueries({ queryKey: ['GET_USER_INFO'] });

      // Navigate after a short delay to ensure everything is set
      setTimeout(() => {
        navigate('/');
      }, 200);
    },
    onError: (error) => {
      console.error('Login error:', error);

      // More specific error messages
      if (error.response?.status === 401) {
        showToast({
          type: 'error',
          message: 'Tài khoản hoặc mật khẩu không chính xác'
        });
      } else if (error.response?.status === 500) {
        showToast({
          type: 'error',
          message: 'Lỗi hệ thống. Vui lòng thử lại sau'
        });
      } else {
        showToast({
          type: 'error',
          message: error.message || 'Đăng nhập thất bại'
        });
      }
    }
  });
};

export const useQueryUserInfo = () => {
  const setUserInfo = useSetRecoilState(userInfoAtom);

  return useQuery({
    queryKey: ['GET_USER_INFO'],
    queryFn: async () => {
      // Double check token exists before making request
      const token = Cookies.get(CK_JWT_TOKEN);
      console.log('🔍 UserInfo Query - Token check:', !!token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await API.request({
        url: '/api/user',
        method: 'GET'
      });

      // Set user info in Recoil state
      setUserInfo(response);

      return response;
    },
    retry: (failureCount, error) => {
      // Don't retry if it's a 401 (unauthorized) error
      if (error?.response?.status === 401) {
        return false;
      }
      // Retry other errors up to 2 times
      return failureCount < 2;
    },
    enabled: !!Cookies.get(CK_JWT_TOKEN), // Only run when token exists
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
