import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryRecipeList } from '@/services/recipe.service';
import { TableStyle } from '@/styles/table.style';
import { useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Action from './action';
import TableFilter from './filter';

const RecipeList = () => {
  const { data: dataQuery = [], isLoading, error } = useQueryRecipeList();
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
      title: 'Tên công thức',
      dataIndex: 'title',
      render: (text, record) => {
        return (
          <div className="flex items-center gap-3">
            {Array.isArray(record?.imagesUrl) && (
              <img src={record?.recipeThumbnail || record.imagesUrl[0]} className="w-16 h-14 object-cover rounded-md" />
            )}
            <p className="font-semibold">{text}</p>
          </div>
        );
      }
    },
    // {
    //   title: 'Danh mục',
    //   dataIndex: 'ofCategories',
    //   render: (ofCategories) => {
    //     if (Array.isArray(ofCategories) && ofCategories.length > 0) {
    //       return <p>{ofCategories[0].name}</p>;
    //     }
    //     return null;
    //   }
    // },
    // {
    //   title: 'Giá công thức',
    //   dataIndex: 'price',
    //   render: (price) => formatCurrency(price)
    // },
    // {
    //   title: 'Số lượng',
    //   dataIndex: 'quantity'
    // },
    // {
    //   title: 'SP nổi bật',
    //   dataIndex: 'isFeatured',
    //   render: (isFeatured) => {
    //     if (isFeatured) {
    //       return <FaCheck color="green" size={18} />;
    //     }
    //     return null;
    //   }
    // },
    {
      title: 'Hành động',
      render: (_, record) => <Action item={record} />
    }
  ];

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ['GET_RECIPE_DETAIL'] });
    };
  }, [queryClient]);

  const { content = [], totalElements } = dataQuery || {};
  // const { totalItems, page } = pagination || {};

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách công thức | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-end mb-5">
        <CreateButton route="/recipes/create" />
      </div>
      <TableFilter />
      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        // scroll={{ x: 1500, scrollToFirstRowOnChange: true }}
      />
      <div className="flex justify-end mt-10">
        <Pagination defaultPage={Number(page)} totalItems={totalElements} />
      </div>
    </TableStyle>
  );
};

export default RecipeList;
