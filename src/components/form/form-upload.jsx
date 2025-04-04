import { showToast } from '@/utils/helper';
import { DeleteOutlined, FileAddOutlined } from '@ant-design/icons';
import { Button, Form, Image, Upload } from 'antd';
import { memo, useCallback, useState } from 'react';

const FormUpload = (props) => {
  const {
    name,
    className,
    accept,
    label,
    rules,
    maxCount,
    multiple,
    defaultFileList = [],
    initialValue,
    disabled
  } = props;
  const [fileList, setFileList] = useState();

  const onChange = useCallback(async (data) => {
    const { file, fileList } = data;

    if (file.size && Math.round(file.size / 1024) > 5120) {
      showToast({ type: 'error', message: 'Kích cỡ file không được vượt quá 5 MB!' });
      return;
    }
    setFileList(multiple ? fileList : [fileList[fileList.length - 1]]);
  }, []);

  return (
    <Form.Item
      name={name}
      initialValue={initialValue}
      label={label ? <p className="font-bold text-md">{label}</p> : undefined}
      rules={rules}
    >
      <Upload
        disabled={disabled}
        name={name}
        accept={accept}
        multiple={multiple}
        fileList={fileList}
        defaultFileList={defaultFileList}
        maxCount={maxCount}
        className={className}
        showUploadList
        beforeUpload={() => false}
        onChange={onChange}
        itemRender={(_, file, ___, { remove }) => {
          if (file.url || (file.type && file.type.startsWith('image/'))) {
            return (
              <div className="mt-5 w-full flex gap-2 items-center">
                <div className="w-1/4 overflow-hidden">
                  <Image className="" src={file.url || URL.createObjectURL(file.originFileObj)} alt={file.name} />
                </div>
                <p className="w-1/2 text-center font-semibold text-ellipsis">{file.name}</p>
                {!disabled && (
                  <div className="w-1/4 flex justify-end items-center">
                    <DeleteOutlined onClick={remove} style={{ color: 'red' }} />
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div className="mt-1 flex gap-2 items-center">
                <div className="w-1/4 h-[50px] border border-solid overflow-hidden flex justify-center items-center ">
                  <FileAddOutlined />
                </div>
                <p className="w-1/2 text-center font-semibold text-ellipsis">{file.name}</p>
                <div className="w-1/4 flex justify-end items-center">
                  <DeleteOutlined onClick={remove} style={{ color: 'red' }} />
                </div>
              </div>
            );
          }
        }}
      >
        {!disabled && (
          <Button type="default">
            <span className="font-medium text-[#828282]">Tải lên</span>
          </Button>
        )}
      </Upload>
    </Form.Item>
  );
};

export default memo(FormUpload);
