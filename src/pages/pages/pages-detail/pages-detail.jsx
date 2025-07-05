// src/pages/pages/pages-detail/pages-detail.jsx
import { ErrorScreen } from '@/components/effect-screen';
import { useQueryPagesDetail } from '@/services/pages.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Card, Descriptions, Tag, Button, Space, Divider, Typography, Alert } from 'antd';
import { Helmet } from 'react-helmet';
import { FaEdit, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const PagesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: pageData, isLoading, error } = useQueryPagesDetail(id);

  if (error) {
    return <ErrorScreen />;
  }

  if (!pageData && !isLoading) {
    return (
      <div className="text-center py-8">
        <Title level={4}>Không tìm thấy trang</Title>
        <Button onClick={() => navigate('/pages')}>Quay lại danh sách</Button>
      </div>
    );
  }

  const {
    title,
    slug,
    content,
    meta_title,
    meta_description,
    display_order,
    is_active,
    is_main_page,
    parent,
    children = [],
    created_date,
    updated_date
  } = pageData || {};

  // URL của trang trên client
  const clientUrl = is_main_page
    ? `${process.env.REACT_APP_CLIENT_URL}/${slug}`
    : `${process.env.REACT_APP_CLIENT_URL}/chinh-sach-diep-tra/${slug}`;

  return (
    <>
      <Helmet>
        <title>
          Chi tiết trang: {title} - {WEBSITE_NAME}
        </title>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button icon={<FaArrowLeft />} onClick={() => navigate('/pages')}>
              Quay lại
            </Button>
            <Title level={2} className="mb-0">
              {title}
            </Title>
          </div>

          <Space>
            <Button type="default" icon={<FaExternalLinkAlt />} onClick={() => window.open(clientUrl, '_blank')}>
              Xem trên website
            </Button>
            <Button type="primary" icon={<FaEdit />} onClick={() => navigate(`/pages/${id}/edit`)}>
              Chỉnh sửa
            </Button>
          </Space>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thông tin chính */}
          <div className="lg:col-span-2 space-y-6">
            {/* Thông tin cơ bản */}
            <Card title="Thông tin cơ bản" loading={isLoading}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Tiêu đề">{title}</Descriptions.Item>
                <Descriptions.Item label="Slug">
                  <code className="bg-gray-100 px-2 py-1 rounded">/{slug}</code>
                </Descriptions.Item>
                <Descriptions.Item label="URL">
                  <a href={clientUrl} target="_blank" rel="noopener noreferrer">
                    {clientUrl}
                  </a>
                </Descriptions.Item>
                <Descriptions.Item label="Trang cha">
                  {parent ? <Tag color="blue">{parent.title}</Tag> : <Tag color="green">Trang gốc</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Thứ tự hiển thị">
                  <Tag color="purple">{display_order || 0}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={is_active ? 'green' : 'red'}>{is_active ? 'Hiển thị' : 'Ẩn'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Loại trang">
                  <Tag color={is_main_page ? 'gold' : 'default'}>{is_main_page ? 'Trang chính' : 'Trang con'}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* SEO */}
            <Card title="Thông tin SEO" loading={isLoading}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Meta Title">
                  {meta_title || <span className="text-gray-400">Chưa có</span>}
                </Descriptions.Item>
                <Descriptions.Item label="Meta Description">
                  {meta_description ? (
                    <Paragraph ellipsis={{ rows: 2, expandable: true }}>{meta_description}</Paragraph>
                  ) : (
                    <span className="text-gray-400">Chưa có</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Nội dung */}
            <Card title="Nội dung trang" loading={isLoading}>
              {content ? (
                <div className="space-y-4">
                  <Alert
                    message="Preview nội dung"
                    description="Đây là preview của nội dung HTML. Nội dung thực tế có thể hiển thị khác trên website."
                    type="info"
                  />
                  <div className="prose max-w-none p-4 border rounded" dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">Chưa có nội dung</div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thông tin thời gian */}
            <Card title="Thông tin thời gian" size="small" loading={isLoading}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Ngày tạo">
                  {created_date ? new Date(created_date).toLocaleString('vi-VN') : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lần cuối">
                  {updated_date ? new Date(updated_date).toLocaleString('vi-VN') : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Trang con */}
            <Card title={`Trang con (${children.length})`} size="small" loading={isLoading}>
              {children.length > 0 ? (
                <div className="space-y-2">
                  {children.map((child) => (
                    <div key={child.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium text-sm">{child.title}</div>
                        <div className="text-xs text-gray-500">/{child.slug}</div>
                      </div>
                      <div className="flex space-x-1">
                        <Tag color={child.is_active ? 'green' : 'red'} size="small">
                          {child.is_active ? 'Hiển thị' : 'Ẩn'}
                        </Tag>
                        <Button size="small" type="link" onClick={() => navigate(`/pages/${child.id}/detail`)}>
                          Xem
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400 text-sm">Không có trang con</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default PagesDetail;
