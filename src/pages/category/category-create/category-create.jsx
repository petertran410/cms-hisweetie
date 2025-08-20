import { ButtonBack } from '@/components/button';
import { FormSelectQuery } from '@/components/form';
import { useCreateCategory } from '@/services/category.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input, InputNumber } from 'antd';
import { Helmet } from 'react-helmet';

const { TextArea } = Input;

const CategoryCreate = () => {
  const [form] = Form.useForm();
  const { mutate: createMutate, isPending } = useCreateCategory();

  const onFinish = (values) => {
    const transformedValues = {
      ...values,
      priority: values.priority ? Number(values.priority) : 0,
      parent_id: values.parent_id?.value ?? values.parent_id ?? null
    };

    console.log('Sending data:', transformedValues);
    createMutate(transformedValues);
  };

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[45%] mx-auto">
      <Helmet>
        <title>Tạo danh mục mới | {WEBSITE_NAME}</title>
      </Helmet>

      <Form
        form={form}
        name="categoryCreateForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
        autoComplete="off"
        className="mt-10"
        initialValues={{
          priority: 0 // ✅ Set default value
        }}
      >
        <Form.Item
          label={<p className="font-bold text-md">Tên danh mục</p>}
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input className="py-2" placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item label={<p className="font-bold text-md">Mô tả danh mục</p>} name="description">
          <TextArea className="py-2" placeholder="Nhập mô tả cho danh mục (không bắt buộc)" rows={4} />
        </Form.Item>

        <FormSelectQuery
          allowClear
          label="Danh mục cha"
          labelKey="displayName"
          valueKey="id"
          name="parent_id"
          request={{
            url: '/api/category/for-cms'
          }}
          placeholder="Chọn danh mục cha (để trống nếu là danh mục gốc)"
        />

        {/* ✅ SỬA: Sử dụng InputNumber thay vì Input type="number" */}
        <Form.Item
          label={<p className="font-bold text-md">Thứ tự hiển thị</p>}
          name="priority"
          rules={[
            {
              type: 'number',
              min: 0,
              message: 'Thứ tự phải là số nguyên dương hoặc 0'
            }
          ]}
        >
          <InputNumber
            className="py-2 w-full"
            placeholder="Nhập số thứ tự (0 = hiển thị đầu tiên)"
            min={0}
            precision={0} // Chỉ cho phép số nguyên
            style={{ width: '100%' }}
          />
        </Form.Item>

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/categories" />
          </div>

          <Button type="primary" htmlType="submit" size="large" className="px-10" loading={isPending}>
            <span className="font-semibold">Tạo danh mục</span>
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CategoryCreate;
