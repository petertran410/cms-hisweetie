import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton } from '@/components/table';
import { useQueryCategoryList } from '@/services/category.service';
import { TableStyle } from '@/styles/table.style';
import { useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table } from 'antd';
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text) => <p className="font-semibold">{text}</p>
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      render: (name, record) => (
        <div className="flex items-center gap-3">
          {Array.isArray(record?.imagesUrl) && (
            <img src={record.imagesUrl[0]} className="w-16 h-14 object-cover rounded-md" />
          )}
          <p className="font-semibold">{name}</p>
        </div>
      )
    },
    {
      title: 'Danh mục cha',
      dataIndex: 'parentName',
      render: (text, record) => <p className="font-semibold">{text}</p>
    },
    {
      title: 'Thứ tự hiển thị',
      dataIndex: 'priority',
      render: (priority) => <p>{Number(priority) + 1}</p>
    },
    {
      title: 'Hành động',
      render: (_, record) => <Action item={record} />
    }
  ];

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ['GET_CATEGORY_DETAIL'] });
    };
  }, [queryClient]);

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  const dataTransform = data?.map((i) => {
    const { children, ...rest } = i;
    return rest;
  });

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách danh mục | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-end mb-5 gap-4">
        <Link to={`/categories/sort`}>
          <div className="h-10 px-4 rounded-md flex items-center justify-center bg-[#bb6423] hover:bg-[#c77637] duration-200">
            <GoSortAsc color="#FFF" size={20} />
            <p className="text-white ml-1.5">Sắp xếp</p>
          </div>
        </Link>

        <CreateButton route="/categories/create" />
      </div>
      {/* <TableFilter /> */}
      <Table columns={columns} dataSource={dataTransform} loading={isLoading} pagination={false} rowKey="id" />
      {/* <div className="flex justify-end mt-10">
        <Pagination defaultPage={Number(page)} totalItems={30} />
      </div> */}
    </TableStyle>
  );
};

export default CategoryList;
