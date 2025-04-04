import { uploadFileCdn } from '@/utils/helper';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

const FormEditor = ({
  options = {
    buttonList: [
      ['fontSize', 'formatBlock'],
      ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
      ['align', 'list', 'table'],
      ['fontColor', 'hiliteColor'],
      ['outdent', 'indent'],
      ['undo', 'redo'],
      ['removeFormat'],
      ['link'],
      ['image']
    ],
    showPathLabel: false
  },
  height = '400px',
  defaultValue = '',
  onChange,
  disabled
}) => {
  return (
    <SunEditor
      defaultValue={defaultValue}
      height={height}
      disable={disabled}
      setOptions={options}
      setDefaultStyle="font-size: 14px; font-family: 'Inter'"
      onChange={onChange}
      onImageUploadBefore={(files, _, uploadHandler) => {
        const file = files[0];
        uploadFileCdn({ file }).then((url) => {
          if (url) {
            const data = {
              result: [
                {
                  url,
                  name: file.name,
                  size: file.size
                }
              ]
            };

            return uploadHandler(data);
          }
        });
      }}
    />
  );
};

export default FormEditor;
