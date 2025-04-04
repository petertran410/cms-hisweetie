import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Input } from 'antd';
import { memo, useState } from 'react';

const FilterCustomer = ({ placeholder = 'Nhập từ khóa...', label = 'Tìm kiếm' }) => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { fullName = '' } = paramsURL || {};
  const [text, setText] = useState(fullName);

  return (
    <div>
      <p className="font-semibold text-sm mb-1">{label}</p>
      <Input
        className="h-10"
        allowClear
        placeholder={placeholder}
        defaultValue={fullName ? `${fullName}` : undefined}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            removeParamsURL(['fullName']);
            return;
          }
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setParamsURL({ fullName: text });
          }
        }}
      />
    </div>
  );
};

export default memo(FilterCustomer);
