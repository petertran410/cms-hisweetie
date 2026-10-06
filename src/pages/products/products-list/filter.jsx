import { FilterSearch } from '@/components/filter';
import { Button, Space, Dropdown } from 'antd';
import { useParamsURL, useRemoveParamURL } from '@/utils/helper';
import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { FaList, FaEye, FaEyeSlash, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useQueryCategoriesForProductDropdown } from '@/services/category.service';

const PRODUCTS_LIST_PARAMS = ['keyword', 'categoryId', 'categoryIds', 'is_visible', 'page'];

const getProductsFilterStorageKey = () =>
  `cms-products-list-filters:${localStorage.getItem('website') || 'lermao'}`;

const readStoredProductListParams = () => {
  try {
    const storedValue = localStorage.getItem(getProductsFilterStorageKey());
    if (!storedValue) return null;

    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue) ? parsedValue : null;
  } catch (error) {
    console.warn('Không thể đọc bộ lọc sản phẩm từ localStorage:', error);
    return null;
  }
};

const TableFilter = () => {
  const { paramsURL, setParamsURL } = useParamsURL();
  const removeParamsURL = useRemoveParamURL();
  const { is_visible, categoryId } = paramsURL || {};
  const { data: categoriesData = [], isLoading: categoriesLoading } = useQueryCategoriesForProductDropdown();
  const hasInitializedStorage = useRef(false);

  const normalizedCategories = useMemo(() => {
    const categories = Array.isArray(categoriesData)
      ? categoriesData
      : categoriesData?.data || categoriesData?.content || [];

    return categories
      .filter((category) => category && typeof category === 'object')
      .map((category) => ({
        ...category,
        id: Number(category.id),
        parent_id: category.parent_id === null || category.parent_id === undefined ? null : Number(category.parent_id)
      }));
  }, [categoriesData]);

  const visibleCategories = useMemo(
    () =>
      normalizedCategories.filter(
        (category) =>
          category.is_active !== false &&
          category.is_active !== 0 &&
          category.is_active !== 'false' &&
          category.is_active !== '0'
      ),
    [normalizedCategories]
  );

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const storedParams = readStoredProductListParams();
    const hasUrlParams = PRODUCTS_LIST_PARAMS.some((key) =>
      Object.prototype.hasOwnProperty.call(paramsURL || {}, key)
    );

    if (!hasInitializedStorage.current) {
      hasInitializedStorage.current = true;

      if (!hasUrlParams && storedParams && Object.keys(storedParams).length > 0) {
        setParamsURL(storedParams);
        return;
      }
    }

    const currentParams = PRODUCTS_LIST_PARAMS.reduce((result, key) => {
      if (paramsURL?.[key] !== undefined && paramsURL?.[key] !== '') {
        result[key] = paramsURL[key];
      }
      return result;
    }, {});

    try {
      if (Object.keys(currentParams).length > 0) {
        localStorage.setItem(getProductsFilterStorageKey(), JSON.stringify(currentParams));
      } else {
        localStorage.removeItem(getProductsFilterStorageKey());
      }
    } catch (error) {
      console.warn('Không thể lưu bộ lọc sản phẩm vào localStorage:', error);
    }
  }, [paramsURL, setParamsURL]);

  // Build category tree and get all descendant IDs for the backend filter.
  const { categoryTree, categoryMap, getAllDescendantIds } = useMemo(() => {
    const map = new Map();
    const descendantMap = new Map();
    const tree = [];

    normalizedCategories.forEach((cat) => {
      descendantMap.set(cat.id, { ...cat, children: [] });
    });

    normalizedCategories.forEach((cat) => {
      const node = descendantMap.get(cat.id);
      if (cat.parent_id && descendantMap.has(cat.parent_id)) {
        descendantMap.get(cat.parent_id).children.push(node);
      }
    });

    visibleCategories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    visibleCategories.forEach((cat) => {
      const node = map.get(cat.id);
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id).children.push(node);
      } else {
        tree.push(node);
      }
    });

    const getDescendantIds = (categoryId) => {
      const ids = [categoryId];
      const category = descendantMap.get(categoryId);

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
  }, [normalizedCategories, visibleCategories]);

  useEffect(() => {
    if (categoryId && categoryMap.has(Number(categoryId))) {
      setSelectedCategory(categoryMap.get(Number(categoryId)));
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId, categoryMap]);

  useEffect(() => {
    if (!categoriesLoading && categoryId && !categoryMap.has(Number(categoryId))) {
      removeParamsURL(['categoryId', 'categoryIds', 'page']);
    }
  }, [categoriesLoading, categoryId, categoryMap, removeParamsURL]);

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
