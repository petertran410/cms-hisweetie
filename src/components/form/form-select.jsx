import { Form, Select } from 'antd';
import { memo } from 'react';

const FormSelect = (props) => {
  const {
    name,
    className,
    label,
    rules,
    initialValue,
    options,
    mode,
    labelInValue = true,
    placeholder,
    allowClear,
    ...rest
  } = props;

  return (
    <Form.Item
      name={name}
      label={label ? <p className="font-bold text-md">{label}</p> : undefined}
      rules={rules}
      labelCol={{ span: 24 }}
      className={className}
      initialValue={initialValue}
      {...rest}
    >
      <Select
        className="h-[38px]"
        options={options}
        style={{ width: '100%' }}
        mode={mode}
        labelInValue={labelInValue}
        placeholder={placeholder || 'Chọn...'}
        filterOption={false}
        allowClear={allowClear}
      />
    </Form.Item>
  );
};

export default memo(FormSelect);
