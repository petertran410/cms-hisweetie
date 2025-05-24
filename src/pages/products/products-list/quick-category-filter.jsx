import { useParamsURL } from '@/utils/helper';
import { Button } from 'antd';
import { memo } from 'react';

const QuickCategoryFilter = () => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const { categoryNames } = paramsURL || {};

  const isFilteringTargetCategories = categoryNames === 'Trà Phượng Hoàng,Lermao';

  const handleShowTargetCategories = () => {
    setParamsURL({ categoryNames: 'Trà Phượng Hoàng,Lermao', page: 1 });
  };

  const handleShowAllProducts = () => {
    setParamsURL({ categoryNames: undefined, page: 1 });
  };

  const handleClearFilter = () => {
    setParamsURL({ categoryNames: '', page: 1 });
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Bộ lọc nhanh:</span>

      {!isFilteringTargetCategories && (
        <Button type="primary" size="small" onClick={handleShowTargetCategories}>
          Chỉ hiện Trà Phượng Hoàng & Lermao
        </Button>
      )}

      {categoryNames && (
        <Button size="small" onClick={handleShowAllProducts}>
          Hiển thị tất cả sản phẩm
        </Button>
      )}

      {categoryNames && (
        <Button type="link" size="small" onClick={handleClearFilter} className="text-red-500">
          Xóa bộ lọc
        </Button>
      )}

      {isFilteringTargetCategories && (
        <div className="text-sm text-green-600 font-medium">✓ Đang hiển thị sản phẩm Trà Phượng Hoàng & Lermao</div>
      )}
    </div>
  );
};

export default memo(QuickCategoryFilter);
