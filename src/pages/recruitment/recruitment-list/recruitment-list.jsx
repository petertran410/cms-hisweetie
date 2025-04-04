import { ErrorScreen } from '@/components/effect-screen';
import { CreateButton, Pagination } from '@/components/table';
import { useQueryRecruitmentList } from '@/services/recruitment.service';
import { TableStyle } from '@/styles/table.style';
import { formatCurrency } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryClient } from '@tanstack/react-query';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { WORK_MODE, WORK_TYPE } from '../recruitment-create/recruitment-create';
import Action from './action';
import TableFilter from './filter';

const RecruitmentList = () => {
  const { data: dataQuery, isLoading, error } = useQueryRecruitmentList();
  const queryClient = useQueryClient();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      render: (text) => <Link to={`/recruitment/${text}/edit`}>{text}</Link>
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (text, record) => (
        <Link to={`/recruitment/${record.id}/edit`}>
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
      title: 'Thông tin',
      dataIndex: 'employmentType',
      render: (text, record) => {
        const { employmentType, workMode, workingHours, vacancies, salaryRanges } = record || {};
        let salary = '';
        if (!salaryRanges) {
          salary = 'Thoả thuận';
        } else if (salaryRanges?.min === salaryRanges?.max) {
          salary = formatCurrency(salaryRanges?.min);
        } else {
          salary = formatCurrency(salaryRanges?.min) + ' đến ' + formatCurrency(salaryRanges?.max);
        }

        return (
          <div className="flex flex-col gap-2">
            <p>
              - Số lượng tuyển: <span className="font-semibold">{vacancies}</span>
            </p>
            <p>
              - Loại: <span className="font-semibold">{WORK_TYPE.find((i) => i.value === employmentType)?.label}</span>
            </p>
            <p>
              - Hình thức: <span className="font-semibold">{WORK_MODE.find((i) => i.value === workMode)?.label}</span>
            </p>
            <p>
              - Thời gian:{' '}
              <span className="font-semibold">
                {!isEmpty(workingHours) ? workingHours?.map((i) => `${i.start} - ${i.end}`).join(', ') : 'Thoả thuận'}
              </span>
            </p>
            <p>
              - Mức lương: <span className="font-semibold">{salary}</span>
            </p>
          </div>
        );
      }
    },
    {
      title: 'Địa chỉ làm việc',
      dataIndex: 'location',
      render: (location) => {
        return <p>{location}</p>;
      }
    },
    {
      title: 'Hạn ứng tuyển',
      dataIndex: 'applicationDeadline',
      render: (applicationDeadline) => {
        const inputDate = dayjs(applicationDeadline);
        const currentDate = dayjs();
        const isExpired = inputDate.isBefore(currentDate, 'day');

        return (
          <div>
            <p>{dayjs(applicationDeadline).format('DD/MM/YYYY')}</p>
            <p>
              {isExpired ? (
                <span className="text-red-500">(Hết hạn)</span>
              ) : (
                <span className="text-green-500">(Còn hạn)</span>
              )}
            </p>
          </div>
        );
      }
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
      queryClient.resetQueries({ queryKey: ['GET_RECRUITMENT_DETAIL'] });
    };
  }, [queryClient]);

  if (error) {
    return <ErrorScreen message={error?.message} className="mt-20" />;
  }

  return (
    <TableStyle>
      <Helmet>
        <title>Danh sách việc làm | {WEBSITE_NAME}</title>
      </Helmet>

      <div className="flex justify-end mb-5">
        <CreateButton route="/recruitment/create" />
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

export default RecruitmentList;
