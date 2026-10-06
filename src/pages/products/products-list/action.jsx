import { TableAction } from '@/components/table';
import { useDeleteProducts } from '@/services/products.service';
import { memo } from 'react';
import { useLocation } from 'react-router-dom';

const Action = ({ item }) => {
  const location = useLocation();
  const { mutate: deleteMutate, isPending } = useDeleteProducts();

  return (
    <TableAction
      disableView
      route="products"
      item={item}
      editState={{ from: `${location.pathname}${location.search}` }}
      onConfirmDelete={(id) => deleteMutate({ id })}
      loadingConfirm={isPending}
    />
  );
};

export default memo(Action);
