// src/pages/news/news-create/news-create.jsx - UPDATED với dropdown type
import { useCreateNews } from '@/services/news.service';
import { NEWS_TYPE_OPTIONS } from '@/utils/news-types.constants';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Col, Form, Input, Row, Select, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { API } from '@/utils/API';

const { TextArea } = Input;

const NewsCreate = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { mutate: createMutate, isPending } = useCreateNews();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');

  // Quill editor modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      [{ align: [] }],
      ['clean']
    ]
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'blockquote',
    'code-block',
    'align'
  ];

  // Handle image upload for the main featured images
  const handleUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploading(true);
      const response = await API.upload({ file });

      if (response?.url) {
        onSuccess(response, file);
        message.success('Tải ảnh lên thành công!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onError(error);
      message.error('Tải ảnh lên thất bại!');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Chỉ được phép tải lên file ảnh!');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Ảnh phải nhỏ hơn 5MB!');
      return false;
    }

    return true;
  };

  const onFinish = (values) => {
    try {
      // Prepare images URL array
      const imagesUrl = fileList
        .filter((file) => file.status === 'done' && file.response?.url)
        .map((file) => file.response.url);

      const submitData = {
        ...values,
        htmlContent: htmlContent,
        imagesUrl: JSON.stringify(imagesUrl),
        type: values.type // Đảm bảo type được bao gồm
      };

      createMutate(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      message.error('Có lỗi xảy ra khi tạo tin tức!');
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Tạo tin tức mới - {WEBSITE_NAME}</title>
      </Helmet>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Tạo tin tức mới</h1>
          <Button onClick={() => navigate('/news')} className="bg-gray-500 hover:bg-gray-600">
            Quay lại
          </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              type: 'NEWS' // Giá trị mặc định
            }}
          >
            <Row gutter={[16, 0]}>
              {/* Tiêu đề */}
              <Col span={24}>
                <Form.Item
                  label="Tiêu đề"
                  name="title"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tiêu đề!' },
                    { min: 10, message: 'Tiêu đề phải có ít nhất 10 ký tự!' },
                    { max: 200, message: 'Tiêu đề không được vượt quá 200 ký tự!' }
                  ]}
                >
                  <Input placeholder="Nhập tiêu đề bài viết..." size="large" />
                </Form.Item>
              </Col>

              {/* Loại bài viết - DROPDOWN MỚI */}
              <Col span={12}>
                <Form.Item
                  label="Loại bài viết"
                  name="type"
                  rules={[{ required: true, message: 'Vui lòng chọn loại bài viết!' }]}
                >
                  <Select
                    placeholder="Chọn loại bài viết"
                    size="large"
                    options={NEWS_TYPE_OPTIONS}
                    showSearch
                    filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
                  />
                </Form.Item>
              </Col>

              {/* Mô tả ngắn */}
              <Col span={24}>
                <Form.Item
                  label="Mô tả ngắn"
                  name="description"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mô tả!' },
                    { min: 50, message: 'Mô tả phải có ít nhất 50 ký tự!' },
                    { max: 500, message: 'Mô tả không được vượt quá 500 ký tự!' }
                  ]}
                >
                  <TextArea rows={3} placeholder="Nhập mô tả ngắn về bài viết..." showCount maxLength={500} />
                </Form.Item>
              </Col>

              {/* Ảnh đại diện */}
              <Col span={24}>
                <Form.Item label="Ảnh đại diện">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    customRequest={handleUpload}
                    onChange={handleChange}
                    beforeUpload={beforeUpload}
                    accept="image/*"
                    multiple
                  >
                    {fileList.length >= 5 ? null : uploadButton}
                  </Upload>
                  <div className="text-gray-500 text-sm mt-2">
                    • Tối đa 5 ảnh, mỗi ảnh nhỏ hơn 5MB
                    <br />
                    • Định dạng: JPG, PNG, WEBP
                    <br />• Ảnh đầu tiên sẽ được sử dụng làm ảnh đại diện
                  </div>
                </Form.Item>
              </Col>

              {/* Nội dung HTML */}
              <Col span={24}>
                <Form.Item
                  label="Nội dung bài viết"
                  rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết!' }]}
                >
                  <div className="border border-gray-300 rounded-md">
                    <ReactQuill
                      theme="snow"
                      value={htmlContent}
                      onChange={setHtmlContent}
                      modules={modules}
                      formats={formats}
                      placeholder="Nhập nội dung bài viết..."
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                  {!htmlContent && <div className="text-red-500 text-sm mt-1">Vui lòng nhập nội dung bài viết!</div>}
                </Form.Item>
              </Col>

              {/* Submit buttons */}
              <Col span={24}>
                <Form.Item>
                  <div className="flex gap-3 justify-end">
                    <Button size="large" onClick={() => navigate('/news')} disabled={isPending}>
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      loading={isPending || uploading}
                      disabled={!htmlContent}
                    >
                      Tạo tin tức
                    </Button>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    </>
  );
};

export default NewsCreate;
