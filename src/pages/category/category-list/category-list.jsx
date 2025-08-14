import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton } from '@/components/table';
import { useQueryCategoryList } from '@/services/category.service';
import { TableStyle } from '@/styles/table.style';
import { useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Pagination, Table } from 'antd';
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

  const flattenCategories = (categories) => {
    let result = [];

    const addCategory = (category, level = 0) => {
      // ✅ Create a clean object without tree properties
      result.push({
        id: category.id,
        name: '—'.repeat(level) + (level > 0 ? ' ' : '') + category.name,
        originalName: category.name, // Keep original name for reference
        level: level,
        kiotVietId: category.kiotVietId,
        rank: category.rank,
        hasChild: category.hasChild,
        createdDate: category.createdDate,
        modifiedDate: category.modifiedDate,
        syncedAt: category.syncedAt
      });

      // Add children
      if (category.children && category.children.length > 0) {
        category.children.forEach((child) => {
          addCategory(child, level + 1);
        });
      }
    };

    categories.forEach((category) => addCategory(category));
    return result;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text) => <p className="font-semibold">{text}</p>
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      render: (name, record) => {
        console.log(data);
        return (
          <div className="flex items-center gap-3">
            {Array.isArray(record?.imagesUrl) && (
              <img src={record.imagesUrl[0]} className="w-16 h-14 object-cover rounded-md" />
            )}
            <p className="font-semibold">{name}</p>
          </div>
        );
      }
    },
    // {
    //   title: 'Danh mục cha',
    //   dataIndex: 'parentName',
    //   render: (text, record) => {
    //     return <p className="font-semibold">{record.name}</p>;
    //   }
    // },
    {
      title: 'Danh mục cha',
      dataIndex: 'level',
      render: (level, record) => {
        if (level === 0) {
          return <p className="font-semibold text-blue-600">Danh mục gốc</p>;
        } else if (level === 1) {
          return <p className="font-semibold text-orange-600">Danh mục con</p>;
        } else {
          return <p className="font-semibold text-purple-600">Danh mục cháu</p>;
        }
      }
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

  // const dataTransform = content?.map((i) => {
  //   const { children, ...rest } = i;
  //   return rest;
  // });

  const dataTransform = flattenCategories(content);

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

      <Table
        columns={columns}
        dataSource={dataTransform}
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
      />

      {/* <div className="flex justify-end mt-10">
  <Pagination defaultPage={Number(page)} totalItems={totalElements} />
</div> */}
    </TableStyle>
  );
};

export default CategoryList;
