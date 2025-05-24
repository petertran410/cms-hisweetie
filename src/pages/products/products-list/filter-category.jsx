import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { useQueryCategoriesList } from '@/services/products.service';
import { Select } from 'antd';
import { memo, useMemo } from 'react';

const FilterCategory = ({ label = 'Danh mục' }) => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { categoryNames = '' } = paramsURL || {};

  const { data: categoriesData, isLoading } = useQueryCategoriesList();
  const categories = categoriesData?.categories || [];

  // Prepare options for Select component
  const categoryOptions = useMemo(() => {
    // Filter to show only "Trà Phượng Hoàng" and "Lermao" categories
    const targetCategories = categories.filter((cat) => cat.name === 'Trà Phượng Hoàng' || cat.name === 'Lermao');

    return targetCategories.map((category) => ({
      label: category.name,
      value: category.name
    }));
  }, [categories]);

  // Parse current selected categories
  const selectedCategories = categoryNames ? categoryNames.split(',').filter((name) => name.trim()) : [];

  const handleCategoryChange = (values) => {
    if (!values || values.length === 0) {
      removeParamsURL(['categoryNames']);
      return;
    }

    // Join selected category names with comma
    const categoryNamesString = values.join(',');
    setParamsURL({ categoryNames: categoryNamesString });
  };

  return (
    <div>
      <p className="font-semibold text-sm mb-1">{label}</p>
      <Select
        mode="multiple"
        value={selectedCategories}
        options={categoryOptions}
        style={{ width: '100%', height: 'auto', minHeight: 35 }}
        placeholder="Chọn danh mục..."
        allowClear
        loading={isLoading}
        onChange={handleCategoryChange}
        maxTagCount="responsive"
      />
    </div>
  );
};

export default memo(FilterCategory);
