import ImgAvatar from '@/assets/user-avatar.png';
import { ErrorScreen } from '@/components/effect-screen';
import { Pagination } from '@/components/table';
import { useQueryOrderList } from '@/services/order.service';
import { TableStyle } from '@/styles/table.style';
import { WEBSITE_NAME } from '@/utils/resource';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet';
import { FaEnvelope } from 'react-icons/fa';
import { FaPhone } from 'react-icons/fa6';
import Action from './action';
import { ORDER_TYPE } from './data';
import TableFilter from './filter';

const OrderList = () => {
  const { data: dataQuery, isLoading, error } = useQueryOrderList();

  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'id',
      render: (text) => <p className="font-semibold">{text}</p>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'receiverFullName',
      render: (_, record) => (
        <div>
          <div className="flex gap-3">
            <img src={ImgAvatar} className="w-12 h-12" />
            <div className="flex flex-col flex-1">
              <p className="font-bold uppercase">{record?.receiverFullName}</p>
              <div className="flex items-center gap-2">
                <FaPhone size={13} color="#828282" />
                <p>{record?.phoneNumber}</p>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope size={13} color="#828282" />
                <p>{record?.email}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Nội dung',
      dataIndex: 'note',
      render: (note, record) => {
        const { type, orders = [] } = record;

        if (type === 'CONTACT') {
          return <p>{note}</p>;
        }

        return (
          <div>
            <p className="font-bold">
              Sản phẩm: <span className="text-[13px]">({orders?.length} sản phẩm)</span>
            </p>
            <div className="mt-0.5 pl-2 flex flex-col gap-0.5">
              {orders?.map((i) => (
                <p className="font-medium text-[13px]">
                  - {i?.product?.title} <span className="text-[#828282] text-[13px]">(Số lượng: {i?.quantity})</span>
                </p>
              ))}
            </div>
            <p className="font-bold mt-3">
              Ghi chú: <span className="text-[13px]">{note}</span>
            </p>
          </div>
        );
      }
    },
    // {
    //   title: 'Tổng tiền',
    //   dataIndex: 'price',
    //   render: (price) => {
    //     return (
    //       <div>
    //         <p className="font-bold text-blue-600 text-lg">{formatCurrency(price)}</p>
    //       </div>
    //     );
    //   }
    // },
    {
      title: 'Loại đơn',
      dataIndex: 'type',
      render: (type) => {
        const currentType = ORDER_TYPE.find((i) => i.value === type);
        return (
          <div>
            <p className="whitespace-nowrap">{currentType?.label}</p>
          </div>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        return (
          <div>
            <p className="font-bold">{status}</p>
          </div>
        );
      }
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'createdDate',
      render: (createdDate) => {
        return (
          <div>
            <p className="font-semibold">{dayjs(createdDate).format('DD/MM/YYYY - HH:mm')}</p>
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
        <title>Danh sách đơn hàng | {WEBSITE_NAME}</title>
      </Helmet>
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

export default OrderList;
