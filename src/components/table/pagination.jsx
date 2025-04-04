import { useSetParamsURL } from '@/utils/helper';
import { Pagination as AntdPagination } from 'antd';
import { memo } from 'react';

const Pagination = ({ defaultPage, totalItems }) => {
  const setParamsURL = useSetParamsURL();

  return (
    <AntdPagination
      defaultCurrent={defaultPage || 1}
      total={totalItems}
      showSizeChanger={false}
      onChange={(e) => setParamsURL({ page: `${e}` })}
    />
  );
};

export default memo(Pagination);
