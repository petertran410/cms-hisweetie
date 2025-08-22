import { Modal, Button, Typography, Divider, Select } from 'antd';
import { useState, useEffect } from 'react';
import { API } from '../../utils/API';

const ReassignModal = ({ visible, onCancel, onConfirm, category, loading = false }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [hasUserMadeChoice, setHasUserMadeChoice] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
    }
  }, [visible]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await API.request({
        url: '/api/category/for-cms',
        method: 'GET'
      });

      const categories = response?.data || [];

      // Filter out current category
      const filteredCategories = categories.filter((cat) => cat.id !== category?.id);

      setCategoryOptions(
        filteredCategories.map((cat) => ({
          label: cat.displayName || cat.name,
          value: cat.id
        }))
      );
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryChange = (value) => {
    console.log('Category changed:', value); // ✅ DEBUG LOG
    setSelectedCategoryId(value);
    setHasUserMadeChoice(true);
  };

  const handleConfirm = () => {
    console.log('Confirming with category:', selectedCategoryId); // ✅ DEBUG LOG
    onConfirm(selectedCategoryId);
  };

  const handleCancel = () => {
    setSelectedCategoryId(null);
    setHasUserMadeChoice(false);
    onCancel();
  };

  return (
    <Modal
      title="Chuyển sản phẩm trước khi xóa"
      open={visible}
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Hủy
        </Button>,
        <Button
          key="confirm"
          type="primary"
          danger
          onClick={handleConfirm}
          disabled={!hasUserMadeChoice}
          loading={loading}
        >
          Chuyển sản phẩm và Xóa danh mục
        </Button>
      ]}
    >
      <div className="space-y-4">
        <p>
          <strong>Danh mục:</strong> "{category?.name}" ({category?.productCount} sản phẩm)
        </p>

        <div>
          <label className="block mb-2 font-medium">Chọn danh mục đích:</label>
          <Select
            value={selectedCategoryId}
            onChange={handleCategoryChange}
            allowClear
            placeholder="Chọn danh mục (hoặc để trống = không phân loại)"
            className="w-full"
            loading={loadingCategories}
            options={categoryOptions}
          />
        </div>

        {hasUserMadeChoice && (
          <div className="bg-blue-50 p-3 rounded">
            <strong>Lựa chọn:</strong>{' '}
            {selectedCategoryId ? `Chuyển sang danh mục được chọn` : `Chuyển về "Không phân loại"`}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReassignModal;
