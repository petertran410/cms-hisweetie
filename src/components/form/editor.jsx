import { uploadFileCdn } from '@/utils/helper';
import { Checkbox, Modal, Tooltip } from 'antd';
import { memo, useEffect, useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import RichTextEditor, {
  BaseKit,
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeBlock,
  Color,
  FontSize,
  Heading,
  Highlight,
  History,
  HorizontalRule,
  Image,
  Indent,
  Italic,
  LineHeight,
  Link,
  locale,
  OrderedList,
  SearchAndReplace,
  SlashCommand,
  Strike,
  Table,
  TextAlign,
  Underline
} from 'reactjs-tiptap-editor';
import 'reactjs-tiptap-editor/style.css';

const extensions = [
  BaseKit.configure({
    // Show placeholder
    placeholder: {
      showOnlyCurrent: true
    },

    // Character count
    characterCount: {
      limit: 50_000
    }
  }),
  History,
  SearchAndReplace,
  Clear,
  // FontFamily,
  Heading.configure({ spacer: true }),
  FontSize,
  Bold,
  Italic,
  Underline,
  Strike,
  Color.configure({ spacer: true }),
  Highlight,
  BulletList,
  OrderedList,
  TextAlign.configure({ types: ['heading', 'paragraph'], spacer: true }),
  Indent,
  LineHeight,
  Link.configure({
    HTMLAttributes: {
      rel: 'noopener'
    }
  }),
  Image.configure({
    upload: (file) => {
      return uploadFileCdn({ file }).then((url) => {
        return url;
      });
    },
    allowBase64: true,
    inline: false,
    HTMLAttributes: {},
    uploadWithAlt: true,
    interfaceLanguage: {
      uploadImage: 'Tải ảnh lên',
      uploadViaURL: 'Tải từ URL',
      enterImageURL: 'Nhập URL hình ảnh',
      enterImageAlt: 'Nhập mô tả hình ảnh (alt text)',
      cancel: 'Hủy',
      submit: 'Chèn ảnh'
    }
  }),
  CodeBlock.configure({ defaultTheme: 'dracula' }),
  Table
];

const Editor = (props) => {
  const { defaultValue, disabled, onChange, showCreateTableOfContents, getCreateTableOfContents } = props;
  const [content, setContent] = useState(defaultValue);
  const [contentModalHtml, setContentModalHtml] = useState();
  const [showModalHtml, setShowModalHtml] = useState(false);
  const [key, setKey] = useState(0);
  const [createTableOfContents, setCreateTableOfContents] = useState(false);

  const onChangeContent = (value) => {
    setContent(value);
    onChange && onChange(value);
  };

  useEffect(() => {
    if (defaultValue) {
      setContent(defaultValue);
      setCreateTableOfContents(defaultValue.startsWith('<toc></toc>'));
    }
  }, [defaultValue]);

  useEffect(() => {
    if (getCreateTableOfContents) {
      getCreateTableOfContents(createTableOfContents);
    }
  }, [getCreateTableOfContents, createTableOfContents]);

  locale.setLang('vi');

  return (
    <div className="relative" key={key}>
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
      <RichTextEditor
        disabled={disabled}
        dark={false}
        output="html"
        content={content}
        onChangeContent={onChangeContent}
        extensions={extensions}
        minHeight={600}
      />

      <div className="absolute bottom-3 right-3 z-30">
        <button
          className="bg-[#e6e6e6] px-3 py-0.5 rounded-md duration-200 hover:bg-[#ccc] text-[13px]"
          type="button"
          onClick={() => {
            setContentModalHtml(content);
            setShowModalHtml(true);
          }}
        >
          HTML
        </button>
      </div>

      <Modal
        title="Chỉnh sửa HTML"
        open={showModalHtml}
        cancelText="Huỷ bỏ"
        okText="Xác nhận"
        width={1000}
        onOk={() => {
          setKey((prev) => prev + 1);
          setContent(contentModalHtml?.trim());
          setShowModalHtml(false);
          onChange && onChange(contentModalHtml?.trim());
        }}
        onCancel={() => {
          setShowModalHtml(false);
          setContentModalHtml();
        }}
      >
        <div className="py-5 w-full">
          <textarea
            className="w-full border border-[#ccc] p-4 focus:outline-none bg-[#f5f5f5] rounded-md"
            rows={20}
            value={contentModalHtml}
            onChange={(e) => setContentModalHtml(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default memo(Editor);
