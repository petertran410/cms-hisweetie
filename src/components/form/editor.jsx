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
import FigureImage from '../table/extensions/FigureImage';
import ImageCaptionModal from '@/components/modals/ImageCaptionModal';

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

  const isInitialMount = useRef(true);
  const isSettingContent = useRef(false);

  const [showImageCaptionModal, setShowImageCaptionModal] = useState(false);
  const [selectedImageNode, setSelectedImageNode] = useState(null);
  const [selectedImagePos, setSelectedImagePos] = useState(null);
  const editorRef = useRef(null);

  const editorId = useId();
  const eventName = `editFigureImage_${editorId}`;

  const customFigureImage = FigureImage.configure({
    uploadImage: async (file) => {
      try {
        const url = await uploadFileCdn({ file });
        return url;
      } catch (error) {
        console.error('Error uploading image:', error);
        return null;
      }
    }
  });

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
    Image.configure({
      upload: (file) => {
        return uploadFileCdn({ file }).then((url) => {
          return url;
        });
      },
      allowBase64: true,
      inline: true,
      HTMLAttributes: {
        style: 'display: inline-block; vertical-align: top; margin: 0;'
      }
    }),
    customFigureImage,
    Blockquote,
    SlashCommand,
    HorizontalRule,
    Code.configure({
      toolbar: false
    }),
    CodeBlock.configure({ defaultTheme: 'dracula' }),
    Table
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

  // SỬ DỤNG UNIQUE EVENT NAME CHO MỖI EDITOR
  useEffect(() => {
    const handleEditFigureImage = (event) => {
      const { node, pos } = event.detail;
      setSelectedImageNode(node);
      setSelectedImagePos(pos);
      setShowImageCaptionModal(true);
    };

    window.addEventListener(eventName, handleEditFigureImage);

    return () => {
      window.removeEventListener(eventName, handleEditFigureImage);
    };
  }, [eventName]);

  const handleSaveImageCaption = (values) => {
    if (editorRef.current && selectedImageNode && selectedImagePos !== null) {
      const { editor } = editorRef.current;

      editor
        .chain()
        .focus()
        .updateFigureImage({
          alt: values.alt,
          caption: values.caption
        })
        .run();

      setShowImageCaptionModal(false);
      setSelectedImageNode(null);
      setSelectedImagePos(null);
    }
  };

  const customMenuItems = [
    {
      name: `insertFigureImage_${editorId}`,
      tooltip: 'Chèn hình ảnh có chú thích',
      display: 'Hình + Chú thích',
      icon: '🖼️',
      action: async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.id = `image-upload-${editorId}`;

        input.onchange = async (event) => {
          const file = event.target.files[0];
          if (file && editorRef.current) {
            try {
              const url = await uploadFileCdn({ file });

              if (url) {
                setSelectedImageNode({ attrs: { src: url } });
                setShowImageCaptionModal(true);
              }
            } catch (error) {
              console.error('Error uploading image:', error);
            }
          }
        };

        input.click();
      }
    }
  ];

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
        minHeight={600}
        customMenuItems={customMenuItems}
        key={`editor-${editorId}`}
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

      <ImageCaptionModal
        visible={showImageCaptionModal}
        onSave={handleSaveImageCaption}
        onCancel={() => {
          setShowImageCaptionModal(false);
          setSelectedImageNode(null);
          setSelectedImagePos(null);
        }}
        initialData={selectedImageNode}
      />
    </div>
  );
};

export default memo(Editor);
