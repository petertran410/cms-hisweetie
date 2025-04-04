import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryVideoList } from '@/services/video.service';
import { TableStyle } from '@/styles/table.style';
import { WEBSITE_NAME } from '@/utils/resource';
import { Table } from 'antd';
import { Helmet } from 'react-helmet';
import Action from './action';
import TableFilter from './filter';

const VideoList = () => {
  const { data: dataQuery = {}, isLoading, error } = useQueryVideoList();

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      render: (id, record, index) => <p className="font-semibold">{index + 1}</p>
    },
    {
      title: 'Tên video',
      dataIndex: 'title'
    },
    {
      title: 'Link nhúng',
      dataIndex: 'imagesUrl',
      render: (data) => {
        const rootLink = data?.[0]?.replace('https://www.youtube.com/embed', 'https://youtu.be');
        return (
          <div>
            <p>- Link nhúng: {data?.[0]}</p>
            <p>
              - Link video:{' '}
              <a href={rootLink} target="_blank" className="text-blue-600">
                {rootLink}
              </a>
            </p>
          </div>
        );
      }
    },
    {
      title: 'Hành động',
      render: (_, record) => <Action item={record} />
    }
  ];

  const { content = [], totalElements, pageable } = dataQuery || {};
  const { pageNumber = 0 } = pageable || {};

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách video | {WEBSITE_NAME}</title>
      </Helmet>
      <div className="flex justify-end mb-5">
        <CreateButton route="/videos/create" />
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

export default VideoList;
