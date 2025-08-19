// src/pages/category/category-create/category-create.jsx - Thay thế hoàn toàn
import { ButtonBack } from '@/components/button';
import { FormSelectQuery } from '@/components/form';
import { useCreateCategory } from '@/services/category.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input } from 'antd';
import { Helmet } from 'react-helmet';

const { TextArea } = Input;

const CategoryCreate = () => {
  const [form] = Form.useForm();
  const { mutate: createMutate, isPending } = useCreateCategory();

  const onFinish = (values) => {
    createMutate(values);
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
      >
        {/* ✅ Sử dụng Form.Item với Input thay vì FormInput */}
        <Form.Item
          label={<p className="font-bold text-md">Tên danh mục</p>}
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input className="py-2" placeholder="Nhập tên danh mục" />
        </Form.Item>

        {/* ✅ Sử dụng Form.Item với TextArea thay vì FormTextArea */}
        <Form.Item label={<p className="font-bold text-md">Mô tả danh mục</p>} name="description">
          <TextArea className="py-2" placeholder="Nhập mô tả cho danh mục (không bắt buộc)" rows={4} />
        </Form.Item>

        {/* ✅ FormSelectQuery vẫn giữ nguyên */}
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

        {/* ✅ Sử dụng Form.Item với Input number */}
        <Form.Item label={<p className="font-bold text-md">Thứ tự hiển thị</p>} name="priority" initialValue={0}>
          <Input type="number" className="py-2" placeholder="Nhập số thứ tự (0 = hiển thị đầu tiên)" />
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
