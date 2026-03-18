import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export const useQueryTestimonialList = () => {
  const params = useGetParamsURL();
  const { page = 1 } = params;

  return useQuery({
    queryKey: ['GET_TESTIMONIAL_LIST', page],
    queryFn: () =>
      API.request({
        url: '/api/review/testimonials',
        params: { pageSize: 10, pageNumber: Number(page) - 1 }
      })
  });
};

export const useQueryTestimonialDetail = (id) => {
  return useQuery({
    queryKey: ['GET_TESTIMONIAL_DETAIL', id],
    queryFn: () => API.request({ url: `/api/review/testimonials/${id}` }),
    enabled: !!id
  });
};

export const useCreateTestimonial = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => API.request({ url: '/api/review/testimonials', method: 'POST', params }),
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_TESTIMONIAL_LIST']);
      showToast({ type: 'success', message: 'Tạo đánh giá thành công' });
      navigate('/testimonials');
    },
    onError: (e) => showToast({ type: 'error', message: e?.message || 'Tạo thất bại' })
  });
};

export const useUpdateTestimonial = (id) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => API.request({ url: `/api/review/testimonials/${id}`, method: 'PATCH', params }),
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_TESTIMONIAL_LIST']);
      showToast({ type: 'success', message: 'Cập nhật thành công' });
      navigate('/testimonials');
    },
    onError: (e) => showToast({ type: 'error', message: e?.message || 'Cập nhật thất bại' })
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => API.request({ url: `/api/review/testimonials/${id}`, method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_TESTIMONIAL_LIST']);
      showToast({ type: 'success', message: 'Xóa thành công' });
    },
    onError: (e) => showToast({ type: 'error', message: e?.message || 'Xóa thất bại' })
  });
};
