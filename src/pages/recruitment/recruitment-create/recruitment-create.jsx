import { ButtonBack } from '@/components/button';
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import Editor from '@/components/form/editor';
import { useCreateRecruitment, useQueryRecruitmentDetail, useUpdateRecruitment } from '@/services/recruitment.service';
import { formatCurrency, useFormType, useScrollTop } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, ConfigProvider, DatePicker, Form, Input, InputNumber, Select } from 'antd';
import locale from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import { Link, useParams } from 'react-router-dom';

dayjs.locale('vi');

export const WORK_TYPE = [
  {
    label: 'Part-time',
    value: 'PART_TIME'
  },
  {
    label: 'Full-time',
    value: 'FULL_TIME'
  },
  {
    label: 'Internship',
    value: 'INTERNSHIP'
  },
  {
    label: 'Freelance',
    value: 'FREELANCE'
  }
];

export const WORK_MODE = [
  {
    label: 'Onsite',
    value: 'ONSITE'
  },
  {
    label: 'Remote',
    value: 'REMOTE'
  },
  {
    label: 'Hybrid',
    value: 'HYBRID'
  }
];

const RecruitmentCreate = () => {
  const { id } = useParams();
  const { isPending: loadingCreate, mutate: createMutate } = useCreateRecruitment();
  const { isPending: loadingUpdate, mutate: updateMutate } = useUpdateRecruitment(id);
  const { isLoading: loadingDetail, data: recruitmentDetail, error: errorDetail } = useQueryRecruitmentDetail(id);
  const { isDetail } = useFormType();
  const [fromSalary, setFromSalary] = useState();
  const [toSalary, setToSalary] = useState();

  const {
    title,
    employmentType,
    jobDescription,
    location,
    vacancies,
    applicationDeadline,
    workingHours,
    workMode,
    salaryRanges
  } = recruitmentDetail || {};

  const onFinish = useCallback(
    (values) => {
      const {
        title,
        employmentType,
        jobDescription,
        location,
        vacancies,
        applicationDeadline,
        workingHours,
        workMode,
        maxSalary,
        minSalary
      } = values || {};

      const data = {
        title,
        employmentType,
        jobDescription,
        location,
        vacancies: Number(vacancies),
        applicationDeadline: dayjs(applicationDeadline).format('YYYY-MM-DD'),
        workingHours: !isEmpty(workingHours) ? workingHours : undefined,
        workMode,
        salaryRanges: minSalary && maxSalary ? { min: minSalary, max: maxSalary } : undefined
      };
      id ? updateMutate(data) : createMutate(data);
    },
    [createMutate, updateMutate, id]
  );

  useScrollTop();

  useEffect(() => {
    if (id && salaryRanges) {
      setFromSalary(salaryRanges.min);
      setToSalary(salaryRanges?.max);
    }
  }, [id, salaryRanges]);

  if (loadingDetail) {
    return <LoadingScreen className="mt-20" />;
  }

  if (errorDetail) {
    return <ErrorScreen message={errorDetail?.message} className="mt-20" />;
  }

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[65%] mx-auto mb-10">
      <Helmet>
        <title>
          {id ? 'Cập nhật' : 'Tạo'} việc làm | {WEBSITE_NAME}
        </title>
      </Helmet>

      <Form
        name="jobForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
        autoComplete="off"
        className="mt-10"
      >
        <Form.Item
          label={<p className="font-bold text-md">Tên việc làm</p>}
          name="title"
          initialValue={title}
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input className="py-2" disabled={isDetail} />
        </Form.Item>

        <div className="flex items-center gap-10">
          <div className="flex flex-1 flex-col">
            <Form.Item
              label={<p className="font-bold text-md">Số lượng người tuyển</p>}
              name="vacancies"
              initialValue={vacancies}
              rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
            >
              <Input type="number" className="py-2" disabled={isDetail} />
            </Form.Item>
          </div>

          <div className="flex flex-1 flex-col">
            <ConfigProvider locale={locale}>
              <Form.Item
                label={<p className="font-bold text-md">Thời hạn ứng tuyển</p>}
                name="applicationDeadline"
                initialValue={applicationDeadline ? dayjs(applicationDeadline) : undefined}
                rules={[{ required: true, message: 'Vui lòng chọn thời hạn' }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  className="h-[37px]"
                  placeholder="Chọn thời hạn"
                />
              </Form.Item>
            </ConfigProvider>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex flex-1 flex-col">
            <Form.Item
              label={<p className="font-bold text-md">Loại việc làm</p>}
              name="employmentType"
              initialValue={employmentType}
              rules={[{ required: true, message: 'Vui lòng chọn hình thức' }]}
            >
              <Select options={WORK_TYPE} className="h-[37px]" />
            </Form.Item>
          </div>

          <div className="flex flex-1 flex-col">
            <Form.Item
              label={<p className="font-bold text-md">Hình thức làm việc</p>}
              name="workMode"
              initialValue={workMode}
              rules={[{ required: true, message: 'Vui lòng chọn hình thức' }]}
            >
              <Select options={WORK_MODE} className="h-[37px]" />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label={<p className="font-bold text-md">Địa điểm làm việc</p>}
          name="location"
          initialValue={location}
          rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
        >
          <Input.TextArea className="py-2" disabled={isDetail} placeholder="Ví dụ: Cầu Giấy, Hà Nội" />
        </Form.Item>

        <div className="mt-2 mb-7">
          <p className="font-bold text-md">Mức lương</p>
          <div className="flex items-center gap-5 px-10">
            <div className="flex flex-col flex-1">
              <Form.Item
                label={
                  <p className="font-medium text-md">
                    Từ{' '}
                    <span className="text-green-600">{fromSalary ? `(${formatCurrency(fromSalary)})` : undefined}</span>
                  </p>
                }
                name="minSalary"
                initialValue={salaryRanges?.min}
              >
                <InputNumber
                  className="w-full"
                  disabled={isDetail}
                  placeholder="Ví dụ: 5000000"
                  onChange={(data) => {
                    setFromSalary(data);
                  }}
                />
              </Form.Item>
            </div>
            <div className="flex flex-col flex-1">
              <Form.Item
                label={
                  <p className="font-medium text-md">
                    Đến <span className="text-green-600">{toSalary ? `(${formatCurrency(toSalary)})` : undefined}</span>
                  </p>
                }
                name="maxSalary"
                initialValue={salaryRanges?.max}
              >
                <InputNumber
                  type="number"
                  className="w-full"
                  disabled={isDetail}
                  placeholder="Ví dụ: 10000000"
                  onChange={(data) => {
                    setToSalary(data);
                  }}
                />
              </Form.Item>
            </div>
          </div>
          <div className="px-10 -mt-3">
            <p className="text-[#828282]">* Nếu mức lương là Thoả thuận, hãy để trống 2 ô input</p>
            <p className="text-[#828282]">* Nếu mức lương là số cố định, hãy để mức lương ở 2 ô input bằng nhau</p>
          </div>
        </div>

        <div className="mt-2 mb-7">
          <p className="font-bold text-md">Thời gian làm việc</p>
          <Form.List name="workingHours" initialValue={workingHours}>
            {(fields, { add, remove }) => (
              <div className="mt-2 px-10">
                {fields.map(({ key, name, ...restField }) => (
                  <div key={key} className="flex items-center gap-5">
                    <div className="flex flex-col flex-1">
                      <Form.Item
                        {...restField}
                        label={<p className="font-medium text-md">Giờ bắt đầu</p>}
                        name={[name, 'start']}
                      >
                        <Input placeholder="Nhập theo định dạng HH:mm - ví dụ: 08:00" />
                      </Form.Item>
                    </div>
                    <div className="flex flex-col flex-1">
                      <Form.Item
                        {...restField}
                        label={<p className="font-medium text-md">Giờ kết thúc</p>}
                        name={[name, 'end']}
                      >
                        <Input placeholder="Nhập theo định dạng HH:mm - ví dụ: 17:00" />
                      </Form.Item>
                    </div>

                    <FaTrashAlt color="red" onClick={() => remove(name)} style={{ cursor: 'pointer' }} />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<FaPlus />}>
                    Thêm khung giờ
                  </Button>
                </Form.Item>
              </div>
            )}
          </Form.List>
          <div className="px-10 -mt-3">
            <p className="text-[#828282]">* Nếu thời gian Cụ thể, hãy thêm khung giờ</p>
            <p className="text-[#828282]">* Nếu thời gian là Thoả thuận, hãy để trống, xoá các khung giờ</p>
          </div>
        </div>

        <Form.Item
          label={<p className="font-bold text-md">Mô tả công việc</p>}
          name="jobDescription"
          initialValue={jobDescription}
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          {/* <FormEditor defaultValue={jobDescription} /> */}
          <Editor defaultValue={jobDescription} />
        </Form.Item>

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/recruitment" />
          </div>

          {!isDetail ? (
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="px-10"
                loading={loadingCreate || loadingUpdate}
              >
                <span className="font-semibold">{id ? 'Cập nhật' : 'Tạo mới'}</span>
              </Button>
            </Form.Item>
          ) : (
            <Link to={`/recruitment/${id}/edit`} onClick={() => window.scrollTo(0, 0)}>
              <span className="font-semibold px-10 py-3 bg-blue-500 text-white rounded-md duration-200 hover:bg-blue-600">
                Chỉnh sửa
              </span>
            </Link>
          )}
        </div>
      </Form>
    </div>
  );
};

export default RecruitmentCreate;
