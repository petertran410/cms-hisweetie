// src/pages/pages/pages-list/filter.jsx
import { TableAction } from '../../../components/table/';
import { useQueryParentPagesList } from '@/services/pages.service';
import { Select } from 'antd';

const { Option } = Select;

const Filter = () => {
  const { data: parentPagesData } = useQueryParentPagesList();
  const { content: parentPages = [] } = parentPagesData || {};

  const filterConfig = [
    {
      key: 'title',
      placeholder: 'Tìm kiếm theo tiêu đề...',
      type: 'input'
    },
    {
      key: 'slug',
      placeholder: 'Tìm kiếm theo slug...',
      type: 'input'
    },
    {
      key: 'parentId',
      placeholder: 'Trang cha',
      type: 'select',
      children: (
        <>
          <Option value="">Tất cả</Option>
          <Option value="null">Trang gốc</Option>
          {parentPages.map((page) => (
            <Option key={page.id} value={page.id}>
              {page.title}
            </Option>
          ))}
        </>
      )
    },
    {
      key: 'isActive',
      placeholder: 'Trạng thái',
      type: 'select',
      children: (
        <>
          <Option value="">Tất cả</Option>
          <Option value="true">Hiển thị</Option>
          <Option value="false">Ẩn</Option>
        </>
      )
    }
  ];

  return <TableAction filterConfig={filterConfig} />;
};

export default Filter;
