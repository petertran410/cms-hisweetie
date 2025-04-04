import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Input } from 'antd';
import { memo, useState } from 'react';

const FilterId = ({ placeholder = 'Nhập từ khóa...', label = 'Tìm kiếm' }) => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { id = '' } = paramsURL || {};
  const [text, setText] = useState(id);

  return (
    <div>
      <p className="font-semibold text-sm mb-1">{label}</p>
      <Input
        className="h-10"
        allowClear
        placeholder={placeholder}
        defaultValue={id ? `${id}` : undefined}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            removeParamsURL(['id']);
            return;
          }
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setParamsURL({ id: text });
          }
        }}
      />
    </div>
  );
};

export default memo(FilterId);
