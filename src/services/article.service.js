import { API } from '../utils/API';
import { useGetParamsURL } from '../utils/helper';
import { useQuery } from '@tanstack/react-query';

/**
 * Service lấy articles theo type cho các trang con
 */
export const useQueryArticlesByType = (articleType) => {
  const params = useGetParamsURL();
  const { page: pageNumber = 1, keyword } = params;
  const queryKey = ['GET_ARTICLES_BY_TYPE', articleType, pageNumber, keyword];

  return useQuery({
    queryKey,
    queryFn: () =>
      API.request({
        url: '/api/news/client/get-all',
        params: {
          pageNumber: pageNumber - 1,
          keyword,
          type: articleType,
          pageSize: 12 // 12 articles per page cho grid layout
        }
      }),
    enabled: !!articleType
  });
};
