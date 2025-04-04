import { TableAction } from '@/components/table';
import { useDeleteBlogCulture } from '@/services/blog-culture.service';
import { memo } from 'react';

const Action = ({ item }) => {
  const { mutate: deleteMutate, isPending } = useDeleteBlogCulture();

  return (
    <TableAction
      route="blog-culture"
      item={item}
      onConfirmDelete={(id) => deleteMutate({ id })}
      loadingConfirm={isPending}
    />
  );
};

export default memo(Action);
