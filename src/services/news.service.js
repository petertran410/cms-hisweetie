import { API } from '@/utils/API';
import { showToast, useGetParamsURL } from '@/utils/helper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isEmpty } from 'lodash';
import { useNavigate } from 'react-router-dom';

export const useQueryNewsList = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword, type } = paramsURL || {};

  const queryKey = ['GET_NEWS_LIST', page, keyword, type];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/news/get-all',
        params: {
          pageSize: 100,
          pageNumber: 0,
          title: keyword,
          type: type || undefined
        }
      });

      if (!type && response?.content) {
        const filteredContent = response.content.filter((item) => {
          const itemType = item.type?.toUpperCase();
          return itemType !== 'CULTURE' && itemType !== 'VIDEO' && itemType !== 'VĂN HÓA';
        });

        const pageSize = 10;
        const currentPage = Number(page) - 1;
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedContent = filteredContent.slice(startIndex, endIndex);

        return {
          content: paginatedContent,
          totalElements: filteredContent.length,
          totalPages: Math.ceil(filteredContent.length / pageSize),
          number: currentPage,
          size: pageSize,
          pageable: {
            pageNumber: currentPage,
            pageSize: pageSize
          }
        };
      }

      return response;
    }
  });
};

export const useQueryNewsListExcludeVideoAndCulture = () => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_NEWS_LIST_EXCLUDE_VIDEO_CULTURE', page, keyword];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/news/get-all',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          title: keyword
        }
      });

      // Lọc ra VIDEO và CULTURE
      if (response?.content) {
        const filteredContent = response.content.filter((item) => item.type !== 'VIDEO' && item.type !== 'CULTURE');

        return {
          ...response,
          content: filteredContent,
          totalElements: filteredContent.length
        };
      }

      return response;
    }
  });
};

export const useQueryNewsListByType = (newsType) => {
  const paramsURL = useGetParamsURL();
  const { page = 1, keyword } = paramsURL || {};

  const queryKey = ['GET_NEWS_LIST_BY_TYPE', newsType, page, keyword];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/news/get-all',
        params: {
          pageSize: 10,
          pageNumber: Number(page) - 1,
          title: keyword,
          type: newsType
        }
      }),
    enabled: !!newsType
  });
};

export const useCreateNews = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: '/api/news',
        method: 'POST',
        params
      });
    },
    onSuccess: () => {
      showToast({ type: 'success', message: 'Tạo tin tức thành công' });
      queryClient.invalidateQueries({ queryKey: ['GET_NEWS_LIST'] });
      queryClient.invalidateQueries({ queryKey: ['GET_NEWS_LIST_EXCLUDE_VIDEO_CULTURE'] });
      navigate('/news');
    },
    onError: (e) => {
      showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
    }
  });
};

export const useUpdateNews = (id) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      return API.request({
        url: `/api/news/${id}`,
        method: 'PATCH',
        params
      });
    },
    onSuccess: () => {
      showToast({ type: 'success', message: 'Cập nhật tin tức thành công' });
      queryClient.invalidateQueries({ queryKey: ['GET_NEWS_LIST'] });
      queryClient.invalidateQueries({ queryKey: ['GET_NEWS_LIST_EXCLUDE_VIDEO_CULTURE'] });
      queryClient.invalidateQueries({ queryKey: ['GET_NEWS_DETAIL', id] });
      navigate('/news');
    },
    onError: (e) => {
      showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
    }
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => {
      const { id } = params;
      return API.request({
        url: `/api/news/${id}`,
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      showToast({ type: 'success', message: 'Xoá tin tức thành công' });
      queryClient.invalidateQueries({ queryKey: ['GET_NEWS_LIST'] });
      queryClient.invalidateQueries({ queryKey: ['GET_NEWS_LIST_EXCLUDE_VIDEO_CULTURE'] });
    },
    onError: (e) => {
      showToast({ type: 'error', message: `Thao tác thất bại. ${e.message}` });
    }
  });
};

export const useQueryNewsDetail = (id) => {
  const queryKey = ['GET_NEWS_DETAIL', id];
  const queryClient = useQueryClient();
  const dataClient = queryClient.getQueryData(queryKey);

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => API.request({ url: `/api/news/${id}` }),
    enabled: !!id
  });

  if (!isEmpty(dataClient)) {
    return { data: dataClient, isLoading: false, error: null };
  }
  return { data, isLoading, error };
};

// THÊM MỚI: Hook để lấy thống kê các loại bài viết
export const useQueryNewsStats = () => {
  const queryKey = ['GET_NEWS_STATS'];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const response = await API.request({
        url: '/api/news/get-all',
        params: { pageSize: 1000 }
      });

      const { content = [] } = response || {};

      // Đếm theo type
      const stats = content.reduce((acc, item) => {
        const type = item.type || 'UNKNOWN';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      return {
        total: content.length,
        byType: stats
      };
    },
    staleTime: 5 * 60 * 1000
  });
};
