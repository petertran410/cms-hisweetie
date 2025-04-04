import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Input } from 'antd';
import { memo, useState } from 'react';

const FilterEmail = ({ placeholder = 'Nhập từ khóa...', label = 'Tìm kiếm' }) => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { email = '' } = paramsURL || {};
  const [text, setText] = useState(email);

  return (
    <div>
      <p className="font-semibold text-sm mb-1">{label}</p>
      <Input
        className="h-10"
        allowClear
        placeholder={placeholder}
        defaultValue={email ? `${email}` : undefined}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            removeParamsURL(['email']);
            return;
          }
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setParamsURL({ email: text });
          }
        }}
      />
    </div>
  );
};

export default memo(FilterEmail);
