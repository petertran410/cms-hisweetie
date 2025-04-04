import { useQueryCategoryListByParentId } from '@/services/category.service';
import { Form } from 'antd';
import { arrayMoveImmutable } from 'array-move';
import { useEffect } from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { useRecoilState } from 'recoil';
import { sortItemsAtom } from './recoil';

const SortableItem = SortableElement(({ value }) => {
  const { item, index } = value;
  return (
    <div className="h-12 border flex items-center px-4 cursor-move select-none">
      {index + 1}. {item?.name}
    </div>
  );
});

const SortableList = SortableContainer(({ items }) => {
  return (
    <div className="flex flex-col gap-3">
      {items.map((item, index) => (
        <SortableItem key={`item-${index}`} index={index} value={{ item, index }} />
      ))}
    </div>
  );
});

const DragCategory = ({ form }) => {
  const parentCategory = Form.useWatch('categoryId', form);
  const parentId = parentCategory?.value;
  const { data: dataQuery } = useQueryCategoryListByParentId(parentId === 'HOME' ? undefined : parentId);
  const [items, setItems] = useRecoilState(sortItemsAtom);

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setItems(arrayMoveImmutable(items, oldIndex, newIndex));
  };

  useEffect(() => {
    if (typeof dataQuery !== 'undefined') {
      setItems(dataQuery || []);
    }
  }, [dataQuery]);

  return <SortableList items={items} onSortEnd={onSortEnd} />;
};

export default DragCategory;
