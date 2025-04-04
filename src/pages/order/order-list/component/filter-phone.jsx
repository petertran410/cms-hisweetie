import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Input } from 'antd';
import { memo, useState } from 'react';

const FilterPhone = ({ placeholder = 'Nhập từ khóa...', label = 'Tìm kiếm' }) => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { phone = '' } = paramsURL || {};
  const [text, setText] = useState(phone);

  return (
    <div>
      <p className="font-semibold text-sm mb-1">{label}</p>
      <Input
        className="h-10"
        allowClear
        placeholder={placeholder}
        defaultValue={phone ? `${phone}` : undefined}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            removeParamsURL(['phone']);
            return;
          }
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setParamsURL({ phone: text });
          }
        }}
      />
    </div>
  );
};

export default memo(FilterPhone);
