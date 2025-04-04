import { TableAction } from '@/components/table';
import { useDeleteProducts } from '@/services/products.service';
import { memo } from 'react';

const Action = ({ item }) => {
  const { mutate: deleteMutate, isPending } = useDeleteProducts();

  return (
    <TableAction
      disableView
      route="products"
      item={item}
      onConfirmDelete={(id) => deleteMutate({ id })}
      loadingConfirm={isPending}
    />
  );
};

export default memo(Action);
