import { useQueryCategoryList } from '@/services/category.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Tag, Select, Button, Table, Pagination, Spin } from 'antd';
import { Helmet } from 'react-helmet';
import Action from './action';
import { Link, useNavigate } from 'react-router-dom';

const CategoryList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQueryCategoryList();
  const { content, totalElements, totalPages, number: currentPage } = data || {};

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      width: 300,
      render: (name, record) => {
        const categoryName = name || 'Chưa có tên';
        const indent = '  '.repeat(record.level || 0);

        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-800">
              {indent}
              {categoryName}
              {record.hasChildren && (
                <Tag color="blue" size="small" className="ml-2">
                  Có danh mục con
                </Tag>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parent_id',
      width: 150,
      render: (parentId, record) => {
        if (parentId) {
          return (
            <Tooltip title={`ID danh mục cha: ${parentId}`}>
              <Tag color="orange">ID: {parentId}</Tag>
            </Tooltip>
          );
        } else {
          return <Tag color="blue">Danh mục gốc</Tag>;
        }
      }
    },
    {
      title: 'Thứ tự',
      dataIndex: 'priority',
      width: 100,
      align: 'center',
      render: (priority) => <Tag color="purple">{priority ?? 0}</Tag>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'status',
      width: 120,
      align: 'left',
      render: (text) => <div className="text-gray-600 text-sm line-clamp-2 max-w-xs">{text || 'Chưa có mô tả'}</div>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record) => <Action item={record} />
    }
  ];

  return (
    <div>
      <Helmet>
        <title>Danh sách danh mục | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
        <Link to="/categories/create">
          <Button type="primary" size="large">
            Tạo danh mục
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
              navigate(`/categories?${searchParams.toString()}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CategoryList;
