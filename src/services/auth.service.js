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
