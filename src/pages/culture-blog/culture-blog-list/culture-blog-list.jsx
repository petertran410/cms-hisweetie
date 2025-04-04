import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryBlogCultureList } from '@/services/blog-culture.service';
import { TableStyle } from '@/styles/table.style';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Action from './action';
import TableFilter from './filter';

const BlogCultureList = () => {
  const { data: dataQuery, isLoading, error } = useQueryBlogCultureList();
  const queryClient = useQueryClient();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text, _, index) => <Link to={`/blog-culture/${text}/detail`}>{index + 1}</Link>
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (text, record) => (
        <Link to={`/blog-culture/${record.id}/detail`}>
          <div className="flex items-center gap-3">
            {Array.isArray(record?.imagesUrl) && (
              <img src={record.imagesUrl[0]} className="w-16 h-14 object-cover rounded-md" />
            )}
            <p className="font-semibold">{text}</p>
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
        <title>Danh sách bài viết văn hoá | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-end mb-5">
        <CreateButton route="/blog-culture/create" />
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

export default BlogCultureList;
