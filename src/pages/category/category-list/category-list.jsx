import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryCategoryList, useRefreshCategoryList } from '@/services/category.service';
import { TableStyle } from '@/styles/table.style';
import { useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Table, Tag, Empty, Button, Space, Tooltip } from 'antd';
import { Helmet } from 'react-helmet';
import { GoSortAsc } from 'react-icons/go';
import { FaPlus, FaDatabase } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Action from './action';
import { useEffect } from 'react';

const CategoryList = () => {
  const { data: dataQuery = {}, isLoading, error } = useQueryCategoryList();
  const refreshCategories = useRefreshCategoryList();
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};

  useEffect(() => {
    console.log('Page changed to:', page);
    refreshCategories();
  }, [page, refreshCategories]);

  const { pageNumber = 0, pageSize = 10 } = dataQuery || {};
  const { content = [], totalElements = 0 } = dataQuery || {};

  console.log('CategoryList dataQuery:', dataQuery);

  if (error) {
    return (
      <div className="text-center py-20">
        <ErrorScreen message={error?.message || 'Có lỗi xảy ra khi tải danh mục'} />
        <Button type="primary" onClick={() => window.location.reload()} className="mt-4">
          Thử lại
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!content || content.length === 0) {
    return (
      <div className="text-center py-20">
        <Helmet>
          <title>Danh sách danh mục | {WEBSITE_NAME}</title>
        </Helmet>
      </div>
    );
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span className="text-gray-600 font-medium">{pageNumber * pageSize + index + 1}</span>
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
            {record.description && <div className="text-sm text-gray-500 line-clamp-2">{record.description}</div>}
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
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      width: 120,
      align: 'center',
      render: (productCount, record) => {
        const count = productCount ?? 0;
        return (
          <Tooltip title={count > 0 ? `${count} sản phẩm` : 'Chưa có sản phẩm'}>
            <Tag color={count > 0 ? 'green' : 'default'}>{count}</Tag>
          </Tooltip>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const hasProducts = record.hasProducts || record.productCount > 0;
        const hasChildren = record.hasChildren;

        if (hasProducts && hasChildren) {
          return <Tag color="green">Đầy đủ</Tag>;
        } else if (hasProducts) {
          return <Tag color="blue">Có SP</Tag>;
        } else if (hasChildren) {
          return <Tag color="orange">Có con</Tag>;
        } else {
          return <Tag color="default">Trống</Tag>;
        }
      }
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
    <TableStyle>
      <Helmet>
        <title>Danh sách danh mục | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Quản lý danh mục</h2>
          <p className="text-gray-500 text-sm mt-1">
            Tổng cộng: <span className="font-medium">{totalElements}</span> danh mục
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 1000 }}
        size="middle"
        bordered
        locale={{
          emptyText: <Empty description="Không có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }}
        rowClassName={(record, index) => (index % 2 === 0 ? 'bg-gray-50' : 'bg-white')}
      />

      {totalElements > pageSize && (
        <div className="flex justify-end mt-6">
          <Pagination defaultPage={Number(page)} totalItems={totalElements} pageSize={pageSize} />
        </div>
      )}
    </TableStyle>
  );
};

export default CategoryList;
