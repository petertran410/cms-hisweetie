import { FilterSearch } from '@/components/filter';
import { Select, Space } from 'antd';
import { useGetParamsURL, useSetParamsURL } from '@/utils/helper';
import { memo } from 'react';

const TableFilter = () => {
  const paramsURL = useGetParamsURL();
  const { pageSize = '50' } = paramsURL || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-x-10 mb-10 gap-y-5">
      <FilterSearch placeholder="Tìm kiếm theo tên sản phẩm" />

      <Space>
        <span>Hiển thị:</span>
        <Select
          value={pageSize}
          style={{ width: 100 }}
          onChange={(value) => useSetParamsURL({ pageSize: value, page: 1 })}
          options={[
            { label: '10', value: '10' },
            { label: '25', value: '25' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
            { label: 'Tất cả', value: '1000' }
          ]}
        />
        <span>sản phẩm</span>
      </Space>
    </div>
  );
};

export default memo(TableFilter);
