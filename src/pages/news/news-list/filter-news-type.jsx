import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Select } from 'antd';
import { memo } from 'react';
import { NEWS_TYPE_OPTIONS } from '../../../utils/news-types.constants';

const FilterNewsType = () => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { type = '' } = paramsURL || {};

  return (
    <div>
      <p className="font-semibold text-sm mb-1">Loại bài viết</p>
      <Select
        value={NEWS_TYPE_OPTIONS.find((i) => i.value === type)}
        options={NEWS_TYPE_OPTIONS}
        placeholder="Chọn loại bài viết..."
        style={{ width: '100%', height: 35 }}
        allowClear
        onChange={(selectedValue) => {
          if (selectedValue === '' || !selectedValue) {
            removeParamsURL(['type', 'page']);
            return;
          }
          setParamsURL({ type: selectedValue, page: '1' });
        }}
      />
    </div>
  );
};

export default memo(FilterNewsType);
