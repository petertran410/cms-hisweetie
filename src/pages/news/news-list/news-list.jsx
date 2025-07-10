// src/pages/news/news-list/news-list.jsx - UPDATED với type labels
import { TablePrimary } from '@/components/table';
import { useQueryNewsList } from '@/services/news.service';
import { getNewsTypeLabel, NEWS_TYPE_OPTIONS } from '@/utils/news-types.constants';
import { convertTimestamp } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/const';
import { Tag, Select } from 'antd';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Action from './action';

const NewsList = () => {
  const { data, isLoading } = useQueryNewsList();
  const { content = [], totalElements = 0 } = data || {};

  // Mapping type colors cho tags
  const getTypeTagColor = (type) => {
    const colorMap = {
      NEWS: 'blue',
      CULTURE: 'green',
      VIDEO: 'red',
      KIEN_THUC_NGUYEN_LIEU: 'orange',
      KIEN_THUC_TRA: 'cyan',
      TREND_PHA_CHE: 'purple',
      REVIEW_SAN_PHAM: 'magenta',
      CONG_THUC_PHA_CHE: 'geekblue'
    };
    return colorMap[type] || 'default';
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (title, record) => (
        <Link
          to={`/news/${record.id}/detail`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {title}
        </Link>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (description) => (
        <div className="text-gray-600 text-sm line-clamp-2 max-w-xs">{description || 'Chưa có mô tả'}</div>
      )
    },
    {
      title: 'Loại bài viết', // THÊM MỚI
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => (
        <Tag color={getTypeTagColor(type)} className="text-xs">
          {getNewsTypeLabel(type)}
        </Tag>
      ),
      // Thêm filter dropdown
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-4">
          <Select
            placeholder="Chọn loại bài viết"
            value={selectedKeys[0]}
            onChange={(value) => {
              setSelectedKeys(value ? [value] : []);
            }}
            onPressEnter={() => confirm()}
            style={{ width: 200, marginBottom: 8, display: 'block' }}
            allowClear
            options={[{ value: '', label: 'Tất cả' }, ...NEWS_TYPE_OPTIONS]}
          />
          <div className="flex gap-2">
            <button
              onClick={() => confirm()}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              Lọc
            </button>
            <button
              onClick={() => {
                clearFilters();
                confirm();
              }}
              className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
            >
              Xóa
            </button>
          </div>
        </div>
      ),
      onFilter: (value, record) => {
        if (!value) return true;
        return record.type === value;
      }
    },
    {
      title: 'Ảnh đại diện',
      dataIndex: 'imagesUrl',
      key: 'imagesUrl',
      width: 100,
      render: (imagesUrl) => {
        const imageUrl =
          Array.isArray(imagesUrl) && imagesUrl.length > 0 ? imagesUrl[0]?.replace('https://', 'http://') : null;

        return imageUrl ? (
          <img
            src={imageUrl}
            alt="Ảnh đại diện"
            className="w-16 h-12 object-cover rounded border"
            onError={(e) => {
              e.target.src = '/images/news.webp';
            }}
          />
        ) : (
          <div className="w-16 h-12 bg-gray-200 rounded border flex items-center justify-center">
            <span className="text-xs text-gray-500">Chưa có ảnh</span>
          </div>
        );
      }
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 80,
      sorter: (a, b) => (a.viewCount || 0) - (b.viewCount || 0),
      render: (viewCount) => <span className="text-gray-600 text-sm">{viewCount || 0}</span>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      sorter: (a, b) => new Date(a.createdDate) - new Date(b.createdDate),
      render: (createdDate) => <span className="text-gray-600 text-sm">{convertTimestamp(createdDate)}</span>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => <Action item={record} />
    }
  ];

  return (
    <div>
      <Helmet>
        <title>Quản lý tin tức | {WEBSITE_NAME}</title>
      </Helmet>

      <TablePrimary
        title="Danh sách tin tức"
        data={content}
        columns={columns}
        loading={isLoading}
        total={totalElements}
        createRoute="/news/create"
        createText="Tạo tin tức mới"
        scroll={{ x: 1200 }}
        rowKey="id"
        // Thêm thống kê theo type
        summary={() => {
          if (!content.length) return null;

          const typeCounts = content.reduce((acc, item) => {
            const type = item.type || 'UNKNOWN';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
          }, {});

          return (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Thống kê theo loại bài viết:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(typeCounts).map(([type, count]) => (
                  <Tag key={type} color={getTypeTagColor(type)} className="text-xs">
                    {getNewsTypeLabel(type)}: {count}
                  </Tag>
                ))}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
};

export default NewsList;
