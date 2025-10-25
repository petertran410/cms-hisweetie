import { FilterSearch } from '@/components/filter';
import { Button, Space, Dropdown } from 'antd';
import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { memo, useMemo, useState, useEffect } from 'react';
import { FaList, FaEye, FaEyeSlash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useQueryCategoriesForProductDropdown } from '@/services/category.service';

const TableFilter = () => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { is_visible, categoryId } = paramsURL || {};
  const { data: categoriesData = [], isLoading: categoriesLoading } = useQueryCategoriesForProductDropdown();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Build category tree và getAllDescendantIds
  const { categoryTree, categoryMap, getAllDescendantIds } = useMemo(() => {
    const map = new Map();
    const tree = [];

    categoriesData.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    categoriesData.forEach((cat) => {
      const node = map.get(cat.id);
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id).children.push(node);
      } else {
        tree.push(node);
      }
    });

    const getDescendantIds = (categoryId) => {
      const ids = [categoryId];
      const category = map.get(categoryId);

      if (category?.children && category.children.length > 0) {
        category.children.forEach((child) => {
          ids.push(...getDescendantIds(child.id));
        });
      }

      return ids;
    };

    return {
      categoryTree: tree,
      categoryMap: map,
      getAllDescendantIds: getDescendantIds
    };
  }, [categoriesData]);

  useEffect(() => {
    if (categoryId && categoryMap.has(Number(categoryId))) {
      setSelectedCategory(categoryMap.get(Number(categoryId)));
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId, categoryMap]);

  const handleVisibilityFilter = (value) => {
    if (value === 'all') {
      removeParamsURL(['is_visible', 'page']);
    } else {
      setParamsURL({ ...paramsURL, is_visible: value, page: '1' });
    }
  };

  const handleCategorySelect = (category) => {
    const descendantIds = getAllDescendantIds(category.id);
    setParamsURL({
      ...paramsURL,
      categoryId: category.id,
      categoryIds: descendantIds.join(','),
      page: '1'
    });
    setSelectedCategory(category);
    setDropdownVisible(false);
  };

  const handleClearCategory = () => {
    removeParamsURL(['categoryId', 'categoryIds', 'page']);
    setSelectedCategory(null);
  };

  const renderMenuItem = (category) => {
    const hasChildren = category.children && category.children.length > 0;

    return {
      key: `cat-${category.id}`,
      label: (
        <div
          className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleCategorySelect(category);
          }}
        >
          <span className="flex-1">{category.name}</span>
          {hasChildren && <FaChevronRight className="ml-2 text-gray-400" />}
        </div>
      ),
      children: hasChildren ? category.children.map((child) => renderMenuItem(child)) : undefined
    };
  };

  const categoryMenuItems = useMemo(() => {
    return categoryTree.map((cat) => renderMenuItem(cat));
  }, [categoryTree, getAllDescendantIds]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-x-10 mb-10 gap-y-5">
      <FilterSearch placeholder="Tìm kiếm theo tên sản phẩm" />

      <div>
        <p className="font-semibold text-sm mb-1">Danh mục sản phẩm</p>
        <Space.Compact className="w-full">
          <Dropdown
            menu={{
              items: categoryMenuItems,
              style: { maxHeight: '400px', overflow: 'auto' }
            }}
            trigger={['click']}
            open={dropdownVisible}
            onOpenChange={setDropdownVisible}
            disabled={categoriesLoading}
          >
            <Button className="flex-1 justify-between items-center" style={{ display: 'flex' }}>
              <span className="truncate">{selectedCategory ? selectedCategory.name : 'Tất cả danh mục'}</span>
              <FaChevronDown />
            </Button>
          </Dropdown>
          {selectedCategory && <Button onClick={handleClearCategory}>Xóa</Button>}
        </Space.Compact>
      </div>

      <div>
        <p className="font-semibold text-sm mb-1">Trạng thái hiển thị</p>
        <Space.Compact className="w-full">
          <Button
            type={!is_visible ? 'primary' : 'default'}
            icon={<FaList />}
            onClick={() => handleVisibilityFilter('all')}
            className="flex-1"
          >
            Tất cả
          </Button>
          <Button
            type={is_visible === 'true' ? 'primary' : 'default'}
            icon={<FaEye />}
            onClick={() => handleVisibilityFilter('true')}
            className="flex-1"
          >
            Hiển thị
          </Button>
          <Button
            type={is_visible === 'false' ? 'primary' : 'default'}
            icon={<FaEyeSlash />}
            onClick={() => handleVisibilityFilter('false')}
            className="flex-1"
          >
            Ẩn
          </Button>
        </Space.Compact>
      </div>
    </div>
  );
};

export default memo(TableFilter);
