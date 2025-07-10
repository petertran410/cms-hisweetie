import { useQueryNewsList } from '../../../services/news.service';
import { getNewsTypeLabel, NEWS_TYPE_OPTIONS } from '../../../utils/news-types.constants';
import { convertTimestamp } from '../../../utils/helper';
import { WEBSITE_NAME } from '../../../utils/resource';
import { Tag, Select, Button, Table, Pagination, Spin } from 'antd';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import Action from './action';

const NewsList = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQueryNewsList();
  const { content = [], totalElements = 0, totalPages = 0, number: currentPage = 0 } = data || {};

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
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (text, record) => (
        <Link
          to={`/news/${record.id}/detail`}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {text}
        </Link>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      render: (text) => <div className="text-gray-600 text-sm line-clamp-2 max-w-xs">{text || 'Chưa có mô tả'}</div>
    },
    {
      title: 'Loại bài viết',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type) => (
        <Tag color={getTypeTagColor(type)} className="text-xs">
          {getNewsTypeLabel(type)}
        </Tag>
      )
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
      render: (viewCount) => <span className="text-gray-600 text-sm">{viewCount || 0}</span>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 120,
      render: (date) => <span className="text-gray-600 text-sm">{convertTimestamp(date)}</span>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => <Action item={record} />
    }
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          <h3>Có lỗi xảy ra khi tải dữ liệu</h3>
          <p>{error.message}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

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

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <Table
          columns={columns}
          dataSource={content}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          scroll={{ x: 1200 }}
          size="middle"
          bordered
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Pagination
            current={currentPage + 1}
            total={totalElements}
            pageSize={10}
            showSizeChanger={false}
            onChange={(newPage) => {
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set('page', newPage.toString());
              navigate(`/news?${searchParams.toString()}`);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NewsList;
