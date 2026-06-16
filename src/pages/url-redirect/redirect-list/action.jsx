import { useDeleteRedirect } from '@/services/redirect.service';
import { Button, Space, Modal } from 'antd';
import { memo } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Action = ({ item }) => {
  const navigate = useNavigate();
  const { mutate: deleteMutate, isPending: deleteLoading } = useDeleteRedirect();

  const handleDelete = () => {
    Modal.confirm({
      title: `Xóa redirect "${item.source_path}"?`,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteMutate({ id: item.id })
    });
  };

  return (
    <Space size="small">
      <Button
        type="link"
        icon={<FaEdit />}
        onClick={() => navigate(`/redirects/${item.id}/edit`)}
        title="Chỉnh sửa"
      />
      <Button type="link" danger icon={<FaTrash />} onClick={handleDelete} title="Xóa" loading={deleteLoading} />
    </Space>
  );
};

export default memo(Action);
