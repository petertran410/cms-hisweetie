import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import {
  useQueryProductsList,
  useQueryCategoriesDebug,
  useQuerySearchDebug,
  useQueryAllTargetProducts
} from '@/services/products.service';
import { TableStyle } from '@/styles/table.style';
import { formatCurrency, useGetParamsURL, useParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Button, Card, Collapse, Alert, Space, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaCheck, FaBug, FaEye, FaEyeSlash } from 'react-icons/fa6';
import Action from './action';
import TableFilter from './filter';
import ImportProduct from './import-product';

const { Panel } = Collapse;

const ProductsList = () => {
  const { data: dataQuery = [], isLoading, error } = useQueryProductsList();
  const { data: debugData, isLoading: debugLoading } = useQueryCategoriesDebug();
  const { data: allTargetData, isLoading: allTargetLoading } = useQueryAllTargetProducts();
  const paramsURL = useGetParamsURL();
  const { setParamsURL } = useParamsURL();
  const { page = 1, categoryNames } = paramsURL || {};
  const queryClient = useQueryClient();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Automatically apply category filter for "Trà Phượng Hoàng" and "Lermao" on first load
  useEffect(() => {
    if (!categoryNames) {
      // Set default categories to show only "Trà Phượng Hoàng" and "Lermao"
      setParamsURL({ categoryNames: 'Lermao' });
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
      render: (type) => (
        <Tag color="green" className="font-medium">
          {type || 'Chưa có loại'}
        </Tag>
      ),
      width: 150
    },
    {
      title: 'Danh mục',
      dataIndex: 'ofCategories',
      render: (ofCategories) => {
        if (Array.isArray(ofCategories) && ofCategories.length > 0) {
          return (
            <div className="flex flex-col gap-1">
              {ofCategories.map((category) => (
                <Tag key={category.id} color="blue">
                  {category.name}
                </Tag>
              ))}
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

  const { content = [], totalElements } = dataQuery || {};

  // Function to clear category filter
  const clearCategoryFilter = () => {
    setParamsURL({ categoryNames: '' });
  };

  // Function to show all products
  const showAllProducts = () => {
    setParamsURL({ categoryNames: undefined });
  };

  // Get unique types from current products
  const getUniqueTypes = (products) => {
    const types = products.map((p) => p.type).filter((type) => type);
    return [...new Set(types)].sort();
  };

  const currentTypes = getUniqueTypes(content);
  const allTargetTypes = allTargetData?.content ? getUniqueTypes(allTargetData.content) : [];

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách sản phẩm | {WEBSITE_NAME}</title>
      </Helmet>

      {/* Debug Information Panel */}
      <Card className="mb-4" size="small">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              icon={showDebugInfo ? <FaEyeSlash /> : <FaBug />}
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              type={showDebugInfo ? 'default' : 'primary'}
              size="small"
            >
              {showDebugInfo ? 'Ẩn thông tin debug' : 'Hiện thông tin debug'}
            </Button>

            <Space>
              <Statistic title="Hiện tại" value={content.length} prefix="📦" valueStyle={{ fontSize: '16px' }} />
              <Statistic title="Tổng cộng" value={totalElements} prefix="📊" valueStyle={{ fontSize: '16px' }} />
              {allTargetData?.totalElements && (
                <Statistic
                  title="Tất cả Target"
                  value={allTargetData.totalElements}
                  prefix="🎯"
                  valueStyle={{ fontSize: '16px' }}
                />
              )}
            </Space>
          </div>
        </div>

        {showDebugInfo && (
          <Collapse className="mt-4" size="small">
            <Panel header="🔍 Thông tin Debug" key="1">
              {debugLoading ? (
                <div>Đang tải thông tin debug...</div>
              ) : debugData ? (
                <div className="space-y-4">
                  <Alert
                    message="Tóm tắt Database"
                    description={
                      <div>
                        <p>
                          <strong>Tổng số categories:</strong> {debugData.summary?.totalCategories}
                        </p>
                        <p>
                          <strong>Tổng số products:</strong> {debugData.summary?.totalProducts}
                        </p>
                        <p>
                          <strong>Target categories tìm thấy:</strong> {debugData.summary?.targetCategoriesFound}
                        </p>
                        <p>
                          <strong>Products trong target categories:</strong>{' '}
                          {debugData.summary?.productsInTargetCategories}
                        </p>
                        <p>
                          <strong>Số loại sản phẩm:</strong> {debugData.summary?.totalProductTypes}
                        </p>
                      </div>
                    }
                    type="info"
                    showIcon
                  />

                  <div>
                    <h4>🏷️ Target Categories:</h4>
                    {debugData.targetCategories?.map((cat) => (
                      <Tag key={cat.id} color="blue" className="mb-1">
                        {cat.name} ({cat.productCount} products)
                      </Tag>
                    ))}
                  </div>

                  <div>
                    <h4>📋 Loại sản phẩm trong Target Categories:</h4>
                    {debugData.productTypesInTargetCategories &&
                      Object.entries(debugData.productTypesInTargetCategories).map(([type, info]) => (
                        <div key={type} className="mb-2">
                          <Tag color="green" className="mb-1">
                            {type}: {info.count} sản phẩm
                          </Tag>
                          <div className="text-xs text-gray-600 ml-2">Categories: {info.categories.join(', ')}</div>
                        </div>
                      ))}
                  </div>

                  <div>
                    <h4>🔄 So sánh Types:</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Types hiện tại ({currentTypes.length}):</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentTypes.map((type) => (
                            <Tag key={type} size="small" color="orange">
                              {type}
                            </Tag>
                          ))}
                        </div>
                      </div>
                      <div>
                        <strong>All Target Types ({allTargetTypes.length}):</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {allTargetTypes.map((type) => (
                            <Tag key={type} size="small" color="purple">
                              {type}
                            </Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>Không thể tải thông tin debug</div>
              )}
            </Panel>
          </Collapse>
        )}
      </Card>

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

        {/* Show current types */}
        {currentTypes.length > 0 && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">Loại sản phẩm hiện tại: </span>
            {currentTypes.map((type) => (
              <Tag key={type} size="small" color="green" className="mb-1">
                {type}
              </Tag>
            ))}
          </div>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 1200 }}
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
