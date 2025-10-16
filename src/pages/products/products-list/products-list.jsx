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
import {
  FaCheck,
  FaSync,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTools,
  FaEye,
  FaEyeSlash,
  FaTag
} from 'react-icons/fa';
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

  const handleVisibilityToggle = async (productId, currentVisibility, productTitle) => {
    try {
      setTogglingIds((prev) => new Set([...prev, productId]));

      await toggleVisibility(
        { productId },
        {
          onSuccess: () => {
            message.success(
              <span>
                <FaCheck className="inline mr-1" />
                {`Sản phẩm ${productTitle} đã được ${!currentVisibility ? 'hiển thị' : 'ẩn'}`}
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
      title: 'Code',
      key: 'code',
      width: 120,
      align: 'center',
      render: (record) => {
        const code = record.kiotviet_code;
        return code ? <span className="font-medium">{code}</span> : <span className="text-sm">Chưa có code</span>;
      }
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'imagesUrl',
      key: 'image',
      width: 80,
      align: 'center',
      render: (imagesUrl, record) => {
        let imageUrl = null;

        // Ưu tiên images_url, không thì lấy kiotviet_images[0]
        if (Array.isArray(imagesUrl) && imagesUrl.length > 0) {
          imageUrl = imagesUrl[0];
        } else if (Array.isArray(record.kiotviet_images) && record.kiotviet_images.length > 0) {
          imageUrl = record.kiotviet_images[0];
        }

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
        let name;
        if (record.title === null) {
          name = record.kiotviet_name;
        } else {
          name = record.title;
        }
        const isFromKiotViet = record.isFromKiotViet;

        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-800 line-clamp-2">{name}</div>
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
      dataIndex: 'category',
      key: 'categories',
      width: 180,
      render: (category, record) => {
        if (category && category.name) {
          return (
            <Tag color="green" className="text-xs">
              <FaTag className="inline mr-1" />
              {category.name}
            </Tag>
          );
        }

        const kiotVietCategory = record.kiotViet?.category?.name;
        if (kiotVietCategory) {
          return (
            <Tag color="orange" className="text-xs">
              <FaSync className="inline mr-1" />
              {kiotVietCategory}
            </Tag>
          );
        }

        return (
          <Tag color="default" className="text-xs">
            Chưa phân loại
          </Tag>
        );
      }
    },
    {
      title: 'Giá',
      key: 'price',
      width: 120,
      align: 'right',
      render: (record) => {
        const price = record.kiotviet_price;
        return price ? (
          <span className="font-medium text-green-600">{formatCurrency(price)}</span>
        ) : (
          <span className="text-gray-500 text-sm">Chưa có giá</span>
        );
      }
    },
    {
      title: 'Hiển thị',
      key: 'visibility',
      width: 100,
      align: 'right',
      render: (record) => {
        const isVisible = record.is_visible === true;
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
              onChange={() => handleVisibilityToggle(record.id, isVisible, record.kiotviet_name)}
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
