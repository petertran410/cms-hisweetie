import { useDeleteCategory, useReassignProducts } from '@/services/category.service';
import { Button, Space, Modal, message } from 'antd';
import { memo, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReassignModal from '../reassignModal';

const Action = ({ item }) => {
  const navigate = useNavigate();
  const { mutate: deleteMutate, isPending: deleteLoading } = useDeleteCategory();
  const { mutate: reassignMutate, isPending: reassignLoading } = useReassignProducts();

  const [showReassignModal, setShowReassignModal] = useState(false);

  const handleReassignAndDelete = async (targetCategoryId) => {
    try {
      await new Promise((resolve, reject) => {
        reassignMutate(
          {
            fromCategoryId: item.id,
            toCategoryId: targetCategoryId
          },
          {
            onSuccess: () => resolve(),
            onError: reject
          }
        );
      });

      deleteMutate({ id: item.id });
      setShowReassignModal(false);
    } catch (error) {
      message.error('Không thể chuyển sản phẩm. Vui lòng thử lại.');
    }
  };

  const handleDelete = () => {
    if (item.productCount > 0) {
      setShowReassignModal(true);
    } else {
      Modal.confirm({
        title: `Xóa danh mục "${item.name}"?`,
        content: 'Hành động này không thể hoàn tác.',
        okText: 'Xóa',
        okType: 'danger',
        cancelText: 'Hủy',
        onOk: () => deleteMutate({ id: item.id })
      });
    }
  };

  return (
    <>
      <Space size="small">
        <Button
          type="link"
          icon={<FaEdit />}
          onClick={() => navigate(`/categories/${item.id}/edit`)}
          title="Chỉnh sửa"
        />
        <Button
          type="link"
          danger
          icon={<FaTrash />}
          onClick={handleDelete}
          title={item.productCount > 0 ? 'Chuyển sản phẩm và xóa' : 'Xóa'}
          loading={deleteLoading}
        />
      </Space>

      <ReassignModal
        visible={showReassignModal}
        onCancel={() => setShowReassignModal(false)}
        onConfirm={handleReassignAndDelete}
        category={item}
        loading={reassignLoading}
      />
    </>
  );
};

export default memo(Action);
