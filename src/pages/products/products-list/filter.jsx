import { FilterSearch } from '@/components/filter';
import { Button, Space } from 'antd';
import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { memo } from 'react';
import { FaList, FaEye, FaEyeSlash } from 'react-icons/fa';

const TableFilter = () => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { is_visible } = paramsURL || {};

  const handleVisibilityFilter = (value) => {
    if (value === 'all') {
      removeParamsURL(['is_visible', 'page']);
      // setParamsURL({ ...paramsURL, page: '1' });
    } else {
      setParamsURL({ ...paramsURL, is_visible: value, page: '1' });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-x-10 mb-10 gap-y-5">
      <FilterSearch placeholder="Tìm kiếm theo tên sản phẩm" />

      <div>
        <p className="font-semibold text-sm mb-1">Trạng thái hiển thị</p>
        <Space.Compact className="w-full">
          <Button
            type={!is_visible ? 'primary' : 'default'}
            icon={<FaList />}
            onClick={() => handleVisibilityFilter('all')}
            className="flex-1"
          >
            Tất cả
          </Button>
          <Button
            type={is_visible === 'true' ? 'primary' : 'default'}
            icon={<FaEye />}
            onClick={() => handleVisibilityFilter('true')}
            className="flex-1"
          >
            Hiển thị
          </Button>
          <Button
            type={is_visible === 'false' ? 'primary' : 'default'}
            icon={<FaEyeSlash />}
            onClick={() => handleVisibilityFilter('false')}
            className="flex-1"
          >
            Ẩn
          </Button>
        </Space.Compact>
      </div>
    </div>
  );
};

export default memo(TableFilter);
