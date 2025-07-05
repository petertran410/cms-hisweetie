// src/pages/pages/pages-list/pages-list.jsx - FIXED
import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryPagesList } from '@/services/pages.service';
import { TableStyle } from '@/styles/table.style';
import { useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Table, Tag, Button, Space } from 'antd';
import { Helmet } from 'react-helmet';
import { FaEdit, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Action from './action';
import TableFilter from './filter';

const PagesList = () => {
  const { data: dataQuery = [], isLoading, error } = useQueryPagesList();
  const navigate = useNavigate();
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};

  const { content = [], totalElements = 0 } = dataQuery || {};

  // Xử lý khi có lỗi
  if (error) {
    return <ErrorScreen />;
  }

  // Định nghĩa columns cho table
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center'
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-800">{text}</div>
          <div className="text-sm text-gray-500">/{record.slug}</div>
        </div>
      )
    },
    {
      title: 'Trang cha',
      dataIndex: 'parent',
      key: 'parent',
      width: 150,
      render: (parent) => (parent ? <Tag color="blue">{parent.title}</Tag> : <Tag color="green">Trang gốc</Tag>)
    },
    {
      title: 'Thứ tự',
      dataIndex: 'display_order',
      key: 'display_order',
      width: 100,
      align: 'center',
      render: (order) => <Tag color="purple">{order || 0}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      align: 'center',
      render: (isActive) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Hiển thị' : 'Ẩn'}</Tag>
    },
    {
      title: 'Loại trang',
      dataIndex: 'is_main_page',
      key: 'is_main_page',
      width: 120,
      align: 'center',
      render: (isMainPage) => (
        <Tag color={isMainPage ? 'gold' : 'default'}>{isMainPage ? 'Trang chính' : 'Trang con'}</Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_date',
      key: 'created_date',
      width: 140,
      render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : '-')
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (text, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<FaEye />}
            onClick={() => navigate(`/pages/${record.id}/detail`)}
            title="Xem chi tiết"
          />
          <Button
            type="link"
            icon={<FaEdit />}
            onClick={() => navigate(`/pages/${record.id}/edit`)}
            title="Chỉnh sửa"
          />
          <Action item={record} />
        </Space>
      )
    }
  ];

  return (
    <>
      <Helmet>
        <title>Quản lý trang - {WEBSITE_NAME}</title>
      </Helmet>

      <div className="space-y-4">
        {/* Header với nút tạo mới */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý trang</h1>
          <CreateButton route="pages" />
        </div>

        {/* Bộ lọc */}
        <TableFilter />

        {/* Bảng dữ liệu */}
        <TableStyle>
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
        </TableStyle>

        {/* Phân trang */}
        <div className="flex justify-end mt-4">
          <Pagination
            current={Number(page)}
            total={totalElements}
            pageSize={10}
            showSizeChanger={false}
            onChange={(newPage) => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set('page', newPage.toString());
              navigate(`/pages?${searchParams.toString()}`);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PagesList;
