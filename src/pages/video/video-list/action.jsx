import { TableAction } from '@/components/table';
import { useDeleteVideo } from '@/services/video.service';
import { memo } from 'react';

const Action = ({ item }) => {
  const { mutate: deleteMutate, isPending } = useDeleteVideo();

  return (
    <TableAction route="videos" item={item} onConfirmDelete={(id) => deleteMutate({ id })} loadingConfirm={isPending} />
  );
};

export default memo(Action);
