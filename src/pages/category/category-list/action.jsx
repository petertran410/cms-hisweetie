import { useDeleteCategory } from '@/services/category.service';
import { Button, Space } from 'antd';
import { memo } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Action = ({ item }) => {
  const { mutate: deleteMutate } = useDeleteCategory();

  const handleDelete = () => {
    Modal.confirm({
      title: `Xóa danh mục "${item.name}"?`,
      content:
        item.productCount > 0
          ? `Danh mục này có ${item.productCount} sản phẩm. Bạn cần reassign các sản phẩm này trước khi xóa.`
          : 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        if (item.productCount === 0) {
          deleteMutate({ id: item.id });
        } else {
          message.warning('Vui lòng reassign sản phẩm trước khi xóa danh mục');
        }
      }
    });
  };

  return (
    <Space size="small">
      <Button type="link" icon={<FaEdit />} onClick={() => navigate(`/categories/${item.id}/edit`)} title="Chỉnh sửa" />
      <Button
        type="link"
        danger
        icon={<FaTrash />}
        onClick={handleDelete}
        title="Xóa"
        disabled={item.productCount > 0}
      />
    </Space>
  );
};

export default memo(Action);
