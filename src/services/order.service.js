import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useQueryOrderList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, fullName, type, email, phone, status, id } = paramsURL || {};

  const queryKey = ['GET_ORDER_LIST', page, fullName, type, email, phone, status, id];
  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/product/order/admin-search',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          type,
          receiverFullName: fullName,
          email,
          phoneNumber: phone,
          status,
          id
        }
      })
  });
};

export const useChangeOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      const { id, status } = params;
      return API.request({
        url: `/api/product/order/${id}:${status}`,
        method: 'PATCH'
      })
        .then(() => {
          showToast({ type: 'success', message: 'Thay đổi trạng thái thành công' });
          queryClient.resetQueries({ queryKey: ['GET_ORDER_LIST'] });
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
        });
    }
  });
};
