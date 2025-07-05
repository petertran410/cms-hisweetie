// src/pages/pages/pages-form/pages-form.jsx
import { ButtonSave, FileUploadSingle } from '@/components/form';
import { WEBSITE_NAME } from '@/utils/resource';
import { Form, Input, Select, Switch, InputNumber, Card, Row, Col, Divider, Alert } from 'antd';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { useCreatePages, useUpdatePages, useQueryPagesDetail, useQueryParentPagesList } from '@/services/pages.service';
import { useEffect, useState } from 'react';
import { showToast } from '@/utils/helper';

const { Option } = Select;
const { TextArea } = Input;

const PagesForm = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [content, setContent] = useState('');

  const { data: pageData, isLoading: loadingDetail } = useQueryPagesDetail(id);
  const { data: parentPagesData } = useQueryParentPagesList();
  const { mutate: createMutate, isPending: creating } = useCreatePages();
  const { mutate: updateMutate, isPending: updating } = useUpdatePages(id);

  const { content: parentPages = [] } = parentPagesData || {};

  // Load dữ liệu khi edit
  useEffect(() => {
    if (isEdit && pageData) {
      const { slug, title, content, meta_title, meta_description, display_order, parent_id, is_active, is_main_page } =
        pageData;

      form.setFieldsValue({
        slug,
        title,
        meta_title,
        meta_description,
        display_order: display_order || 0,
        parent_id,
        is_active: is_active ?? true,
        is_main_page: is_main_page ?? false
      });

      setContent(content || '');
    }
  }, [isEdit, pageData, form]);

  // Xử lý submit form
  const handleSubmit = (values) => {
    const formData = {
      ...values,
      content,
      display_order: values.display_order || 0
    };

    // Validation
    if (!formData.slug || !formData.title) {
      showToast({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin bắt buộc' });
      return;
    }

    // Kiểm tra slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      showToast({
        type: 'error',
        message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang. Ví dụ: chinh-sach-bao-mat'
      });
      return;
    }

    if (isEdit) {
      updateMutate(formData);
    } else {
      createMutate(formData);
    }
  };

  // Generate slug từ title
  const generateSlug = (title) => {
    if (!title) return '';

    return title
      .toLowerCase()
      .trim()
      .replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, 'a')
      .replace(/[éèẻẽẹêếềểễệ]/g, 'e')
      .replace(/[íìỉĩị]/g, 'i')
      .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
      .replace(/[úùủũụưứừửữự]/g, 'u')
      .replace(/[ýỳỷỹỵ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = generateSlug(title);
    form.setFieldValue('slug', slug);
  };

  return (
    <>
      <Helmet>
        <title>
          {isEdit ? 'Cập nhật trang' : 'Tạo trang mới'} - {WEBSITE_NAME}
        </title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <Card title={isEdit ? 'Cập nhật trang' : 'Tạo trang mới'} loading={isEdit && loadingDetail}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              is_active: true,
              is_main_page: false,
              display_order: 0
            }}
          >
            {/* Thông tin cơ bản */}
            <Card size="small" title="Thông tin cơ bản" className="mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Tiêu đề trang"
                    name="title"
                    rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                  >
                    <Input placeholder="Ví dụ: Chính Sách Bảo Mật" onChange={handleTitleChange} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Slug (URL)"
                    name="slug"
                    rules={[
                      { required: true, message: 'Vui lòng nhập slug' },
                      {
                        pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                        message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'
                      }
                    ]}
                  >
                    <Input placeholder="chinh-sach-bao-mat" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Trang cha" name="parent_id">
                    <Select placeholder="Chọn trang cha (nếu có)" allowClear>
                      {parentPages.map((page) => (
                        <Option key={page.id} value={page.id}>
                          {page.title}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item label="Thứ tự hiển thị" name="display_order">
                    <InputNumber min={0} style={{ width: '100%' }} placeholder="0" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <div className="space-y-4">
                    <Form.Item label="Hiển thị" name="is_active" valuePropName="checked">
                      <Switch />
                    </Form.Item>

                    <Form.Item label="Trang chính" name="is_main_page" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* SEO */}
            <Card size="small" title="Thông tin SEO" className="mb-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="Meta Title (SEO)" name="meta_title">
                    <Input placeholder="Tiêu đề cho Google Search" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Meta Description (SEO)" name="meta_description">
                    <TextArea rows={3} placeholder="Mô tả ngắn gọn về trang này (dùng cho Google)" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Nội dung */}
            <Card size="small" title="Nội dung trang" className="mb-4">
              <Alert
                message="Hướng dẫn"
                description="Bạn có thể sử dụng HTML để định dạng nội dung. Nội dung này sẽ hiển thị trên website."
                type="info"
                className="mb-4"
              />

              <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={15}
                placeholder="Nhập nội dung HTML cho trang..."
              />
            </Card>

            <ButtonSave loading={creating || updating} />
          </Form>
        </Card>
      </div>
    </>
  );
};

export default PagesForm;
