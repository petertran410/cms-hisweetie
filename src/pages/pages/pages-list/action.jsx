// src/pages/pages/pages-list/action.jsx
import { TableAction } from '@/components/table';
import { useDeletePages } from '@/services/pages.service';
import { memo } from 'react';

const Action = ({ item }) => {
  const { mutate: deleteMutate, isPending } = useDeletePages();

  const handleDelete = (id) => {
    deleteMutate({ id });
  };

  return (
    <TableAction
      route="pages"
      item={item}
      onConfirmDelete={handleDelete}
      loadingConfirm={isPending}
      deleteDisabled={item.children && item.children.length > 0} // Không cho xoá nếu có trang con
      deleteTooltip={item.children && item.children.length > 0 ? 'Không thể xoá trang có trang con' : 'Xoá trang này'}
    />
  );
};

export default memo(Action);
