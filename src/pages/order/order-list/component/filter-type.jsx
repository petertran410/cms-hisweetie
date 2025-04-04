import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Select } from 'antd';
import { memo } from 'react';
import { ORDER_TYPE } from '../data';

const FilterType = () => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { type = '' } = paramsURL || {};

  return (
    <div>
      <p className="font-semibold text-sm mb-1">Loại đơn</p>
      <Select
        value={ORDER_TYPE.find((i) => i.value === type)}
        options={ORDER_TYPE}
        placeholder="Chọn..."
        style={{ width: '100%', height: 35 }}
        allowClear
        onChange={(e) => {
          if (e === '' || !e) {
            removeParamsURL(['type']);
            return;
          }
          setParamsURL({ type: e });
        }}
      />
    </div>
  );
};

export default memo(FilterType);
