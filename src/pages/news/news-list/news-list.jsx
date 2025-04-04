import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryNewsList } from '@/services/news.service';
import { TableStyle } from '@/styles/table.style';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Action from './action';
import TableFilter from './filter';

const NewsList = () => {
  const { data: dataQuery, isLoading, error } = useQueryNewsList();
  const queryClient = useQueryClient();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text, _, index) => <Link to={`/news/${text}/detail`}>{index + 1}</Link>
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (text, record) => (
        <Link to={`/news/${record.id}/detail`}>
          <div className="flex items-center gap-3">
            {Array.isArray(record?.imagesUrl) && (
              <img src={record.imagesUrl[0]} className="w-16 h-14 object-cover rounded-md" />
            )}
            <p className="font-semibold flex-1">{text}</p>
          </div>
        </Link>
      )
    },
    {
      title: 'Mô tả',
      dataIndex: 'description'
    },
    // {
    //   title: 'Ngày tạo',
    //   dataIndex: 'createdAt'
    // },
    {
      title: 'Hành động',
      render: (_, record) => <Action item={record} />
    }
  ];

  const { content = [], totalElements, pageable } = dataQuery || {};
  const { pageNumber = 0 } = pageable || {};

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ['GET_NEWS_DETAIL'] });
    };
  }, [queryClient]);

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách tin tức | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-end mb-5">
        <CreateButton route="/news/create" />
      </div>
      <TableFilter />
      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading}
        pagination={false}
        rowKey="id"
        // scroll={{ x: 1500, scrollToFirstRowOnChange: true }}
      />
      <div className="flex justify-end mt-10">
        <Pagination defaultPage={pageNumber + 1} totalItems={totalElements} />
      </div>
    </TableStyle>
  );
};

export default NewsList;
