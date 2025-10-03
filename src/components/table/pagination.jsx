import { useParamsURL } from '@/utils/helper';
import { Pagination as AntdPagination } from 'antd';
import { memo } from 'react';

const Pagination = ({ defaultPage, totalItems }) => {
  const { paramsURL, setParamsURL } = useParamsURL();

  return (
    <AntdPagination
      defaultCurrent={defaultPage || 1}
      total={totalItems}
      showSizeChanger={false}
      onChange={(e) => setParamsURL({ ...paramsURL, page: `${e}` })}
    />
  );
};

export default memo(Pagination);
