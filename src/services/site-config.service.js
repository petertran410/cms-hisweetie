import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Danh sách danh mục cha để chọn (chỉ name + slug).
export const useQueryParentCategories = () => {
  return useQuery({
    queryKey: ['GET_PARENT_CATEGORIES'],
    queryFn: async () => {
      const response = await API.request({
        url: '/api/site-config/parent-categories'
      });
      return response?.data || [];
    }
  });
};

// Cấu hình menu hiện tại (slug đang chọn).
export const useQueryMenuCategoryConfig = () => {
  return useQuery({
    queryKey: ['GET_MENU_CATEGORY_CONFIG'],
    queryFn: async () => {
      const response = await API.request({
        url: '/api/site-config/menu-category'
      });
      return response?.data || { slug: null };
    }
  });
};

// Lưu slug danh mục cha cho menu.
export const useUpdateMenuCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/site-config/menu-category',
        method: 'PUT',
        params
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['GET_MENU_CATEGORY_CONFIG']);
      showToast({ type: 'success', message: 'Cập nhật danh mục menu thành công' });
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Cập nhật thất bại. ${error.message}`
      });
    }
  });
};
