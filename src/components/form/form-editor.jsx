import { uploadFileCdn } from '@/utils/helper';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

const FormEditor = ({ options, height = '400px', defaultValue = '', onChange, disabled }) => {
  // 🎯 SENIOR-LEVEL: Enhanced options với ALT text dialog
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
      ['image'] // Enhanced image button
    ],
    showPathLabel: false,

    // 🚀 CRITICAL: Image configuration với ALT text dialog
    imageFileInput: true,
    imageUrlInput: true,
    imageUploadHeader: undefined,
    imageUploadUrl: undefined,

    // 🎯 ALT TEXT DIALOG: Enable ALT input trong image dialog
    imageConfig: {
      imageFileInput: true,
      imageUrlInput: true,
      imageSize: true,
      imageAltInput: true, // ✅ ENABLE ALT TEXT INPUT
      imageCaptionCheck: false, // Disable caption checkbox
      imageResizing: true,
      imageHeightShow: true,
      imageAlignShow: true,
      imageSizeOnlyPercentage: false,
      imageRotation: false,
      imageFileInputAccept: '.jpg,.jpeg,.png,.gif,.webp,.bmp'
    },

    // 🚀 IMAGE DIALOG CUSTOMIZATION: Professional dialog
    lang: {
      toolbar: {
        image: 'Chèn hình ảnh'
      },
      dialogBox: {
        image: {
          title: 'Chèn hình ảnh',
          file: 'Chọn từ file',
          url: 'URL hình ảnh',
          altText: 'Mô tả hình ảnh (ALT Text)', // ✅ ALT TEXT LABEL
          upload: 'Tải lên',
          submitButton: 'Chèn',
          revertButton: 'Hoàn tác',
          proportion: 'Tỷ lệ',
          basic: 'Cơ bản',
          left: 'Trái',
          right: 'Phải',
          center: 'Giữa'
        }
      }
    },

    // 🎯 HTML OUTPUT: Preserve ALT text trong HTML
    addTagsWhitelist: 'img[src|alt|title|width|height|style|data-*]|figure|figcaption',
    pasteTagsWhitelist: 'img[src|alt|title|width|height]|p|div|br|span|strong|em|b|i|u|s',

    // Merge với custom options nếu có
    ...options
  };

  // 🚀 CUSTOM IMAGE UPLOAD HANDLER: Preserve ALT text
  const handleImageUpload = (files, info, uploadHandler) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // 🎯 UPLOAD FILE: Using existing CDN function
    uploadFileCdn({ file })
      .then((url) => {
        if (url) {
          // 🚀 IMPORTANT: Construct response với ALT text support
          const data = {
            result: [
              {
                url: url,
                name: file.name,
                size: file.size
              }
            ]
          };

          // 🎯 CALLBACK: Trigger SunEditor upload handler
          uploadHandler(data);
        }
      })
      .catch((error) => {
        console.error('Image upload failed:', error);
        // Có thể thêm toast notification ở đây nếu cần
      });
  };

  // 🚀 IMAGE INSERT EVENT: Handle ALT text persistence
  const handleImageInsert = (targetImgElement, index, state, info, remainingFilesCount) => {
    // 🎯 PRESERVE ALT TEXT: Ensure ALT text từ dialog được preserve
    if (info && info.alt) {
      targetImgElement.setAttribute('alt', info.alt);
      targetImgElement.setAttribute('title', info.alt);
    }

    // 🚀 STYLING: Add professional classes
    targetImgElement.classList.add('content-image');

    // 🎯 RESPONSIVE: Ensure images are responsive
    if (!targetImgElement.style.maxWidth) {
      targetImgElement.style.maxWidth = '100%';
      targetImgElement.style.height = 'auto';
    }

    return targetImgElement;
  };

  return (
    <SunEditor
      defaultValue={defaultValue}
      height={height}
      disable={disabled}
      setOptions={enhancedOptions}
      setDefaultStyle="font-size: 14px; font-family: 'Inter'"
      onChange={onChange}
      onImageUploadBefore={handleImageUpload}
      onImageUpload={handleImageInsert}
      // 🚀 ADDITIONAL EVENTS: For comprehensive image handling
      onImageUploadError={(errorMessage, result) => {
        console.error('SunEditor image upload error:', errorMessage, result);
      }}
    />
  );
};

export default FormEditor;
