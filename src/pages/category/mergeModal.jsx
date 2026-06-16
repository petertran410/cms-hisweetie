import { Modal, Button, Select, Alert } from 'antd';
import { useState, useEffect } from 'react';
import { API } from '../../utils/API';

// Gộp danh mục nguồn vào danh mục đích: chuyển sản phẩm + danh mục con + ẩn nguồn + tạo redirect.
const MergeModal = ({ visible, onCancel, onConfirm, category, loading = false }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchCategories();
      setSelectedCategoryId(null);
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

      // Loại danh mục hiện tại + danh mục con cháu của nó (không cho gộp vào chính nhánh con).
      const descendantIds = new Set();
      const collect = (parentId) => {
        categories.forEach((c) => {
          if (c.parent_id === parentId && !descendantIds.has(c.id)) {
            descendantIds.add(c.id);
            collect(c.id);
          }
        });
      };
      collect(category?.id);

      const filtered = categories.filter((cat) => cat.id !== category?.id && !descendantIds.has(cat.id));

      setCategoryOptions(
        filtered.map((cat) => ({
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

  return (
    <Modal
      title="Gộp danh mục vào danh mục khác"
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
          onClick={() => onConfirm(selectedCategoryId)}
          disabled={!selectedCategoryId}
          loading={loading}
        >
          Gộp danh mục
        </Button>
      ]}
    >
      <div className="space-y-4">
        <Alert
          type="info"
          message="Sau khi gộp"
          description={
            <ul className="list-disc pl-4 text-sm">
              <li>Toàn bộ sản phẩm và danh mục con sẽ chuyển sang danh mục đích.</li>
              <li>Danh mục này sẽ bị ẩn (không hiển thị trên website).</li>
              <li>Tự động tạo redirect: link cũ → link mới (kèm con cháu).</li>
            </ul>
          }
        />

        <p>
          <strong>Danh mục nguồn:</strong> "{category?.name}" ({category?.productCount || 0} sản phẩm)
        </p>

        <div>
          <label className="block mb-2 font-medium">Chọn danh mục đích:</label>
          <Select
            value={selectedCategoryId}
            onChange={setSelectedCategoryId}
            placeholder="Chọn danh mục đích"
            className="w-full"
            loading={loadingCategories}
            options={categoryOptions}
            showSearch
            optionFilterProp="label"
          />
        </div>
      </div>
    </Modal>
  );
};

export default MergeModal;
