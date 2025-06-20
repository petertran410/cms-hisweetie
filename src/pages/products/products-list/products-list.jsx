// Updated src/pages/products/products-list/products-list.jsx

import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryProductsList, useSyncProducts, useQuerySyncStatus } from '@/services/products.service';
import { TableStyle } from '@/styles/table.style';
import { formatCurrency, useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Button, Card, Statistic, Space, Tooltip, Alert } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FaCheck, FaSync, FaInfoCircle, FaExclamationTriangle, FaTools } from 'react-icons/fa';
import Action from './action';
import TableFilter from './filter';
import ImportProduct from './import-product';

const ProductsList = () => {
  const { data: dataQuery = [], isLoading, error } = useQueryProductsList();
  const { data: syncStatus } = useQuerySyncStatus();
  const { mutate: syncProducts, isPending: isSyncing } = useSyncProducts();
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};
  const queryClient = useQueryClient();

  // Enhanced category display function
  const renderCategoryTags = (ofCategories) => {
    if (!Array.isArray(ofCategories) || ofCategories.length === 0) {
      return <Tag color="default">Chưa phân loại</Tag>;
    }

    // Define category mapping for better display
    const categoryMapping = {
      // Lermao subcategories
      Bột: { color: 'blue', parent: 'Lermao' },
      Topping: { color: 'green', parent: 'Lermao' },
      'Mứt Sốt': { color: 'orange', parent: 'Lermao' },
      Siro: { color: 'purple', parent: 'Lermao' },
      'hàng sản xuất': { color: 'cyan', parent: 'Lermao' },

      // Trà Phượng Hoàng subcategories
      OEM: { color: 'magenta', parent: 'Trà Phượng Hoàng' },
      SHANCHA: { color: 'red', parent: 'Trà Phượng Hoàng' }
    };

    return (
      <div className="flex flex-wrap gap-1">
        {ofCategories.map((category, index) => {
          const categoryName = category.name || category.displayName;
          const mapping = categoryMapping[categoryName] || { color: 'default', parent: 'Unknown' };

          return (
            <Tooltip key={index} title={`${categoryName} (thuộc ${mapping.parent})`}>
              <Tag color={mapping.color} className="mb-1 cursor-help">
                {categoryName}
                <span className="text-xs opacity-75 ml-1">({mapping.parent})</span>
              </Tag>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      render: (text) => <p className="font-semibold">{text}</p>
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'title',
      render: (text, record) => {
        return (
          <div className="flex items-center gap-3">
            {Array.isArray(record?.imagesUrl) && record.imagesUrl.length > 0 && (
              <img
                src={record.imagesUrl[0]}
                className="w-16 h-14 object-cover rounded-md"
                alt={text}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div>
              <p className="font-semibold">{text}</p>
              {record.generalDescription && (
                <p className="text-sm text-gray-500 truncate max-w-xs">{record.generalDescription}</p>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Danh mục con',
      dataIndex: 'ofCategories',
      width: 200,
      render: renderCategoryTags
    },
    {
      title: 'Giá sản phẩm',
      dataIndex: 'price',
      width: 120,
      render: (price) => {
        if (!price || price === 0) {
          return <Tag color="orange">Liên hệ</Tag>;
        }
        return (
          <div>
            <p className="font-semibold text-green-600">{formatCurrency(price)}</p>
          </div>
        );
      }
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      width: 100,
      render: (quantity) => (
        <div>
          <p className="font-semibold">{quantity || 0}</p>
          {Number(quantity) === 0 && <Tag color="red">Hết hàng</Tag>}
          {Number(quantity) < 10 && Number(quantity) > 0 && <Tag color="orange">Sắp hết</Tag>}
          {Number(quantity) >= 10 && <Tag color="green">Còn hàng</Tag>}
        </div>
      )
    },
    {
      title: 'SP nổi bật',
      dataIndex: 'isFeatured',
      width: 100,
      render: (isFeatured) => {
        if (isFeatured) {
          return (
            <Tooltip title="Sản phẩm nổi bật">
              <FaCheck color="green" size={18} />
            </Tooltip>
          );
        }
        return null;
      }
    },
    {
      title: 'Hành động',
      width: 120,
      render: (_, record) => <Action item={record} />
    }
  ];

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ['GET_PRODUCTS_DETAIL'] });
    };
  }, [queryClient]);

  const { content = [], totalElements, categoryInfo } = dataQuery || {};

  const handleSync = () => {
    syncProducts({
      // You can add sync parameters here if needed
    });
  };

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  // Check if we have products but they might be in parent categories
  const hasParentCategoryIssue = categoryInfo?.productsInParentCategories > 0 && totalElements === 0;

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách sản phẩm - Danh mục con Lermao & Trà Phượng Hoàng | {WEBSITE_NAME}</title>
      </Helmet>

      {/* Category Assignment Issue Alert */}
      {hasParentCategoryIssue && (
        <Alert
          message="Phát hiện vấn đề phân loại sản phẩm"
          description={
            <div>
              <p>
                Có {categoryInfo.productsInParentCategories} sản phẩm được gán vào danh mục cha thay vì danh mục con cụ
                thể.
              </p>
              <p className="mt-2">
                <strong>Giải pháp:</strong> Liên hệ quản trị viên để chạy API sửa lỗi phân loại sản phẩm.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                API: <code>POST /api/product/fix/category-assignments</code>
              </p>
            </div>
          }
          type="warning"
          icon={<FaExclamationTriangle />}
          showIcon
          className="mb-6"
        />
      )}

      {/* Sync Status Card */}
      {syncStatus && (
        <Card className="mb-6" size="small">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Statistic title="Tổng sản phẩm" value={syncStatus.totalProducts || 0} prefix={<FaInfoCircle />} />
              <Statistic
                title="Trạng thái KiotViet"
                value={syncStatus.kiotVietConfigured ? 'Đã kết nối' : 'Chưa kết nối'}
                valueStyle={{
                  color: syncStatus.kiotVietConfigured ? '#52c41a' : '#ff4d4f',
                  fontSize: '14px'
                }}
              />
            </div>
            <Button
              type="primary"
              icon={<FaSync />}
              loading={isSyncing}
              onClick={handleSync}
              disabled={!syncStatus.kiotVietConfigured}
            >
              {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ từ KiotViet'}
            </Button>
          </div>
          {syncStatus.message && <p className="text-sm text-gray-600 mt-2">{syncStatus.message}</p>}
        </Card>
      )}

      {/* Enhanced Category Info */}
      <Card className="mb-6" size="small">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">Hiển thị sản phẩm từ danh mục con:</span>
            <div className="flex gap-2">
              <Tag color="blue">Lermao</Tag>
              <Tag color="magenta">Trà Phượng Hoàng</Tag>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium text-blue-600">Danh mục con Lermao:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Tag size="small" color="blue">
                    Bột
                  </Tag>
                  <Tag size="small" color="green">
                    Topping
                  </Tag>
                  <Tag size="small" color="orange">
                    Mứt Sốt
                  </Tag>
                  <Tag size="small" color="purple">
                    Siro
                  </Tag>
                  <Tag size="small" color="cyan">
                    hàng sản xuất
                  </Tag>
                </div>
              </div>
              <div>
                <span className="font-medium text-magenta-600">Danh mục con Trà Phượng Hoàng:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  <Tag size="small" color="magenta">
                    OEM
                  </Tag>
                  <Tag size="small" color="red">
                    SHANCHA
                  </Tag>
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <div className="flex items-start">
                <FaInfoCircle className="text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <p className="font-medium text-yellow-800">Lưu ý quan trọng:</p>
                  <p className="text-sm text-yellow-700">
                    Chỉ hiển thị sản phẩm được phân vào <strong>danh mục con cụ thể</strong>. Sản phẩm được gán trực
                    tiếp vào danh mục cha sẽ không hiển thị.
                  </p>
                </div>
              </div>
            </div>
            {categoryInfo && (
              <p className="mt-2">
                Tìm kiếm trong <strong>{categoryInfo.totalCategoriesSearched || 0}</strong> danh mục con
                {categoryInfo.productsInSubcategories !== undefined && (
                  <span>
                    {' '}
                    • <strong>{categoryInfo.productsInSubcategories}</strong> sản phẩm trong danh mục con
                  </span>
                )}
                {categoryInfo.productsInParentCategories > 0 && (
                  <span className="text-orange-600">
                    {' '}
                    • <strong>{categoryInfo.productsInParentCategories}</strong> sản phẩm cần phân loại lại
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-5">
        <div className="flex gap-3">
          <ImportProduct />
          <CreateButton route="/products/create" />
        </div>

        <div className="text-sm text-gray-600">
          <Tooltip title="Chỉ hiển thị sản phẩm từ danh mục con, không bao gồm sản phẩm gán trực tiếp vào danh mục cha">
            <span className="cursor-help">
              Sản phẩm từ <strong>danh mục con</strong> của Lermao và Trà Phượng Hoàng ℹ️
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Search Filter */}
      <TableFilter />

      {/* Products Table */}
      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading || isSyncing}
        pagination={false}
        rowKey="id"
        scroll={{ x: 1200 }}
        locale={{
          emptyText:
            content.length === 0 && !isLoading ? (
              <div className="text-center py-8">
                {hasParentCategoryIssue ? (
                  <div>
                    <FaTools className="text-4xl text-orange-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">Sản phẩm cần được phân loại lại</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Có {categoryInfo.productsInParentCategories} sản phẩm được gán vào danh mục cha.
                    </p>
                    <p className="text-sm text-gray-500">Cần chuyển chúng vào danh mục con cụ thể để hiển thị.</p>
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <p className="text-xs text-gray-600">
                        <strong>Giải pháp kỹ thuật:</strong> Chạy API{' '}
                        <code>POST /api/product/fix/category-assignments</code>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p>Chưa có sản phẩm nào trong các danh mục con.</p>
                    <p className="text-sm text-gray-500 mt-2">Hãy thử đồng bộ từ KiotViet để lấy sản phẩm mới nhất.</p>
                    <Button
                      type="primary"
                      onClick={handleSync}
                      className="mt-3"
                      loading={isSyncing}
                      disabled={!syncStatus?.kiotVietConfigured}
                    >
                      Đồng bộ ngay
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              'Không có dữ liệu'
            )
        }}
      />

      {/* Pagination */}
      {totalElements > 0 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Tổng cộng: <strong>{totalElements}</strong> sản phẩm trong danh mục con
          </div>
          <Pagination defaultPage={Number(page)} totalItems={totalElements} />
        </div>
      )}

      {/* Loading overlay during sync */}
      {isSyncing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="text-center">
            <div className="flex items-center gap-3">
              <FaSync className="animate-spin" />
              <span>Đang đồng bộ sản phẩm từ KiotViet...</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Đang đồng bộ cả danh mục và sản phẩm. Vui lòng không đóng trang này.
            </p>
          </Card>
        </div>
      )}
    </TableStyle>
  );
};

export default ProductsList;
