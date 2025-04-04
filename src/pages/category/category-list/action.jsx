import { TableAction } from '@/components/table';
import { useDeleteCategory } from '@/services/category.service';
import { memo } from 'react';

const Action = ({ item }) => {
  const { mutate: deleteMutate, isPending } = useDeleteCategory();

  return (
    <TableAction
      disableView
      route="categories"
      item={item}
      onConfirmDelete={(id) => deleteMutate({ id })}
      loadingConfirm={isPending}
    />
  );
};

export default memo(Action);
