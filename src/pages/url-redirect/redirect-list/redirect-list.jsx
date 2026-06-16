import { useQueryRedirectList } from '@/services/redirect.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Tag, Button, Table, Pagination } from 'antd';
import { Helmet } from 'react-helmet';
import Action from './action';
import { Link, useNavigate } from 'react-router-dom';

const RedirectList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQueryRedirectList();
  const { content, totalElements, totalPages, number: currentPage } = data || {};

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Đường dẫn cũ (source)',
      dataIndex: 'source_path',
      width: 320,
      render: (text) => <div className="font-medium text-gray-800 break-all">{text}</div>
    },
    {
      title: 'Đường dẫn mới (target)',
      dataIndex: 'target_path',
      width: 320,
      render: (text) => <div className="text-blue-600 break-all">{text}</div>
    },
    {
      title: 'Mã',
      dataIndex: 'status_code',
      width: 90,
      align: 'center',
      render: (code) => <Tag color={code === 301 ? 'green' : 'orange'}>{code}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      width: 110,
      align: 'center',
      render: (active) => (active ? <Tag color="green">Đang bật</Tag> : <Tag color="default">Tắt</Tag>)
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      width: 160,
      render: (text) => <div className="text-gray-600 text-sm line-clamp-2">{text || '—'}</div>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => <Action item={record} />
    }
  ];

  return (
    <div>
      <Helmet>
        <title>Danh sách điều hướng URL | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý điều hướng URL (301)</h1>
        <Link to="/redirects/create">
          <Button type="primary" size="large">
            Tạo redirect
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={content}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
        />
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Pagination
            current={currentPage + 1}
            total={totalElements}
            pageSize={10}
            showSizeChanger={false}
            onChange={(newPage) => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set('page', newPage.toString());
              navigate(`/redirects?${searchParams.toString()}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RedirectList;
