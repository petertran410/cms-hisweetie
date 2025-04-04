import { FilterSearch } from '@/components/filter';
import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Select } from 'antd';
import { memo } from 'react';

const EXPIRED_TYPES = [
  {
    label: 'Tất cả việc làm',
    value: ''
  },
  {
    label: 'Còn hạn ứng tuyển',
    value: 'NOT_EXPIRED'
  }
];

const TableFilter = () => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { status } = paramsURL;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-x-10 mb-10 gap-y-5">
      <FilterSearch />

      <div className="w-full">
        <p className="font-semibold text-sm mb-1">Trạng thái</p>
        <Select
          value={EXPIRED_TYPES.find((i) => i.value === status) || EXPIRED_TYPES[0]}
          options={EXPIRED_TYPES}
          style={{ width: '100%', height: 35 }}
          onChange={(e) => {
            if (e === '' || !e) {
              removeParamsURL(['status']);
              return;
            }
            setParamsURL({ status: e });
          }}
        />
      </div>
    </div>
  );
};

export default memo(TableFilter);
