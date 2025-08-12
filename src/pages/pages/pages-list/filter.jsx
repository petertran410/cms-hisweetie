import { useQueryParentPagesList } from '@/services/pages.service';
import { useGetParamsURL } from '@/utils/helper';
import { Input, Select, Button, Form, Row, Col, Space } from 'antd';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const TableFilter = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const paramsURL = useGetParamsURL();
  const { data: parentPagesData } = useQueryParentPagesList();
  const { content: parentPages = [] } = parentPagesData || {};

  // Set initial values từ URL params
  useEffect(() => {
    form.setFieldsValue({
      title: paramsURL?.title || '',
      slug: paramsURL?.slug || '',
      parentId: paramsURL?.parentId || '',
      isActive: paramsURL?.isActive || ''
    });
  }, [paramsURL, form]);

  const handleSearch = (values) => {
    const searchParams = new URLSearchParams();

    Object.keys(values).forEach((key) => {
      if (values[key]) {
        searchParams.set(key, values[key]);
      }
    });

    // Reset page về 1 khi search
    searchParams.set('page', '1');

    navigate(`/pages?${searchParams.toString()}`);
  };

  const handleReset = () => {
    form.resetFields();
    navigate('/pages');
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
      <Form form={form} layout="vertical" onFinish={handleSearch}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item label="Tìm theo tiêu đề" name="title">
              <Input placeholder="Tìm kiếm theo tiêu đề..." />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Tìm theo slug" name="slug">
              <Input placeholder="Tìm kiếm theo slug..." />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Trang cha" name="parentId">
              <Select placeholder="Chọn trang cha" allowClear>
                <Option value="">Tất cả</Option>
                <Option value="null">Trang gốc</Option>
                {parentPages.map((page) => (
                  <Option key={page.id} value={page.id}>
                    {page.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item label="Trạng thái" name="isActive">
              <Select placeholder="Chọn trạng thái" allowClear>
                <Option value="">Tất cả</Option>
                <Option value="true">Hiển thị</Option>
                <Option value="false">Ẩn</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24} className="text-right">
            <Space>
              <Button onClick={handleReset}>Đặt lại</Button>
              <Button type="primary" htmlType="submit">
                Tìm kiếm
              </Button>
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default TableFilter;
