import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Select } from 'antd';
import { memo } from 'react';
import { ORDER_STATUS } from '../data';

const FilterStatus = () => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { status = '' } = paramsURL || {};

  return (
    <div>
      <p className="font-semibold text-sm mb-1">Trạng thái</p>
      <Select
        value={ORDER_STATUS.find((i) => i.value === status)}
        options={ORDER_STATUS}
        placeholder="Chọn..."
        style={{ width: '100%', height: 35 }}
        allowClear
        onChange={(e) => {
          if (e === '' || !e) {
            removeParamsURL(['status']);
            return;
          }
          setParamsURL({ status: e });
        }}
      />
    </div>
  );
};

export default memo(FilterStatus);
