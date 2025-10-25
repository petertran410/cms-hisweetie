import { FilterSearch } from '@/components/filter';
import { memo } from 'react';
import FilterNewsType from './filter-news-type';

const NewsFilter = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 mb-6 gap-y-5">
      <FilterSearch label="Tìm kiếm tiêu đề" placeholder="Nhập tiêu đề bài viết..." />
      <FilterNewsType />
    </div>
  );
};

export default memo(NewsFilter);
