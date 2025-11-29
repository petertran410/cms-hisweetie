import { uploadFileCdn } from '@/utils/helper';
import { Checkbox, Modal, Tooltip, message } from 'antd';
import { memo, useEffect, useState, useRef, useId, useCallback, useMemo } from 'react';
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

  // UNIQUE ID CHO MỖI EDITOR INSTANCE
  const editorId = useId();
  const editorInstanceId = `editor_${editorId.replace(/:/g, '_')}`;

  console.log(`🆔 Editor instance created: ${editorInstanceId}`);

  // SCOPED UPLOAD FUNCTION VỚI EDITOR INSTANCE BINDING
  const scopedImageUpload = useCallback(
    async (file) => {
      console.log(`🔄 Scoped upload started for ${editorInstanceId}:`, {
        fileName: file.name,
        size: file.size,
        type: file.type
      });

      try {
        if (isUploading) {
          console.log(`⚠️ Upload already in progress for ${editorInstanceId}`);
          return null;
        }

        setIsUploading(true);

        message.loading({
          content: `Đang tải hình ảnh... (${editorInstanceId})`,
          key: `upload-${editorInstanceId}`,
          duration: 0
        });

        const url = await uploadFileCdn({ file });
        console.log(`✅ Scoped upload successful for ${editorInstanceId}:`, url);

        message.destroy(`upload-${editorInstanceId}`);
        message.success(`Tải hình ảnh thành công! (${editorInstanceId})`);

        // QUAN TRỌNG: Kiểm tra và insert image vào đúng editor instance
        if (url && editorRef.current) {
          const { editor } = editorRef.current;

          // Đảm bảo editor có focus và insert image vào đúng vị trí
          editor
            .chain()
            .focus()
            .setImage({
              src: url,
              alt: file.name,
              title: `Upload to ${editorInstanceId}`
            })
            .run();

          console.log(`🖼️ Image inserted into correct editor ${editorInstanceId}`);
        }

        return url;
      } catch (error) {
        console.error(`❌ Scoped upload error for ${editorInstanceId}:`, error);

        message.destroy(`upload-${editorInstanceId}`);
        message.error(`Tải hình ảnh thất bại (${editorInstanceId}): ${error.message || 'Unknown error'}`);

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [editorInstanceId, isUploading]
  );

  // EXTENSIONS VỚI IMAGE UPLOAD CUSTOM HANDLER
  const extensions = useMemo(
    () => [
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
      // IMAGE EXTENSION VỚI CUSTOM UPLOAD FUNCTION VÀ INSTANCE BINDING
      Image.configure({
        upload: async (file) => {
          console.log(`📸 Image extension upload triggered for ${editorInstanceId}`);

          // Gọi scoped upload function của instance này
          const url = await scopedImageUpload(file);

          // Trả về null để không auto-insert vì đã insert trong scopedImageUpload
          return null;
        },
        allowBase64: false,
        inline: false,
        HTMLAttributes: {
          style: 'max-width: 100%; height: auto; margin: 10px 0;'
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
    ],
    [scopedImageUpload, editorInstanceId]
  );

  // MANUAL UPLOAD FUNCTION (BACKUP)
  const handleManualImageUpload = useCallback(async () => {
    if (isUploading || disabled || !editorRef.current) {
      console.log(`⚠️ Manual upload blocked for ${editorInstanceId}:`, {
        isUploading,
        disabled,
        hasEditor: !!editorRef.current
      });
      return;
    }

    console.log(`🔄 Starting manual upload for ${editorInstanceId}`);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    input.id = `image-input-${editorInstanceId}`;

    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        console.log(`❌ No file selected for ${editorInstanceId}`);
        return;
      }

      try {
        await scopedImageUpload(file);
      } catch (error) {
        console.error(`❌ Manual upload error for ${editorInstanceId}:`, error);
      } finally {
        input.remove();
      }
    };

    document.body.appendChild(input);
    input.click();
  }, [scopedImageUpload, editorInstanceId, isUploading, disabled]);

  // CUSTOM MENU ITEMS
  const customMenuItems = useMemo(
    () => [
      {
        name: `manual-upload-${editorInstanceId}`,
        tooltip: `Upload hình ảnh thủ công`,
        display: '📎 Upload',
        icon: '📎',
        disabled: isUploading || disabled,
        action: handleManualImageUpload
      }
    ],
    [editorInstanceId, isUploading, disabled, handleManualImageUpload]
  );

  const onChangeContent = useCallback(
    (value) => {
      if (isInitialMount.current || isSettingContent.current) {
        setContent(value);
        return;
      }

      const cleanContent = value.trim().replace(/<p><\/p>/g, '');
      setContent(cleanContent);
      onChange && onChange(cleanContent);
    },
    [onChange]
  );

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

  const handleModalOk = useCallback(() => {
    setKey((prev) => prev + 1);
    const cleanContent = sanitizeEditorContent(contentModalHtml?.trim()).replace(/<p><\/p>/g, '');
    setContent(cleanContent);
    setShowModalHtml(false);
    onChange && onChange(cleanContent);
  }, [contentModalHtml, onChange]);

  locale.setLang('vi');

  return (
    <div className="relative" key={`${key}-${editorInstanceId}`}>
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-2 text-xs text-gray-500 font-mono">Editor ID: {editorInstanceId}</div>
      )}

      {showCreateTableOfContents && (
        <div className="mb-5 flex items-center gap-2">
          <Checkbox
            checked={createTableOfContents}
            onChange={(e) => setCreateTableOfContents(e.target.checked)}
            id={`toc-checkbox-${editorInstanceId}`}
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
        key={`editor-content-${editorInstanceId}`}
      />

      {isUploading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-4 rounded-md shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span>Đang tải hình vào {editorInstanceId}...</span>
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
        title={`Nội dung HTML - ${editorInstanceId}`}
        open={showModalHtml}
        onOk={handleModalOk}
        onCancel={() => setShowModalHtml(false)}
        width="80%"
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose={true}
        maskClosable={false}
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
