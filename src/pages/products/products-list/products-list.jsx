import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryProductsList } from '@/services/products.service';
import { TableStyle } from '@/styles/table.style';
import { formatCurrency, useGetParamsURL, useParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Button } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FaCheck } from 'react-icons/fa6';
import Action from './action';
import TableFilter from './filter';
import ImportProduct from './import-product';

const ProductsList = () => {
  const { data: dataQuery = [], isLoading, error } = useQueryProductsList();
  const paramsURL = useGetParamsURL();
  const { setParamsURL } = useParamsURL();
  const { page = 1, categoryNames } = paramsURL || {};
  const queryClient = useQueryClient();

  // Automatically apply category filter for "Trà Phượng Hoàng" and "Lermao" on first load
  useEffect(() => {
    if (!categoryNames) {
      // Set default categories to show only "Trà Phượng Hoàng" and "Lermao"
      setParamsURL({ categoryNames: 'Trà Phượng Hoàng,Lermao' });
    }
  }, [categoryNames, setParamsURL]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text) => <p className="font-semibold">{text}</p>
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
      render: (text, record) => {
        return (
          <div className="flex items-center gap-3">
            {Array.isArray(record?.imagesUrl) && record.imagesUrl.length > 0 && (
              <img src={record.imagesUrl[0]} className="w-16 h-14 object-cover rounded-md" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{text}</p>
              {record.ofCategories && record.ofCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {record.ofCategories.map((category) => (
                    <Tag key={category.id} size="small" color="blue">
                      {category.name}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Danh mục',
      dataIndex: 'ofCategories',
      render: (ofCategories) => {
        if (Array.isArray(ofCategories) && ofCategories.length > 0) {
          return (
            <div className="flex flex-col gap-1">
              {ofCategories.map((category) => (
                <Tag key={category.id} color="green">
                  {category.name}
                </Tag>
              ))}
            </div>
          );
        }
        return <Tag color="default">Chưa phân loại</Tag>;
      }
    },
    {
      title: 'Giá sản phẩm',
      dataIndex: 'price',
      render: (price) => {
        if (!price) {
          return <span className="text-gray-400">Chưa có giá</span>;
        }
        return <span className="font-semibold text-green-600">{formatCurrency(price)}</span>;
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      render: (quantity) => (
        <div>
          <p className="font-semibold">{quantity}</p>
          {Number(quantity) === 0 && <Tag color="red">Hết hàng</Tag>}
          {Number(quantity) < 10 && Number(quantity) > 0 && <Tag color="orange">Sắp hết</Tag>}
          {Number(quantity) >= 10 && <Tag color="green">Còn hàng</Tag>}
        </div>
      )
    },
    {
      title: 'SP nổi bật',
      dataIndex: 'isFeatured',
      render: (isFeatured) => {
        if (isFeatured) {
          return <FaCheck color="green" size={18} />;
        }
        return null;
      }
    },
    {
      title: 'Hành động',
      render: (_, record) => <Action item={record} />
    }
  ];

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ['GET_PRODUCTS_DETAIL'] });
    };
  }, [queryClient]);

  const { content = [], totalElements } = dataQuery || {};

  // Function to clear category filter
  const clearCategoryFilter = () => {
    setParamsURL({ categoryNames: '' });
  };

  // Function to show all products
  const showAllProducts = () => {
    setParamsURL({ categoryNames: undefined });
  };

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách sản phẩm | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-2">
          {categoryNames && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Đang lọc theo:</span>
              <Tag color="blue">{categoryNames.replace(',', ', ')}</Tag>
              <Button size="small" onClick={clearCategoryFilter}>
                Xóa bộ lọc
              </Button>
            </div>
          )}
          {!categoryNames && (
            <Button size="small" onClick={() => setParamsURL({ categoryNames: 'Trà Phượng Hoàng,Lermao' })}>
              Chỉ hiện Trà Phượng Hoàng & Lermao
            </Button>
          )}
        </div>
        <div className="flex gap-5">
          <ImportProduct />
          <CreateButton route="/products/create" />
        </div>
      </div>

      <TableFilter />

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Tìm thấy <span className="font-semibold">{totalElements}</span> sản phẩm
          {categoryNames && (
            <span>
              {' '}
              trong danh mục: <span className="font-semibold">{categoryNames.replace(',', ', ')}</span>
            </span>
          )}
        </p>
      </div>

      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        locale={{
          emptyText: categoryNames
            ? `Không tìm thấy sản phẩm nào trong danh mục: ${categoryNames.replace(',', ', ')}`
            : 'Không có sản phẩm nào'
        }}
      />
      <div className="flex justify-end mt-10">
        <Pagination defaultPage={Number(page)} totalItems={totalElements} />
      </div>
    </TableStyle>
  );
};

export default ProductsList;
