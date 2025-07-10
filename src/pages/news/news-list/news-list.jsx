// src/pages/news/news-list/news-list.jsx - FIXED với TableAction component
import TableAction from '../../../components/table/table-action';
import { useQueryNewsList } from '@/services/news.service';
import { getNewsTypeLabel, NEWS_TYPE_OPTIONS } from '../../../utils/news-types.constants';
import { convertTimestamp } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Tag, Select, Button } from 'antd';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Action from './action';

const NewsList = () => {
  const { data, isLoading, error } = useQueryNewsList();
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
      field: 'id',
      title: 'STT',
      width: '60px',
      render: (item, index) => index + 1
    },
    {
      field: 'title',
      title: 'Tiêu đề',
      width: '300px',
      render: (item) => (
        <Link to={`/news/${item.id}/detail`} className="font-medium text-blue-600 hover:text-blue-800 hover:underline">
          {item.title}
        </Link>
      )
    },
    {
      field: 'description',
      title: 'Mô tả',
      width: '250px',
      render: (item) => (
        <div className="text-gray-600 text-sm line-clamp-2 max-w-xs">{item.description || 'Chưa có mô tả'}</div>
      )
    },
    {
      field: 'type',
      title: 'Loại bài viết',
      width: '150px',
      render: (item) => (
        <Tag color={getTypeTagColor(item.type)} className="text-xs">
          {getNewsTypeLabel(item.type)}
        </Tag>
      )
    },
    {
      field: 'imagesUrl',
      title: 'Ảnh đại diện',
      width: '100px',
      render: (item) => {
        const imageUrl =
          Array.isArray(item.imagesUrl) && item.imagesUrl.length > 0
            ? item.imagesUrl[0]?.replace('https://', 'http://')
            : null;

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
      field: 'viewCount',
      title: 'Lượt xem',
      width: '80px',
      render: (item) => <span className="text-gray-600 text-sm">{item.viewCount || 0}</span>
    },
    {
      field: 'createdDate',
      title: 'Ngày tạo',
      width: '120px',
      render: (item) => <span className="text-gray-600 text-sm">{convertTimestamp(item.createdDate)}</span>
    },
    {
      field: 'action',
      title: 'Hành động',
      width: '120px',
      render: (item) => <Action item={item} />
    }
  ];

  return (
    <div className="p-6">
      <Helmet>
        <title>Quản lý tin tức | {WEBSITE_NAME}</title>
      </Helmet>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Danh sách tin tức</h1>
        <Link to="/news/create">
          <Button type="primary" size="large">
            Tạo tin tức mới
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2 text-sm">Thống kê:</h4>
        <div className="flex flex-wrap gap-2">
          <Tag color="blue">Tổng cộng: {totalElements}</Tag>
          {content.length > 0 &&
            (() => {
              const typeCounts = content.reduce((acc, item) => {
                const type = item.type || 'UNKNOWN';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              }, {});

              return Object.entries(typeCounts).map(([type, count]) => (
                <Tag key={type} color={getTypeTagColor(type)} className="text-xs">
                  {getNewsTypeLabel(type)}: {count}
                </Tag>
              ));
            })()}
        </div>
      </div>

      {/* TableAction */}
      <TableAction columns={columns} data={content} isLoading={isLoading} error={error} />
    </div>
  );
};

export default NewsList;
