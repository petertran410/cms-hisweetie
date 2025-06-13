import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Tag,
  Button,
  Card,
  Space,
  Tooltip,
  Switch,
  Modal,
  message,
  Dropdown,
  Checkbox,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  StarOutlined,
  MoreOutlined,
  BulkOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryProductsList, useToggleProductVisibility, useBulkToggleVisibility } from '@/services/products.service';
import { TableStyle } from '@/styles/table.style';
import { formatCurrency, useGetParamsURL } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import Action from './action';
import TableFilter from './filter';

const ProductsList = () => {
  const { data: dataQuery = [], isLoading, error } = useQueryProductsList();
  const { mutate: toggleVisibility, isPending: togglingVisibility } = useToggleProductVisibility();
  const { mutate: bulkToggleVisibility, isPending: bulkToggling } = useBulkToggleVisibility();
  const paramsURL = useGetParamsURL();
  const { page = 1 } = paramsURL || {};
  const queryClient = useQueryClient();

  // Bulk selection state
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [bulkAction, setBulkAction] = useState('');

  const { content: dataSource = [], totalElements, pageable } = dataQuery || {};

  // Handle single product visibility toggle
  const handleToggleVisibility = (record) => {
    const action = record.isVisible ? 'ẩn' : 'hiển thị';
    Modal.confirm({
      title: `Xác nhận ${action} sản phẩm`,
      content: `Bạn có chắc chắn muốn ${action} sản phẩm "${record.title}" không?`,
      onOk: () => {
        toggleVisibility(record.id, {
          onSuccess: (data) => {
            message.success(data.message || `Đã ${action} sản phẩm thành công`);
            queryClient.invalidateQueries(['GET_PRODUCTS_LIST']);
          },
          onError: (error) => {
            message.error('Thao tác thất bại: ' + error.message);
          }
        });
      }
    });
  };

  // Handle bulk operations
  const handleBulkOperation = (action) => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }
    setBulkAction(action);
    setBulkModalVisible(true);
  };

  const confirmBulkOperation = () => {
    const isVisible = bulkAction === 'show';
    const actionText = isVisible ? 'hiển thị' : 'ẩn';

    bulkToggleVisibility(
      { productIds: selectedRowKeys.map((id) => parseInt(id)), isVisible },
      {
        onSuccess: (data) => {
          message.success(`Đã ${actionText} ${data.summary?.successful || selectedRowKeys.length} sản phẩm thành công`);
          if (data.summary?.failed > 0) {
            message.warning(`${data.summary.failed} sản phẩm thao tác thất bại`);
          }
          setSelectedRowKeys([]);
          setBulkModalVisible(false);
          queryClient.invalidateQueries(['GET_PRODUCTS_LIST']);
        },
        onError: (error) => {
          message.error('Thao tác hàng loạt thất bại: ' + error.message);
          setBulkModalVisible(false);
        }
      }
    );
  };

  // Calculate statistics
  const stats = {
    total: dataSource.length,
    visible: dataSource.filter((item) => item.isVisible).length,
    hidden: dataSource.filter((item) => !item.isVisible).length,
    featured: dataSource.filter((item) => item.isFeatured).length
  };

  // Enhanced category display function
  const renderCategoryTags = (ofCategories) => {
    if (!Array.isArray(ofCategories) || ofCategories.length === 0) {
      return <Tag color="default">Chưa phân loại</Tag>;
    }

    const categoryMapping = {
      Lermao: 'red',
      'Trà Phượng Hoàng': 'blue',
      Mứt: 'orange',
      Trà: 'green'
    };

    return ofCategories.map((category) => {
      const color = Object.keys(categoryMapping).find((key) => category.name?.includes(key));
      return (
        <Tag key={category.id} color={categoryMapping[color] || 'default'}>
          {category.name}
        </Tag>
      );
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => parseInt(a.id) - parseInt(b.id)
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {record.imagesUrl && record.imagesUrl.length > 0 ? (
              <img src={record.imagesUrl[0]} alt={record.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-xs">No Image</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{record.title}</p>
            <p className="text-xs text-gray-500 truncate">{record.generalDescription}</p>
          </div>
        </div>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'ofCategories',
      key: 'categories',
      width: 200,
      render: renderCategoryTags
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) => (
        <span className="font-medium text-green-600">{price ? formatCurrency(price) : 'Chưa có giá'}</span>
      ),
      sorter: (a, b) => (a.price || 0) - (b.price || 0)
    },
    {
      title: 'Kho',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity) => <span className={quantity > 0 ? 'text-green-600' : 'text-red-500'}>{quantity || 0}</span>,
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0)
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 150,
      render: (_, record) => (
        <div className="space-y-1">
          {/* Visibility Status */}
          <div className="flex items-center space-x-2">
            {record.isVisible ? (
              <Tag color="green" className="flex items-center">
                <EyeOutlined className="mr-1" />
                Đang hiển thị
              </Tag>
            ) : (
              <Tag color="red" className="flex items-center">
                <EyeInvisibleOutlined className="mr-1" />
                Đã ẩn
              </Tag>
            )}
          </div>

          {/* Featured Status */}
          {record.isFeatured && (
            <Tag color="gold" className="flex items-center">
              <StarOutlined className="mr-1" />
              Nổi bật
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Hiển thị',
      key: 'visibility_toggle',
      width: 100,
      render: (_, record) => (
        <Tooltip title={record.isVisible ? 'Click để ẩn sản phẩm' : 'Click để hiển thị sản phẩm'}>
          <Switch
            checked={record.isVisible}
            loading={togglingVisibility}
            onChange={() => handleToggleVisibility(record)}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
          />
        </Tooltip>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Action record={record} />
          <Dropdown
            menu={{
              items: [
                {
                  key: 'toggle',
                  label: record.isVisible ? 'Ẩn sản phẩm' : 'Hiển thị sản phẩm',
                  icon: record.isVisible ? <EyeInvisibleOutlined /> : <EyeOutlined />,
                  onClick: () => handleToggleVisibility(record)
                }
              ]
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
      {
        key: 'visible',
        text: 'Chọn sản phẩm đang hiển thị',
        onSelect: (changeableRowKeys) => {
          setSelectedRowKeys(
            changeableRowKeys.filter((key) => {
              const record = dataSource.find((item) => item.id === key);
              return record?.isVisible;
            })
          );
        }
      },
      {
        key: 'hidden',
        text: 'Chọn sản phẩm đã ẩn',
        onSelect: (changeableRowKeys) => {
          setSelectedRowKeys(
            changeableRowKeys.filter((key) => {
              const record = dataSource.find((item) => item.id === key);
              return !record?.isVisible;
            })
          );
        }
      }
    ]
  };

  if (error) {
    return <ErrorScreen />;
  }

  return (
    <div className="p-6">
      <Helmet>
        <title>Quản lý sản phẩm | {WEBSITE_NAME}</title>
      </Helmet>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic title="Tổng sản phẩm" value={stats.total} prefix={<BulkOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang hiển thị"
              value={stats.visible}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã ẩn"
              value={stats.hidden}
              prefix={<CloseCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Nổi bật"
              value={stats.featured}
              prefix={<StarOutlined className="text-amber-500" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <CreateButton route="/products/create" />

          {/* Bulk Actions */}
          <Dropdown
            menu={{
              items: [
                {
                  key: 'show',
                  label: 'Hiển thị các sản phẩm đã chọn',
                  icon: <EyeOutlined />,
                  onClick: () => handleBulkOperation('show'),
                  disabled: selectedRowKeys.length === 0
                },
                {
                  key: 'hide',
                  label: 'Ẩn các sản phẩm đã chọn',
                  icon: <EyeInvisibleOutlined />,
                  onClick: () => handleBulkOperation('hide'),
                  disabled: selectedRowKeys.length === 0
                }
              ]
            }}
            disabled={selectedRowKeys.length === 0}
          >
            <Button icon={<BulkOutlined />} loading={bulkToggling}>
              Thao tác hàng loạt ({selectedRowKeys.length})
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Search Filter */}
      <TableFilter />

      {/* Products Table */}
      <Table
        {...TableStyle}
        columns={columns}
        dataSource={dataSource}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        rowSelection={rowSelection}
        scroll={{ x: 1400 }}
        locale={{
          emptyText: 'Không có sản phẩm nào'
        }}
      />

      {/* Pagination */}
      <Pagination
        current={page}
        total={totalElements}
        pageSize={pageable?.pageSize || 10}
        showSizeChanger
        showQuickJumper
        showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} sản phẩm`}
      />

      {/* Bulk Action Confirmation Modal */}
      <Modal
        title="Xác nhận thao tác hàng loạt"
        open={bulkModalVisible}
        onOk={confirmBulkOperation}
        onCancel={() => setBulkModalVisible(false)}
        confirmLoading={bulkToggling}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          Bạn có chắc chắn muốn {bulkAction === 'show' ? 'hiển thị' : 'ẩn'} <strong>{selectedRowKeys.length}</strong>{' '}
          sản phẩm đã chọn không?
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Thao tác này sẽ {bulkAction === 'show' ? 'hiển thị' : 'ẩn'} tất cả sản phẩm đã chọn
          {bulkAction === 'show' ? ' trên website chính' : ' khỏi website chính'}.
        </p>
      </Modal>
    </div>
  );
};

export default ProductsList;
