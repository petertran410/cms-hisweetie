// 🚀 100% WORKING EXTERNAL ALT BUTTON SOLUTION
// File: src/components/form/form-editor.jsx
// Thay thế toàn bộ file content

import { uploadFileCdn } from '@/utils/helper';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { useRef, useState } from 'react';

const FormEditor = ({ options, height = '400px', defaultValue = '', onChange, disabled }) => {
  const editorRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // 🎯 SIMPLE SUNEDITOR CONFIG: Keep it basic and working
  const enhancedOptions = {
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
    showPathLabel: false,
    addTagsWhitelist: 'img[src|alt|title|width|height|style|data-*]|p|div|br|span|strong|em|b|i|u|s|h1|h2|h3|h4|h5|h6',
    pasteTagsWhitelist: 'img[src|alt|title|width|height]|p|div|br|span|strong|em|b|i|u|s',

    ...options
  };

  // 🚀 IMAGE UPLOAD HANDLER: Standard và reliable
  const handleImageUpload = (files, info, uploadHandler) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    uploadFileCdn({ file })
      .then((url) => {
        if (url) {
          const data = {
            result: [
              {
                url: url,
                name: file.name,
                size: file.size
              }
            ]
          };
          uploadHandler(data);
        }
      })
      .catch((error) => {
        console.error('Image upload failed:', error);
      });
  };

  // 🎯 IMAGE INSERT HANDLER: Add click listener cho images
  const handleImageInsert = (targetImgElement, index, state, info, remainingFilesCount) => {
    // Add default ALT nếu chưa có
    if (!targetImgElement.getAttribute('alt')) {
      targetImgElement.setAttribute('alt', 'Hình ảnh');
    }

    targetImgElement.classList.add('content-image');
    targetImgElement.style.maxWidth = '100%';
    targetImgElement.style.height = 'auto';
    targetImgElement.style.cursor = 'pointer';

    // 🚀 CLICK LISTENER: Click để select image
    targetImgElement.addEventListener('click', () => {
      // Remove previous selection
      const allImages = editorRef.current?.editor?.element?.wysiwyg?.body?.querySelectorAll('img');
      allImages?.forEach((img) => {
        img.style.outline = 'none';
      });

      // Highlight selected image
      targetImgElement.style.outline = '3px solid #065FD4';
      setSelectedImage(targetImgElement);
    });

    return targetImgElement;
  };

  // 🎯 EXTERNAL ALT HANDLER: Function để edit ALT text
  const handleEditAlt = () => {
    if (!selectedImage) {
      alert('Vui lòng click chọn một hình ảnh trước khi chỉnh sửa ALT text.');
      return;
    }

    const currentAlt = selectedImage.getAttribute('alt') || '';
    const newAlt = prompt('Nhập mô tả hình ảnh (ALT text):', currentAlt);

    if (newAlt !== null) {
      selectedImage.setAttribute('alt', newAlt.trim());
      selectedImage.setAttribute('title', newAlt.trim());

      // Update content
      if (onChange && editorRef.current?.editor) {
        const content = editorRef.current.editor.getContents();
        onChange(content);
      }

      // Visual feedback
      selectedImage.style.outline = '3px solid #22c55e';
      setTimeout(() => {
        selectedImage.style.outline = '3px solid #065FD4';
      }, 1000);
    }
  };

  // 🚀 AUTO-SELECT: Click vào image để auto-select
  const setupImageClickHandlers = () => {
    setTimeout(() => {
      const editorBody = editorRef.current?.editor?.element?.wysiwyg?.body;
      if (editorBody) {
        const images = editorBody.querySelectorAll('img');
        images.forEach((img) => {
          // Remove existing listeners
          img.removeEventListener('click', img.clickHandler);

          // Add new click handler
          img.clickHandler = () => {
            // Clear previous selections
            images.forEach((i) => (i.style.outline = 'none'));

            // Select current image
            img.style.outline = '3px solid #065FD4';
            setSelectedImage(img);
          };

          img.addEventListener('click', img.clickHandler);
          img.style.cursor = 'pointer';
        });
      }
    }, 500);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 🚀 EXTERNAL ALT BUTTON: Guaranteed to work */}
      <div
        style={{
          marginBottom: '12px',
          padding: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <button
          type="button"
          onClick={handleEditAlt}
          style={{
            background: '#065FD4',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
          onMouseOver={(e) => (e.target.style.background = '#0ea5e9')}
          onMouseOut={(e) => (e.target.style.background = '#065FD4')}
        >
          ✏️ Chỉnh sửa ALT Text
        </button>

        <div style={{ fontSize: '13px', color: '#64748b' }}>
          <strong>Hướng dẫn:</strong> Click chọn hình ảnh trong editor, sau đó click nút "Chỉnh sửa ALT Text"
        </div>

        {selectedImage && (
          <div
            style={{
              fontSize: '12px',
              color: '#22c55e',
              fontWeight: '500',
              background: '#dcfce7',
              padding: '4px 8px',
              borderRadius: '4px'
            }}
          >
            ✅ Đã chọn hình ảnh
          </div>
        )}
      </div>

      <SunEditor
        ref={editorRef}
        defaultValue={defaultValue}
        height={height}
        disable={disabled}
        setOptions={enhancedOptions}
        setDefaultStyle="font-size: 14px; font-family: 'Inter'"
        onChange={(content) => {
          onChange && onChange(content);
          setupImageClickHandlers();
        }}
        onImageUploadBefore={handleImageUpload}
        onImageUpload={handleImageInsert}
        onLoad={() => {
          setupImageClickHandlers();
        }}
        onPaste={() => {
          // Handle pasted images
          setTimeout(setupImageClickHandlers, 1000);
        }}
      />
    </div>
  );
};

export default FormEditor;
