// ✅ TẠO FILE MỚI: src/components/category/ReassignModal.jsx
import { Modal, Select, Button, Typography, Divider } from 'antd';
import { FormSelectQuery } from '@/components/form';
import { useState } from 'react';

const { Text, Title } = Typography;

const ReassignModal = ({ visible, onCancel, onConfirm, category, loading = false }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const handleConfirm = () => {
    if (selectedCategoryId) {
      onConfirm(selectedCategoryId);
    }
  };

  return (
    <Modal
      title={
        <div>
          <Title level={4}>Chuyển sản phẩm trước khi xóa</Title>
          <Text type="secondary">
            Danh mục "{category?.name}" có {category?.productCount} sản phẩm
          </Text>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          onClick={handleConfirm}
          disabled={!selectedCategoryId}
          loading={loading}
        >
          Chuyển sản phẩm và Xóa danh mục
        </Button>
      ]}
    >
      <Divider />

      <div className="space-y-4">
        <div>
          <Text strong>Chọn danh mục đích:</Text>
          <p className="text-sm text-gray-500 mt-1">
            Tất cả {category?.productCount} sản phẩm sẽ được chuyển sang danh mục này
          </p>
        </div>

        <FormSelectQuery
          value={selectedCategoryId}
          onChange={setSelectedCategoryId}
          allowClear
          labelKey="displayName"
          valueKey="id"
          placeholder="Chọn danh mục đích (hoặc để trống = không phân loại)"
          request={{
            url: '/api/category/for-cms'
          }}
          filterOption={(inputValue, option) => {
            // Loại bỏ category hiện tại khỏi danh sách
            return option.id !== category?.id;
          }}
        />

        <div className="bg-orange-50 p-3 rounded border border-orange-200">
          <Text type="warning" className="text-sm">
            ⚠️ <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Danh mục sẽ bị xóa vĩnh viễn sau khi chuyển sản
            phẩm.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ReassignModal;
