import { uploadFileCdn } from '@/utils/helper';
import { Checkbox, Modal, Tooltip } from 'antd';
import { memo, useEffect, useState, useRef, useId } from 'react';
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

const sanitizeEditorContent = (htmlContent) => {
  if (!htmlContent) return '';
  return htmlContent.replace(/>\s+</g, '><').trim();
};

const Editor = (props) => {
  const { defaultValue, disabled, onChange, showCreateTableOfContents, getCreateTableOfContents } = props;
  const [content, setContent] = useState(defaultValue || '');
  const [contentModalHtml, setContentModalHtml] = useState();
  const [showModalHtml, setShowModalHtml] = useState(false);
  const [key, setKey] = useState(0);
  const [createTableOfContents, setCreateTableOfContents] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isInitialMount = useRef(true);
  const isSettingContent = useRef(false);
  const editorRef = useRef(null);

  // UNIQUE ID CHO MỖI EDITOR
  const editorId = useId();

  // DISABLE UPLOAD TRONG IMAGE EXTENSION - CHỈ SỬ DỤNG CƠ BẢN
  const extensions = [
    BaseKit.configure({
      placeholder: {
        showOnlyCurrent: true
      },
      characterCount: {
        limit: 100_000
      }
    }),
    History,
    SearchAndReplace,
    Clear,
    Heading.configure({
      spacer: false
    }),
    FontSize,
    Bold,
    Italic,
    Underline,
    Strike,
    Color.configure({ spacer: false }),
    Highlight,
    BulletList,
    OrderedList,
    TextAlign.configure({ types: ['heading', 'paragraph'], spacer: false }),
    Indent,
    LineHeight,
    Link.configure({
      HTMLAttributes: {
        rel: 'noopener'
      }
    }),
    // IMAGE EXTENSION KHÔNG CÓ UPLOAD - CHỈ HIỂN THỊ
    Image.configure({
      allowBase64: false,
      inline: false,
      HTMLAttributes: {
        style: 'max-width: 100%; height: auto;'
      }
    }),
    Blockquote,
    SlashCommand,
    HorizontalRule,
    Code.configure({
      toolbar: false
    }),
    CodeBlock.configure({ defaultTheme: 'dracula' }),
    Table
  ];

  // HANDLE MANUAL IMAGE UPLOAD QUA CUSTOM MENU
  const handleImageUpload = async () => {
    if (isUploading || disabled || !editorRef.current) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);

      try {
        // Upload file
        const url = await uploadFileCdn({ file });

        if (url && editorRef.current) {
          const { editor } = editorRef.current;

          // INSERT IMAGE VÀO VỊ TRÍ CURSOR HIỆN TẠI
          editor
            .chain()
            .focus() // Đảm bảo editor được focus
            .setImage({ src: url, alt: file.name })
            .run();
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsUploading(false);
        // Clean up input element
        input.remove();
      }
    };

    // Trigger file selection
    document.body.appendChild(input);
    input.click();
  };

  // CUSTOM MENU ITEMS CHO UPLOAD
  const customMenuItems = [
    {
      name: `uploadImage_${editorId}`,
      tooltip: 'Thêm hình ảnh',
      display: 'Hình ảnh',
      icon: '🖼️',
      disabled: isUploading || disabled,
      action: handleImageUpload
    }
  ];

  const onChangeContent = (value) => {
    if (isInitialMount.current || isSettingContent.current) {
      setContent(value);
      return;
    }

    const cleanContent = value.trim().replace(/<p><\/p>/g, '');
    setContent(cleanContent);
    onChange && onChange(cleanContent);
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      isSettingContent.current = true;

      const cleanedDefaultValue = (defaultValue || '<p></p>').replace(/<p><\/p>/g, '');
      setContent(cleanedDefaultValue);
      setCreateTableOfContents((defaultValue || '').startsWith('<toc></toc>'));
      setKey((prev) => prev + 1);

      setTimeout(() => {
        isSettingContent.current = false;
        isInitialMount.current = false;
      }, 100);
    } else {
      isInitialMount.current = false;
    }
  }, [defaultValue]);

  useEffect(() => {
    if (getCreateTableOfContents) {
      getCreateTableOfContents(createTableOfContents);
    }
  }, [getCreateTableOfContents, createTableOfContents]);

  const handleModalOk = () => {
    setKey((prev) => prev + 1);
    const cleanContent = sanitizeEditorContent(contentModalHtml?.trim()).replace(/<p><\/p>/g, '');
    setContent(cleanContent);
    setShowModalHtml(false);
    onChange && onChange(cleanContent);
  };

  locale.setLang('vi');

  return (
    <div className="relative" key={`${key}-${editorId}`}>
      {showCreateTableOfContents && (
        <div className="mb-5 flex items-center gap-2">
          <Checkbox
            checked={createTableOfContents}
            onChange={(e) => setCreateTableOfContents(e.target.checked)}
            id={`toc-checkbox-${editorId}`}
          >
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
        ref={editorRef}
        disabled={disabled}
        dark={false}
        output="html"
        content={content}
        onChangeContent={onChangeContent}
        extensions={extensions}
        customMenuItems={customMenuItems}
        minHeight={600}
        key={`editor-${editorId}`}
      />

      {/* LOADING INDICATOR KHI UPLOAD */}
      {isUploading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-4 rounded-md shadow-lg z-40">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Đang tải hình...</span>
          </div>
        </div>
      )}

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
        title="Nội dung HTML"
        open={showModalHtml}
        onOk={handleModalOk}
        onCancel={() => setShowModalHtml(false)}
        width="80%"
        okText="Lưu"
        cancelText="Hủy"
      >
        <textarea
          className="w-full"
          rows={20}
          value={contentModalHtml}
          onChange={(e) => setContentModalHtml(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default memo(Editor);
