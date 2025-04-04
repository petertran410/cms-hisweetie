import { ErrorScreen } from '@/components/effect-screen';
import { Pagination } from '@/components/table';
import { useQueryUserList } from '@/services/user.service';
import { TableStyle } from '@/styles/table.style';
import { Table, Tag } from 'antd';
import { Link } from 'react-router-dom';
import Action from './action';
import TableFilter from './filter';

const UserList = () => {
  const { data: dataQuery = {}, isLoading, error } = useQueryUserList();

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      render: (id, record, index) => <p className="font-semibold">{index + 1}</p>
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      render: (text, record) => (
        <Link to={`/users/${record.id}/detail`}>
          <p className="font-semibold">{text}</p>
        </Link>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      render: (text) => <a href={`tel:${text}`}>{text}</a>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (text) => <a href={`mailto:${text}`}>{text}</a>
    },
    {
      title: 'Role',
      dataIndex: 'authorities',
      render: (text, record) => {
        const authorities = record?.authorities || [];

        return (
          <div>
            {authorities.map((item) => (
              <p>{item.role}</p>
            ))}

            {!record?.active && (
              <Tag className="mt-1" color="red">
                Banned
              </Tag>
            )}
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
      {/* <div className="flex justify-end mb-5">
        <CreateButton route="/users/create" />
      </div> */}
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

export default UserList;
