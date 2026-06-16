import { useDeleteCategory, useReassignProducts, useMergeCategory } from '@/services/category.service';
import { Button, Space, Modal, message } from 'antd';
import { memo, useState } from 'react';
import { FaEdit, FaTrash, FaCodeBranch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ReassignModal from '../reassignModal';
import MergeModal from '../mergeModal';

const Action = ({ item }) => {
  const navigate = useNavigate();
  const { mutate: deleteMutate, isPending: deleteLoading } = useDeleteCategory();
  const { mutate: reassignMutate, isPending: reassignLoading } = useReassignProducts();
  const { mutate: mergeMutate, isPending: mergeLoading } = useMergeCategory();

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);

  const handleMerge = (targetCategoryId) => {
    mergeMutate(
      { fromCategoryId: item.id, toCategoryId: targetCategoryId },
      { onSuccess: () => setShowMergeModal(false) }
    );
  };

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
          icon={<FaCodeBranch />}
          onClick={() => setShowMergeModal(true)}
          title="Gộp vào danh mục khác"
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

      <MergeModal
        visible={showMergeModal}
        onCancel={() => setShowMergeModal(false)}
        onConfirm={handleMerge}
        category={item}
        loading={mergeLoading}
      />
    </>
  );
};

export default memo(Action);
