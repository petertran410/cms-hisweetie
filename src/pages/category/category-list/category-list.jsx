// src/pages/category/category-list/category-list.jsx - Thay thế hoàn toàn
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { CreateButton } from '@/components/table';
import { useQueryCategoryList } from '@/services/category.service';
import { TableStyle } from '@/styles/table.style';
import { useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Empty } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { GoSortAsc } from 'react-icons/go';
import { Link } from 'react-router-dom';
import Action from './action';

const CategoryList = () => {
  const { data, isLoading, error } = useQueryCategoryList();
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};
  const queryClient = useQueryClient();

  const { content = [], totalElements = 0 } = data || {};

  // ✅ Helper function để tìm tên danh mục cha
  const getParentName = (parentId, categories) => {
    if (!parentId) return null;
    const parent = categories.find((cat) => cat.id === parentId);
    return parent?.name || 'Không tìm thấy';
  };

  // ✅ Columns definition cho bảng danh mục
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      align: 'center',
      render: (text) => <p className="font-semibold">{text}</p>
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      width: 300,
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-semibold text-gray-800">{name}</p>
            {record.description && <p className="text-sm text-gray-500 mt-1">{record.description}</p>}
          </div>
        </div>
      )
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parent_id',
      width: 200,
      render: (parentId, record) => {
        if (!parentId) {
          return <Tag color="blue">Danh mục gốc</Tag>;
        }

        const parentName = getParentName(parentId, content);
        return (
          <div>
            <Tag color="orange">{parentName}</Tag>
          </div>
        );
      }
    },
    {
      title: 'Thứ tự',
      dataIndex: 'priority',
      width: 120,
      align: 'center',
      render: (priority) => <Tag color="purple">{priority || 0}</Tag>
    },
    {
      title: 'Số sản phẩm',
      dataIndex: 'productCount',
      width: 120,
      align: 'center',
      render: (count) => <Tag color={count > 0 ? 'green' : 'default'}>{count || 0} sản phẩm</Tag>
    },
    {
      title: 'Hành động',
      width: 150,
      fixed: 'right',
      render: (_, record) => <Action item={record} />
    }
  ];

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ['GET_CATEGORY_DETAIL'] });
    };
  }, [queryClient]);

  // ✅ Loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // ✅ Error state
  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách danh mục | {WEBSITE_NAME}</title>
      </Helmet>

      {/* ✅ Action buttons */}
      <div className="flex justify-end mb-5 gap-4">
        <Link to="/categories/sort">
          <div className="h-10 px-4 rounded-md flex items-center justify-center bg-[#bb6423] hover:bg-[#c77637] duration-200">
            <GoSortAsc color="#FFF" size={20} />
            <p className="text-white ml-1.5">Sắp xếp</p>
          </div>
        </Link>

        <CreateButton route="/categories/create" />
      </div>

      {/* ✅ Table danh mục */}
      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading}
        pagination={{
          current: Number(page),
          pageSize: 10,
          total: totalElements,
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} danh mục`,
          onChange: (pageNumber) => {
            window.location.href = `/categories?page=${pageNumber}`;
          }
        }}
        rowKey="id"
        locale={{
          emptyText: <Empty description="Chưa có danh mục nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }}
        scroll={{ x: 1000 }}
      />
    </TableStyle>
  );
};

export default CategoryList;
