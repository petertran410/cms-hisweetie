import { ErrorScreen } from '@/components/effect-screen';
import { Pagination } from '@/components/table';
import { useQueryApplyList, useQueryRecruitmentDetail } from '@/services/recruitment.service';
import { TableStyle } from '@/styles/table.style';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import Action from './action';
import { STATUS_LIST } from './data';
import TableFilter from './filter';

const ApplyList = () => {
  const { id: jobId } = useParams();
  const { data: jobDetail, isLoading: loadingJob, error: errorJob } = useQueryRecruitmentDetail(jobId);
  const { title: jobTitle } = jobDetail || {};
  const { data: dataQuery, isLoading, error } = useQueryApplyList(jobTitle);
  const queryClient = useQueryClient();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'applicant',
      render: (applicant) => <p>{applicant?.id}</p>
    },
    {
      title: 'Thông tin ứng viên',
      dataIndex: 'name',
      render: (text, record) => {
        const { name, email, phoneNumber, resumeUrl } = record?.applicant || {};

        return (
          <div className="flex flex-col gap-2">
            <p>
              - Họ tên: <span className="font-semibold">{name}</span>
            </p>
            <p>
              - SĐT: <span className="font-semibold">{phoneNumber}</span>
            </p>
            <p>
              - Email: <span className="font-semibold">{email}</span>
            </p>
            <p>
              - CV:{' '}
              <a
                href={resumeUrl?.replace('http://', 'https://')}
                target="_blank"
                className="font-semibold text-green-500"
              >
                Xem
              </a>
            </p>
          </div>
        );
      }
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'createdDate',
      render: (createdDate) => {
        return <p>{dayjs(createdDate).format('DD/MM/YYYY - HH:mm')}</p>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => {
        let bgColor = '#828282';
        if (status === 'APPROVED') {
          bgColor = '#0d911f';
        }
        if (status === 'REJECTED') {
          bgColor = '#f02222';
        }

        return (
          <div className="w-36 rounded-lg py-1" style={{ backgroundColor: bgColor }}>
            <p className="text-white text-center">{STATUS_LIST.find((i) => i.value === status)?.label}</p>
          </div>
        );
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note'
    },
    {
      title: 'Hành động',
      render: (_, record) => <Action item={record} />
    }
  ];

  const { content = [], totalElements, pageable } = dataQuery || {};
  const { pageNumber = 0 } = pageable || {};

  useEffect(() => {
    return () => {
      queryClient.resetQueries({ queryKey: ['GET_APPLY_DETAIL'] });
    };
  }, [queryClient]);

  if (error || errorJob) {
    return <ErrorScreen message={error?.message || errorJob?.message} className="mt-20" />;
  }

  return (
    <TableStyle>
      <Helmet>
        <title>Hồ sơ ứng tuyển | {WEBSITE_NAME}</title>
      </Helmet>

      <h1 className="font-bold text-[20px] mb-10">
        Danh sách hồ sơ ứng tuyển của việc làm: <span className="font-bold text-[20px] text-green-500">{jobTitle}</span>
      </h1>

      <TableFilter />
      <Table
        columns={columns}
        dataSource={content}
        loading={isLoading || loadingJob}
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

export default ApplyList;
