import { TableAction } from '@/components/table';
import { useDeleteNews } from '@/services/news.service';
import { memo } from 'react';

const Action = ({ item }) => {
  const { mutate: deleteMutate, isPending } = useDeleteNews();

  return (
    <TableAction route="news" item={item} onConfirmDelete={(id) => deleteMutate({ id })} loadingConfirm={isPending} />
  );
};

export default memo(Action);
