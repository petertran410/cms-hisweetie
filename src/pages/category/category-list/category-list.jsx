// src/pages/category/category-list/category-list.jsx - CLEAN VERSION
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryCategoryList } from '@/services/category.service';
import { TableStyle } from '@/styles/table.style';
import { useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Empty, Button, Space } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { GoSortAsc } from 'react-icons/go';
import { Link } from 'react-router-dom';
import Action from './action';

const CategoryList = () => {
  const { data: dataQuery = {}, isLoading, error } = useQueryCategoryList();
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};
  const queryClient = useQueryClient();

  console.log('CategoryList dataQuery:', dataQuery);

  // ✅ Destructure đúng theo actual API response
  const { data: allCategories = [], success = false } = dataQuery || {};

  // ✅ Tính toán pagination manually
  const pageSize = 10;
  const pageNumber = Number(page) - 1;
  const totalElements = allCategories.length;
  const startIndex = pageNumber * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageData = allCategories.slice(startIndex, endIndex);

  // ✅ Handle error state
  if (error) {
    return <ErrorScreen message={error?.message || 'Có lỗi xảy ra khi tải danh mục'} />;
  }

  // ✅ Handle loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // ✅ Handle empty state - CHỈ HIỂN THỊ BUTTON TẠO MỚI
  if (!success || !allCategories || allCategories.length === 0) {
    return (
      <div className="text-center py-20">
        <Helmet>
          <title>Danh sách danh mục | {WEBSITE_NAME}</title>
        </Helmet>

        <Empty description="Chưa có danh mục nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
          <div className="mt-4">
            <p className="text-gray-500 mb-4">Hãy tạo danh mục đầu tiên để bắt đầu!</p>
            <Link to="/categories/create">
              <Button type="primary">Tạo danh mục mới</Button>
            </Link>
          </div>
        </Empty>
      </div>
    );
  }

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span className="text-gray-600">{startIndex + index + 1}</span>
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      width: 250,
      render: (name, record, index) => {
        const categoryName = name || 'Chưa có tên';
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-800">{categoryName}</div>
            {record?.description && <div className="text-sm text-gray-500 line-clamp-1">{record.description}</div>}
          </div>
        );
      }
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parent_id',
      width: 180,
      render: (parentId, record, index) => {
        if (parentId) {
          // Tìm parent name từ allCategories
          const parentCategory = allCategories.find((cat) => cat.id === parentId);
          const parentName = parentCategory?.name || `ID: ${parentId}`;

          return (
            <div>
              <Tag color="orange">{parentName}</Tag>
            </div>
          );
        } else {
          return (
            <div>
              <Tag color="blue">Danh mục gốc</Tag>
            </div>
          );
        }
      }
    },
    {
      title: 'Thứ tự',
      dataIndex: 'priority',
      width: 120,
      align: 'center',
      render: (priority, record, index) => <Tag color="purple">{priority ?? 0}</Tag>
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      width: 100,
      align: 'center',
      render: (level, record, index) => <Tag color="cyan">Cấp {level ?? 0}</Tag>
    },
    {
      title: 'Đường dẫn',
      dataIndex: 'fullPath',
      width: 200,
      render: (fullPath, record, index) => <div className="text-sm text-gray-600">{fullPath || record.name}</div>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      align: 'center',
      render: (_, record, index) => <Action item={record} />
    }
  ];

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách danh mục | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-xl font-semibold">Danh sách danh mục</h2>
          <p className="text-gray-500 text-sm">
            Tổng cộng: {totalElements} danh mục | Trang {page} / {Math.ceil(totalElements / pageSize)}
          </p>
        </div>

        <Space>
          <Link to="/categories/sort">
            <Button icon={<GoSortAsc />}>Sắp xếp</Button>
          </Link>
          <CreateButton route="/categories/create" />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={currentPageData}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 1000 }}
        locale={{
          emptyText: <Empty description="Không có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }}
      />

      {totalElements > pageSize && (
        <div className="flex justify-end mt-10">
          <Pagination defaultPage={Number(page)} totalItems={totalElements} pageSize={pageSize} />
        </div>
      )}
    </TableStyle>
  );
};

export default CategoryList;
