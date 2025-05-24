import { FilterSearch } from '@/components/filter';
import FilterCategory from './filter-category';
import { memo } from 'react';

const TableFilter = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 mb-10 gap-y-5">
      <FilterSearch placeholder="Tìm kiếm theo tên sản phẩm" />
      <FilterCategory label="Danh mục sản phẩm" />
    </div>
  );
};

export default memo(TableFilter);
