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

  const { pageNumber = 0, pageSize = 10 } = dataQuery || {};

  console.log(dataQuery);

  const { data = [], totalElements = 0 } = dataQuery || {};

  const columns = [
    {
      title: 'ID',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span className="text-gray-600">{pageNumber * pageSize + index + 1}</span>
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      width: 250,
      render: (record) => {
        const name = record.name || 'Chưa có tên';
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-800 line-clamp-2">{name}</div>
          </div>
        );
      }
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parent_id',
      width: 180,
      render: (record) => {
        const parentName = record.parent_id;
        if (parentName) {
          return (
            <div>
              <Tag color="orange">{parentName}</Tag>
            </div>
          );
        } else if (parentName === null) {
          return (
            <div>
              <Tag color="blue">Không có Parent</Tag>
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
      render: (priority) => <Tag color="purple">{priority || 0}</Tag>
    },
    // {
    //   title: 'Số sản phẩm',
    //   dataIndex: 'productCount',
    //   width: 120,
    //   align: 'center',
    //   render: (count) => <Tag color={count > 0 ? 'green' : 'default'}>{count || 0} sản phẩm</Tag>
    // },
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

  if (error) {
    return (
      <ErrorScreen
        title="Lỗi tải danh sách danh mục"
        description={error.message || 'Có lỗi xảy ra khi tải dữ liệu'}
        actionText="Tải lại"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>Danh sách danh mục | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý danh mục</h1>
          </div>
          <Space className="flex justify-end mb-5 gap-4">
            <Link to="/categories/sort">
              <div className="h-10 px-4 rounded-md flex items-center justify-center bg-[#bb6423] hover:bg-[#c77637] duration-200">
                <GoSortAsc color="#FFF" size={20} />
                <p className="text-white ml-1.5">Sắp xếp</p>
              </div>
            </Link>
            <CreateButton route="/categories/" />
          </Space>
        </div>
      </div>

      <TableStyle>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 1000 }}
          size="middle"
          bordered
          className="shadow-sm"
        />
      </TableStyle>

      <div className="flex justify-end">
        <Pagination defaultPage={Number(page)} totalItems={totalElements} />
      </div>
    </>
  );
};

export default CategoryList;
