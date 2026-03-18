import { CreateButton } from '@/components/table';
import { LoadingScreen } from '@/components/effect-screen';
import { useDeleteTestimonial, useQueryTestimonialList } from '@/services/testimonial.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Image, Popconfirm, Table } from 'antd';
import dayjs from 'dayjs';
import { Helmet } from 'react-helmet';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const TestimonialList = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQueryTestimonialList();
  const { mutate: deleteMutate, isPending: deleting } = useDeleteTestimonial();
  const { content = [], totalElements = 0 } = data || {};

  const columns = [
    {
      title: 'Hình ảnh',
      dataIndex: 'image',
      width: 100,
      render: (url) =>
        url ? (
          <Image src={url} width={60} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          <div className="w-[60px] h-[60px] bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
            N/A
          </div>
        )
    },
    {
      title: 'Tên khách hàng',
      dataIndex: 'name',
      ellipsis: true
    },
    {
      title: 'Nội dung đánh giá',
      dataIndex: 'review_description',
      ellipsis: true,
      width: 400
    },
    {
      title: 'Thao tác',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            icon={<FaEdit />}
            onClick={() => navigate(`/testimonials/${record.id}/edit`)}
          />
          <Popconfirm title="Xác nhận xóa?" onConfirm={() => deleteMutate(record.id)}>
            <Button danger size="small" icon={<FaTrash />} loading={deleting} />
          </Popconfirm>
        </div>
      )
    }
  ];

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>Đánh giá khách hàng | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Đánh giá khách hàng ({totalElements})</h2>
        <CreateButton onClick={() => navigate('/testimonials/create')} />
      </div>

      <Table
        columns={columns}
        dataSource={content}
        rowKey="id"
        pagination={{ total: totalElements, pageSize: 10 }}
        scroll={{ x: 800 }}
      />
    </>
  );
};

export default TestimonialList;
