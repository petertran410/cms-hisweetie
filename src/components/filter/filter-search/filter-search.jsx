import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Input } from 'antd';
import { memo, useState } from 'react';

const FilterSearch = ({ placeholder = 'Nhập từ khóa...', label = 'Tìm kiếm' }) => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { keyword = '' } = paramsURL || {};
  const [text, setText] = useState(keyword);

  return (
    <div>
      <p className="font-semibold text-sm mb-1">{label}</p>
      <Input
        className="h-10"
        allowClear
        placeholder={placeholder}
        defaultValue={keyword ? `${keyword}` : undefined}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            removeParamsURL(['keyword']);
            return;
          }
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setParamsURL({ keyword: text });
          }
        }}
      />
    </div>
  );
};

export default memo(FilterSearch);
