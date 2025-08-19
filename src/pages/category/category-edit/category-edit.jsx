// src/pages/category/category-edit/category-edit.jsx - Thay thế hoàn toàn
import { ButtonBack } from '@/components/button';
import { LoadingScreen } from '@/components/effect-screen';
import { FormSelectQuery } from '@/components/form';
import { useQueryCategoryDetail, useUpdateCategory } from '@/services/category.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const CategoryEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { data: categoryData, isLoading } = useQueryCategoryDetail(id);
  const { mutate: updateMutate, isPending } = useUpdateCategory(id);

  const onFinish = (values) => {
    updateMutate(values);
  };

  useEffect(() => {
    if (categoryData) {
      form.setFieldsValue({
        name: categoryData.name,
        description: categoryData.description,
        parent_id: categoryData.parent_id,
        priority: categoryData.priority || 0
      });
    }
  }, [categoryData, form]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[45%] mx-auto">
      <Helmet>
        <title>Chỉnh sửa danh mục | {WEBSITE_NAME}</title>
      </Helmet>

      <Form
        form={form}
        name="categoryEditForm"
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
          <TextArea className="py-2" placeholder="Nhập mô tả cho danh mục" rows={4} />
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
        <Form.Item label={<p className="font-bold text-md">Thứ tự hiển thị</p>} name="priority">
          <Input type="number" className="py-2" placeholder="Nhập số thứ tự" />
        </Form.Item>

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/categories" />
          </div>

          <Button type="primary" htmlType="submit" size="large" className="px-10" loading={isPending}>
            <span className="font-semibold">Cập nhật danh mục</span>
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CategoryEdit;
