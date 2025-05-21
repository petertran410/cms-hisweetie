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

  const onChange = useCallback(
    async (info) => {
      // Ensure we have valid data to work with
      if (!info) return;

      const { file, fileList } = info;

      // Check file size if file exists
      if (file && file.size && Math.round(file.size / 1024) > 5120) {
        showToast({ type: 'error', message: 'Kích cỡ file không được vượt quá 5 MB!' });
        return;
      }

      // Ensure each file in fileList has a uid
      const processedFileList = fileList.map((file) => {
        // If file doesn't have a uid (which might cause the error), assign one
        if (!file.uid) {
          return { ...file, uid: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
        }
        return file;
      });

      // Set the processed file list
      setFileList(
        multiple
          ? processedFileList
          : processedFileList.length > 0
          ? [processedFileList[processedFileList.length - 1]]
          : []
      );
    },
    [multiple]
  );

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
        onRemove={(file) => {
          // If removing a file, make sure to properly update fileList state
          if (fileList) {
            const newFileList = fileList.filter((item) => item.uid !== file.uid);
            setFileList(newFileList);
          }
          return true; // Allow removal
        }}
        itemRender={(_, file, ___, { remove }) => {
          // Safe-guard against undefined file
          if (!file || !file.uid) {
            console.warn('File without uid encountered:', file);
            return null;
          }

          if (file.url || (file.type && file.type.startsWith('image/'))) {
            return (
              <div className="mt-5 w-full flex gap-2 items-center">
                <div className="w-1/4 overflow-hidden">
                  <Image
                    className=""
                    src={file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : '')}
                    alt={file.name || 'image'}
                  />
                </div>
                {!disabled && (
                  <div className="w-1/4 flex justify-end items-center">
                    <DeleteOutlined
                      onClick={() => {
                        if (typeof remove === 'function') {
                          remove(file);
                        }
                      }}
                      style={{ color: 'red' }}
                    />
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
                <p className="w-1/2 text-center font-semibold text-ellipsis">{file.name || `File-${file.uid}`}</p>
                <div className="w-1/4 flex justify-end items-center">
                  <DeleteOutlined
                    onClick={() => {
                      if (typeof remove === 'function') {
                        remove(file);
                      }
                    }}
                    style={{ color: 'red' }}
                  />
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
