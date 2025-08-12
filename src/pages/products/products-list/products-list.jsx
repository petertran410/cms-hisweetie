import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import {
  useQueryProductsList,
  useSyncProducts,
  useQuerySyncStatus,
  useToggleProductVisibility
} from '@/services/products.service';
import { TableStyle } from '@/styles/table.style';
import { formatCurrency, useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table, Tag, Button, Card, Statistic, Space, Tooltip, Alert, Switch, message } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaCheck, FaSync, FaInfoCircle, FaExclamationTriangle, FaTools, FaEye, FaEyeSlash } from 'react-icons/fa';
import Action from './action';
import TableFilter from './filter';
import ImportProduct from './import-product';

const ProductsList = () => {
  const { data: dataQuery = {}, isLoading, error } = useQueryProductsList();
  const { data: syncStatus } = useQuerySyncStatus();
  const { mutate: syncProducts, isPending: isSyncing } = useSyncProducts();
  const { mutate: toggleVisibility, isPending: isToggling } = useToggleProductVisibility();
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};
  const queryClient = useQueryClient();
  const [togglingIds, setTogglingIds] = useState(new Set());

  const { content = [], totalElements = 0, statistics = {}, pageNumber = 0, pageSize = 10 } = dataQuery || {};

  console.log('🔧 CMS Data Debug:', {
    totalData: dataQuery,
    contentLength: content?.length,
    totalElements,
    statistics
  });

  const renderCategoryTags = (ofCategories) => {
    if (!Array.isArray(ofCategories) || ofCategories.length === 0) {
      return <Tag color="default">Chưa phân loại</Tag>;
    }

    const categoryMapping = {
      'nguyen-lieu-pha-che-lermao': 'Nguyên liệu Lermao',
      'tra-phuong-hoang': 'Trà Phượng Hoàng',
      'may-moc-thiet-bi': 'Máy móc thiết bị'
    };

    return ofCategories.slice(0, 2).map((category, index) => (
      <Tag key={index} color="blue" className="text-xs mb-1">
        {categoryMapping[category] || category}
      </Tag>
    ));
  };

  const handleVisibilityToggle = async (productId, currentVisibility, productTitle) => {
    try {
      setTogglingIds((prev) => new Set([...prev, productId]));

      await toggleVisibility(
        { productId },
        {
          onSuccess: (response) => {
            message.success(
              <span>
                <FaCheck className="inline mr-1" />
                {response.message || `Sản phẩm "${productTitle}" đã được ${!currentVisibility ? 'hiển thị' : 'ẩn'}`}
              </span>
            );
            queryClient.invalidateQueries(['GET_PRODUCTS_LIST']);
          },
          onError: (error) => {
            message.error(
              <span>
                <FaExclamationTriangle className="inline mr-1" />
                {error.message || 'Có lỗi xảy ra khi cập nhật trạng thái hiển thị'}
              </span>
            );
          },
          onSettled: () => {
            setTogglingIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
          }
        }
      );
    } catch (error) {
      console.error('Toggle visibility error:', error);
      setTogglingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span className="text-gray-600">{pageNumber * pageSize + index + 1}</span>
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imagesUrl',
      key: 'image',
      width: 80,
      align: 'center',
      render: (imagesUrl, record) => {
        const imageUrl = Array.isArray(imagesUrl) && imagesUrl.length > 0 ? imagesUrl[0] : null;

        return imageUrl ? (
          <img
            src={imageUrl}
            alt={record.title || 'Product'}
            className="w-12 h-12 object-cover rounded border"
            onError={(e) => {
              e.target.src = '/images/product-placeholder.webp';
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
            <FaTools className="text-gray-400 text-xs" />
          </div>
        );
      }
    },
    {
      title: 'Tên sản phẩm',
      key: 'title',
      width: 250,
      render: (record) => {
        const title = record.title || record.kiotViet?.name || 'Chưa có tên';
        const isFromKiotViet = record.isFromKiotViet;

        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-800 line-clamp-2">{title}</div>
            <div className="flex gap-1">
              {isFromKiotViet && (
                <Tag color="orange" className="text-xs">
                  <FaSync className="inline mr-1" />
                  KiotViet
                </Tag>
              )}
              {record.isFeatured && (
                <Tag color="gold" className="text-xs">
                  <FaCheck className="inline mr-1" />
                  Nổi bật
                </Tag>
              )}
              <Tag color={record.isVisible ? 'green' : 'red'} className="text-xs">
                {record.isVisible ? 'Hiển thị' : 'Ẩn'}
              </Tag>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Danh mục',
      dataIndex: 'ofCategories',
      key: 'categories',
      width: 180,
      render: renderCategoryTags
    },
    {
      title: 'Giá',
      key: 'price',
      width: 120,
      align: 'right',
      render: (record) => {
        const price = record.kiotViet?.price;
        return price ? (
          <span className="font-medium text-green-600">{formatCurrency(price)}</span>
        ) : (
          <span className="text-gray-500 text-sm">Chưa có giá</span>
        );
      }
    },
    {
      title: (
        <div className="flex items-center gap-1">
          <FaEye className="text-gray-500" />
          <span>Hiển thị</span>
        </div>
      ),
      key: 'visibility',
      width: 100,
      align: 'center',
      render: (record) => {
        const isVisible = record.isVisible === true;
        const isCurrentlyToggling = togglingIds.has(record.id);

        return (
          <Tooltip title={isVisible ? 'Ẩn khỏi trang web' : 'Hiển thị trên trang web'}>
            <Switch
              checked={isVisible}
              loading={isCurrentlyToggling}
              disabled={isCurrentlyToggling}
              size="small"
              checkedChildren={<FaEye />}
              unCheckedChildren={<FaEyeSlash />}
              onChange={() => handleVisibilityToggle(record.id, isVisible, record.title)}
            />
          </Tooltip>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (record) => <Action item={record} />
    }
  ];

  const renderSyncStatus = () => {
    if (!syncStatus) return null;

    const { lastSync, totalProducts, summary } = syncStatus;
    const lastSyncDate = lastSync ? new Date(lastSync).toLocaleString('vi-VN') : 'Chưa đồng bộ';

    return (
      <Alert
        type="info"
        showIcon
        icon={<FaInfoCircle />}
        message="Trạng thái đồng bộ KiotViet"
        description={
          <div className="space-y-2">
            <div>Lần cuối: {lastSyncDate}</div>
            <div className="flex gap-4 text-sm">
              <span>Tổng: {totalProducts}</span>
              <span>Đã đồng bộ: {summary?.synced || 0}</span>
              <span>Lỗi: {summary?.failed || 0}</span>
            </div>
          </div>
        }
        action={
          <Button type="primary" size="small" loading={isSyncing} onClick={() => syncProducts()} icon={<FaSync />}>
            Đồng bộ ngay
          </Button>
        }
        className="mb-4"
      />
    );
  };

  const renderStatistics = () => {
    const { total = totalElements || 0, visible = 0, hidden = 0, featured = 0 } = statistics;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card size="small">
          <Statistic title="Tổng sản phẩm" value={total} prefix={<FaTools className="text-blue-500" />} />
        </Card>
        <Card size="small">
          <Statistic
            title="Đang hiển thị"
            value={visible}
            prefix={<FaEye className="text-green-500" />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Đang ẩn"
            value={hidden}
            prefix={<FaEyeSlash className="text-red-500" />}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Card>
        <Card size="small">
          <Statistic
            title="Sản phẩm nổi bật"
            value={featured}
            prefix={<FaCheck className="text-gold-500" />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </div>
    );
  };

  if (error) {
    return (
      <ErrorScreen
        title="Lỗi tải danh sách sản phẩm"
        description={error.message || 'Có lỗi xảy ra khi tải dữ liệu'}
        actionText="Tải lại"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <>
      <Helmet>
        <title>Quản lý sản phẩm - {WEBSITE_NAME}</title>
      </Helmet>

      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
            <p className="text-gray-600 mt-1">
              Quản lý tất cả sản phẩm và trạng thái hiển thị trên website ({totalElements} sản phẩm)
            </p>
          </div>
          <Space>
            <ImportProduct />
            <CreateButton route="products" />
          </Space>
        </div>

        {renderSyncStatus()}

        {renderStatistics()}

        <TableFilter />

        <TableStyle>
          <Table
            columns={columns}
            dataSource={content}
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
      </div>
    </>
  );
};

export default ProductsList;
