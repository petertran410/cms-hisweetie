import { uploadFileCdn } from '@/utils/helper';
import { Checkbox, Modal, Tooltip } from 'antd';
import { memo, useEffect, useState, useRef } from 'react';
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
import FigureImage from '@/extensions/FigureImage';
import ImageCaptionModal from '@/components/modals/ImageCaptionModal';

const normalizeHtmlContent = (htmlContent) => {
  if (!htmlContent) return '<p></p>';

  const hasHtmlTags = /<[^>]+>/.test(htmlContent);
  if (!hasHtmlTags) {
    return htmlContent
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => `<p>${line.trim()}</p>`)
      .join('');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, 'text/html');

  const removeEmptyTextNodes = (node) => {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];
      if (child.nodeType === 3 && !child.textContent.trim()) {
        node.removeChild(child);
      } else if (child.nodeType === 1) {
        removeEmptyTextNodes(child);
      }
    }
  };

  removeEmptyTextNodes(doc.body);

  const children = Array.from(doc.body.childNodes);
  children.forEach((child) => {
    if (child.nodeType === 3 && child.textContent.trim()) {
      const p = doc.createElement('p');
      p.textContent = child.textContent;
      doc.body.replaceChild(p, child);
    }
  });

  const firstChild = doc.body.firstChild;
  const blockElements = ['UL', 'OL', 'BLOCKQUOTE', 'TABLE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE', 'DIV'];

  if (!firstChild || blockElements.includes(firstChild.nodeName)) {
    const p = doc.createElement('p');
    p.innerHTML = '<br>';
    doc.body.insertBefore(p, doc.body.firstChild);
  }

  if (!doc.body.innerHTML.trim()) {
    return '<p></p>';
  }

  return doc.body.innerHTML;
};

const sanitizeEditorContent = (htmlContent) => {
  if (!htmlContent) return '';

  return htmlContent
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

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
    },
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

  const onChangeContent = (value) => {
    if (isInitialMount.current || isSettingContent.current) {
      setContent(value);
      return;
    }

    const sanitizedContent = sanitizeEditorContent(value);
    setContent(sanitizedContent);
    onChange && onChange(sanitizedContent);
  };

  useEffect(() => {
    if (defaultValue !== undefined) {
      isSettingContent.current = true;
      const normalizedContent = normalizeHtmlContent(defaultValue);
      setContent(normalizedContent);
      setCreateTableOfContents(normalizedContent.startsWith('<toc></toc>'));
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

  useEffect(() => {
    const handleEditFigureImage = (event) => {
      const { node, pos } = event.detail;
      setSelectedImageNode(node);
      setSelectedImagePos(pos);
      setShowImageCaptionModal(true);
    };

    window.addEventListener('editFigureImage', handleEditFigureImage);

    return () => {
      window.removeEventListener('editFigureImage', handleEditFigureImage);
    };
  }, []);

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
      name: 'insertFigureImage',
      tooltip: 'Chèn hình ảnh có chú thích',
      display: 'Hình + Chú thích',
      icon: '🖼️',
      action: async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async (event) => {
          const file = event.target.files[0];
          if (file) {
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
    const cleanContent = sanitizeEditorContent(contentModalHtml?.trim());
    setContent(cleanContent);
    setShowModalHtml(false);
    onChange && onChange(cleanContent);
  };

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
        ref={editorRef}
        disabled={disabled}
        dark={false}
        output="html"
        content={content}
        onChangeContent={onChangeContent}
        extensions={extensions}
        minHeight={600}
        customMenuItems={customMenuItems}
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
        onOk={handleModalOk}
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

      <ImageCaptionModal
        visible={showImageCaptionModal}
        onCancel={() => {
          setShowImageCaptionModal(false);
          setSelectedImageNode(null);
        }}
        onSave={(values) => {
          if (selectedImageNode && selectedImageNode.attrs && selectedImageNode.attrs.src) {
            if (selectedImagePos === null) {
              if (editorRef.current) {
                const { editor } = editorRef.current;

                editor
                  .chain()
                  .focus()
                  .insertFigureImage({
                    src: selectedImageNode.attrs.src,
                    alt: values.alt,
                    caption: values.caption
                  })
                  .run();
              }
            } else {
              handleSaveImageCaption(values);
            }
          }

          setShowImageCaptionModal(false);
          setSelectedImageNode(null);
          setSelectedImagePos(null);
        }}
        initialValues={
          selectedImageNode
            ? {
                alt: selectedImageNode.attrs?.alt || '',
                caption: selectedImageNode.attrs?.caption || ''
              }
            : {}
        }
      />
    </div>
  );
};

export default memo(Editor);
