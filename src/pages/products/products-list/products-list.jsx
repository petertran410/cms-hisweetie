// src/pages/products/products-list/products-list.jsx
import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryProductsList } from '@/services/products.service';
import { TableStyle } from '@/styles/table.style';
import { formatCurrency, useGetParamsURL, useParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Button, Card, Select, Space, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaCheck } from 'react-icons/fa6';
import Action from './action';
import TableFilter from './filter';
import ImportProduct from './import-product';

const ProductsList = () => {
  const { data: dataQuery = [], isLoading, error } = useQueryProductsList();
  const paramsURL = useGetParamsURL();
  const { setParamsURL } = useParamsURL();
  const { page = 1, categoryNames, productTypes } = paramsURL || {};
  const queryClient = useQueryClient();

  // Target categories and types
  const TARGET_CATEGORIES = ['Trà Phượng Hoàng', 'Lermao'];
  const TARGET_PRODUCT_TYPES = [
    'Bột',
    'hàng sãn xuất',
    'Mứt Sốt',
    'Siro',
    'Topping',
    'Khác (Lermao)',
    'Khác (Trà Phượng Hoàng)'
  ];

  // Apply default filters on first load
  useEffect(() => {
    if (!categoryNames) {
      setParamsURL({
        categoryNames: TARGET_CATEGORIES.join(','),
        productTypes: TARGET_PRODUCT_TYPES.join(',')
      });
    }
  }, [categoryNames, setParamsURL]);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text) => <p className="font-semibold">{text}</p>,
      width: 80
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
      title: 'Loại sản phẩm',
      dataIndex: 'type',
      render: (type) => {
        const isTargetType = TARGET_PRODUCT_TYPES.includes(type);
        return (
          <Tag color={isTargetType ? 'green' : 'default'} className="font-medium">
            {type || 'Chưa có loại'}
          </Tag>
        );
      },
      width: 150
    },
    {
      title: 'Danh mục',
      dataIndex: 'ofCategories',
      render: (ofCategories) => {
        if (Array.isArray(ofCategories) && ofCategories.length > 0) {
          return (
            <div className="flex flex-col gap-1">
              {ofCategories.map((category) => {
                const isTargetCategory = TARGET_CATEGORIES.includes(category.name);
                return (
                  <Tag key={category.id} color={isTargetCategory ? 'blue' : 'default'}>
                    {category.name}
                  </Tag>
                );
              })}
            </div>
          );
        }
        return <Tag color="default">Chưa phân loại</Tag>;
      },
      width: 150
    },
    {
      title: 'Giá sản phẩm',
      dataIndex: 'price',
      render: (price) => {
        if (!price) {
          return <span className="text-gray-400">Chưa có giá</span>;
        }
        return <span className="font-semibold text-green-600">{formatCurrency(price)}</span>;
      },
      width: 130
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
      ),
      width: 100
    },
    {
      title: 'SP nổi bật',
      dataIndex: 'isFeatured',
      render: (isFeatured) => {
        if (isFeatured) {
          return <FaCheck color="green" size={18} />;
        }
        return null;
      },
      width: 100
    },
    {
      title: 'Hành động',
      render: (_, record) => <Action item={record} />,
      width: 120
    }
  ];

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ['GET_PRODUCTS_DETAIL'] });
    };
  }, [queryClient]);

  const { content = [], totalElements, availableTypes = [] } = dataQuery || {};

  // Filter management functions
  const handleCategoryChange = (selectedCategories) => {
    setParamsURL({
      categoryNames: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
      page: 1
    });
  };

  const handleProductTypeChange = (selectedTypes) => {
    setParamsURL({
      productTypes: selectedTypes.length > 0 ? selectedTypes.join(',') : undefined,
      page: 1
    });
  };

  const resetToTargetFilters = () => {
    setParamsURL({
      categoryNames: TARGET_CATEGORIES.join(','),
      productTypes: TARGET_PRODUCT_TYPES.join(','),
      page: 1
    });
  };

  const clearAllFilters = () => {
    setParamsURL({
      categoryNames: undefined,
      productTypes: undefined,
      page: 1
    });
  };

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  const currentCategories = categoryNames ? categoryNames.split(',') : [];
  const currentProductTypes = productTypes ? productTypes.split(',') : [];

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách sản phẩm | {WEBSITE_NAME}</title>
      </Helmet>

      {/* Quick Actions */}
      <Card className="mb-4" size="small">
        <div className="flex justify-between items-center">
          <Space>
            <Statistic title="Sản phẩm hiện tại" value={content.length} prefix="📦" valueStyle={{ fontSize: '16px' }} />
            <Statistic title="Tổng cộng" value={totalElements} prefix="📊" valueStyle={{ fontSize: '16px' }} />
          </Space>

          <Space>
            <Button onClick={resetToTargetFilters} type="primary">
              Hiện sản phẩm mục tiêu
            </Button>
            <Button onClick={clearAllFilters}>Xóa tất cả bộ lọc</Button>
          </Space>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2">Danh mục:</label>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn danh mục"
              value={currentCategories}
              onChange={handleCategoryChange}
              options={TARGET_CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Loại sản phẩm:</label>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn loại sản phẩm"
              value={currentProductTypes}
              onChange={handleProductTypeChange}
              options={[
                ...TARGET_PRODUCT_TYPES.map((type) => ({ label: type, value: type })),
                ...availableTypes
                  .filter((type) => !TARGET_PRODUCT_TYPES.includes(type))
                  .map((type) => ({ label: type, value: type }))
              ]}
            />
          </div>
        </div>

        {/* Current Filters Display */}
        {(currentCategories.length > 0 || currentProductTypes.length > 0) && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="text-sm font-medium mb-2">Bộ lọc hiện tại:</div>
            {currentCategories.length > 0 && (
              <div className="mb-2">
                <span className="text-sm text-gray-600">Danh mục: </span>
                {currentCategories.map((cat) => (
                  <Tag key={cat} color="blue" className="mb-1">
                    {cat}
                  </Tag>
                ))}
              </div>
            )}
            {currentProductTypes.length > 0 && (
              <div>
                <span className="text-sm text-gray-600">Loại sản phẩm: </span>
                {currentProductTypes.map((type) => (
                  <Tag key={type} color="green" className="mb-1">
                    {type}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="flex justify-between items-center mb-5">
        <div>
          <p className="text-sm text-gray-600">
            Tìm thấy <span className="font-semibold">{totalElements}</span> sản phẩm
          </p>
        </div>
        <div className="flex gap-5">
          <ImportProduct />
          <CreateButton route="/products/create" />
        </div>
      </div>

      <TableFilter />

      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 1200 }}
        locale={{
          emptyText: 'Không tìm thấy sản phẩm nào với bộ lọc hiện tại'
        }}
      />

      <div className="flex justify-end mt-10">
        <Pagination defaultPage={Number(page)} totalItems={totalElements} />
      </div>
    </TableStyle>
  );
};

export default ProductsList;
