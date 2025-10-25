import { useQueryNewsList, useToggleNewsVisibility } from '../../../services/news.service';
import { getNewsTypeLabel, NEWS_TYPE_OPTIONS } from '../../../utils/news-types.constants';
import { convertTimestamp } from '../../../utils/helper';
import { WEBSITE_NAME } from '../../../utils/resource';
import { Tag, Button, Table, Pagination, Switch, Tooltip, message } from 'antd';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Action from './action';
import NewsFilter from './news-filter';

const NewsList = () => {
  const navigate = useNavigate();
  const { data, isLoading, error } = useQueryNewsList();
  const { mutate: toggleVisibility } = useToggleNewsVisibility();
  const [togglingIds, setTogglingIds] = useState(new Set());

  const {
    content = [],
    totalElements = 0,
    totalPages = 0,
    number: currentPage = 0,
    statisticsByType = {}
  } = data || {};

  const handleVisibilityToggle = async (newsId, currentVisibility, newsTitle) => {
    try {
      setTogglingIds((prev) => new Set([...prev, newsId]));

      await toggleVisibility(
        { newsId },
        {
          onSuccess: () => {
            message.success(`Bài viết ${newsTitle} đã được ${!currentVisibility ? 'hiển thị' : 'ẩn'}`);
            setTogglingIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(newsId);
              return newSet;
            });
          },
          onError: (err) => {
            message.error(`Lỗi: ${err.message}`);
            setTogglingIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(newsId);
              return newSet;
            });
          }
        }
      );
    } catch (err) {
      message.error(`Lỗi: ${err.message}`);
      setTogglingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(newsId);
        return newSet;
      });
    }
  };

  const displayStatistics = () => {
    if (Object.keys(statisticsByType).length === 0) {
      return null;
    }

    return (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-gray-700">Thống kê:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Tag color="blue" className="text-xs">
            Tổng cộng: {totalElements}
          </Tag>

          {Object.entries(statisticsByType).map(([type, count]) => (
            <Tag key={type} color={getTypeTagColor(type)} className="text-xs">
              {getNewsTypeLabel(type)}: {count}
            </Tag>
          ))}
        </div>
      </div>
    );
  };

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
      title: 'Hiển thị',
      key: 'visibility',
      width: 100,
      align: 'center',
      render: (record) => {
        const isVisible = record.is_visible === true;
        const isCurrentlyToggling = togglingIds.has(record.id);

        return (
          <Tooltip title={isVisible ? 'Ẩn khỏi trang web' : 'Hiển thị trên trang web'}>
            <Switch
              checked={isVisible}
              loading={isCurrentlyToggling}
              disabled={isCurrentlyToggling}
              size="small"
              checkedChildren={<FaEye />}
              unCheckedChildren={<FaEyeSlash />}
              onChange={() => handleVisibilityToggle(record.id, isVisible, record.title)}
            />
          </Tooltip>
        );
      }
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

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý tin tức</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả bài viết và trạng thái hiển thị trên website ({totalElements} bài viết)
          </p>
        </div>
        <Link to="/news/create">
          <Button type="primary" size="large">
            Tạo tin tức mới
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <NewsFilter />
      </div>

      <div className="mb-6">{displayStatistics()}</div>

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
