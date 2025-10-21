import { uploadFileCdn } from '@/utils/helper';
import { Checkbox, Tooltip } from 'antd';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageUploader from 'quill-image-uploader';

Quill.register('modules/imageUploader', ImageUploader);

const QuillEditor = (props) => {
  const { defaultValue, disabled, onChange, showCreateTableOfContents, getCreateTableOfContents } = props;
  const [content, setContent] = useState(defaultValue || '');
  const [createTableOfContents, setCreateTableOfContents] = useState(false);
  const quillRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (defaultValue !== undefined) {
      setContent(defaultValue || '');
      setCreateTableOfContents((defaultValue || '').startsWith('<toc></toc>'));
    }
  }, [defaultValue]);

  useEffect(() => {
    if (getCreateTableOfContents) {
      getCreateTableOfContents(createTableOfContents);
    }
  }, [getCreateTableOfContents, createTableOfContents]);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        try {
          const url = await uploadFileCdn({ file });
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, 'image', url);
            editor.setSelection(range.index + 1);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          [{ indent: '-1' }, { indent: '+1' }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          ['clean']
        ],
        handlers: {
          image: imageHandler
        }
      },
      imageUploader: {
        upload: async (file) => {
          const url = await uploadFileCdn({ file });
          return url;
        }
      }
    }),
    []
  );

  const formats = [
    'header',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'list',
    'bullet',
    'align',
    'indent',
    'blockquote',
    'code-block',
    'link',
    'image'
  ];

  const handleChange = (value) => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setContent(value);
    onChange && onChange(value);
  };

  return (
    <div className="relative">
      {showCreateTableOfContents && (
        <div className="mb-5 flex items-center gap-2">
          <Checkbox checked={createTableOfContents} onChange={(e) => setCreateTableOfContents(e.target.checked)}>
            Tạo mục lục
          </Checkbox>
          <Tooltip
            title={<p>Mục lục sẽ được tự động tạo dựa theo các thẻ heading (Tiêu đề 1, Tiêu đề 2... Tiêu đề 6)</p>}
          >
            <div>
              <FaQuestionCircle />
            </div>
          </Tooltip>
        </div>
      )}

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        style={{ minHeight: '600px' }}
      />
    </div>
  );
};

export default memo(QuillEditor);
