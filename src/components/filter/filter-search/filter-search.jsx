import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { Input } from 'antd';
import { memo, useEffect, useState } from 'react';

const FilterSearch = ({ placeholder = 'Nhập từ khóa...', label = 'Tìm kiếm' }) => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { keyword = '' } = paramsURL || {};
  const [text, setText] = useState(keyword);

  useEffect(() => {
    setText(keyword);
  }, [keyword]);

  return (
    <div>
      <p className="font-semibold text-sm mb-1">{label}</p>
      <Input
        className="h-10"
        allowClear
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          const value = e.target.value;
          if (!value) {
            setText('');
            removeParamsURL(['keyword']);
            return;
          }
          setText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setParamsURL({ ...paramsURL, keyword: text, page: '1' });
          }
        }}
      />
    </div>
  );
};

export default memo(FilterSearch);
