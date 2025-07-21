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
    placeholder: {
      showOnlyCurrent: true
    },
    characterCount: {
      limit: 50_000
    }
  }),
  History,
  SearchAndReplace,
  Clear,
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
  Link,

  // 🚀 CRITICAL: Enhanced Image extension với ALT text dialog
  Image.configure({
    // 🎯 UPLOAD FUNCTION: Existing upload logic preserved
    upload: (file) => {
      return uploadFileCdn({ file }).then((url) => {
        return url;
      });
    },

    // 🚀 CRITICAL: Enable ALT text attributes
    HTMLAttributes: {
      class: 'content-image'
    },

    // 🎯 ALLOW ALT ATTRIBUTE: Essential để preserve ALT text
    allowBase64: false,

    // 🚀 ENHANCED: Custom addAttributes để support ALT input
    addAttributes() {
      return {
        ...this.parent?.(),
        alt: {
          default: null,
          parseHTML: (element) => element.getAttribute('alt'),
          renderHTML: (attributes) => {
            if (!attributes.alt) {
              return {};
            }
            return {
              alt: attributes.alt,
              title: attributes.alt // Also set title for better UX
            };
          }
        },
        title: {
          default: null,
          parseHTML: (element) => element.getAttribute('title'),
          renderHTML: (attributes) => {
            if (!attributes.title) {
              return {};
            }
            return {
              title: attributes.title
            };
          }
        }
      };
    },

    // 🚀 SENIOR APPROACH: Custom commands để handle ALT text editing
    addCommands() {
      return {
        ...this.parent?.(),

        // 🎯 COMMAND: Set ALT text cho image
        setImageAlt:
          (alt) =>
          ({ tr, dispatch, state }) => {
            const { selection } = state;
            const node = state.doc.nodeAt(selection.from);

            if (node && node.type.name === 'image') {
              if (dispatch) {
                tr.setNodeMarkup(selection.from, undefined, {
                  ...node.attrs,
                  alt: alt,
                  title: alt
                });
              }
              return true;
            }
            return false;
          }
      };
    },

    // 🚀 CRITICAL: Custom node view với ALT editing functionality
    addNodeView() {
      return ({ node, updateAttributes, getPos, editor }) => {
        const container = document.createElement('div');
        container.className = 'image-node-view';
        container.style.position = 'relative';
        container.style.display = 'inline-block';

        const img = document.createElement('img');
        img.src = node.attrs.src;
        img.alt = node.attrs.alt || '';
        img.title = node.attrs.title || node.attrs.alt || '';
        img.className = 'content-image';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';

        // 🎯 EDIT BUTTON: Visible ALT edit button
        const editButton = document.createElement('button');
        editButton.innerHTML = '✏️ ALT';
        editButton.className = 'alt-edit-btn';
        editButton.style.position = 'absolute';
        editButton.style.top = '8px';
        editButton.style.right = '8px';
        editButton.style.background = 'rgba(0, 0, 0, 0.7)';
        editButton.style.color = 'white';
        editButton.style.border = 'none';
        editButton.style.borderRadius = '4px';
        editButton.style.padding = '4px 8px';
        editButton.style.fontSize = '12px';
        editButton.style.cursor = 'pointer';
        editButton.style.opacity = '0';
        editButton.style.transition = 'opacity 0.3s ease';

        // 🚀 HOVER EFFECTS: Show/hide edit button
        container.addEventListener('mouseenter', () => {
          editButton.style.opacity = '1';
        });

        container.addEventListener('mouseleave', () => {
          editButton.style.opacity = '0';
        });

        // 🎯 CLICK HANDLER: ALT text input dialog
        const handleAltEdit = () => {
          const currentAlt = node.attrs.alt || '';
          const newAlt = prompt('Nhập mô tả hình ảnh (ALT text):', currentAlt);

          if (newAlt !== null) {
            // User didn't cancel
            updateAttributes({
              alt: newAlt.trim(),
              title: newAlt.trim()
            });
          }
        };

        // 🚀 EVENT LISTENERS: Multiple ways to trigger ALT editing
        editButton.addEventListener('click', handleAltEdit);
        img.addEventListener('dblclick', handleAltEdit);

        // 🎯 ASSEMBLY: Build the node view
        container.appendChild(img);
        container.appendChild(editButton);

        return {
          dom: container,
          update: (updatedNode) => {
            if (updatedNode.type !== node.type) return false;

            // 🚀 UPDATE ATTRIBUTES: Sync changes
            img.src = updatedNode.attrs.src;
            img.alt = updatedNode.attrs.alt || '';
            img.title = updatedNode.attrs.title || updatedNode.attrs.alt || '';

            // Update node reference
            node = updatedNode;
            return true;
          }
        };
      };
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
