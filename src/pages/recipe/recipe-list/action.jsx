import { TableAction } from '@/components/table';
import { useDeleteRecipe } from '@/services/recipe.service';
import { memo } from 'react';

const Action = ({ item }) => {
  const { mutate: deleteMutate, isPending } = useDeleteRecipe();

  return (
    <TableAction
      disableView
      route="recipes"
      item={item}
      onConfirmDelete={(id) => deleteMutate({ id })}
      loadingConfirm={isPending}
    />
  );
};

export default memo(Action);
