// src/pages/category/category-edit/category-edit.jsx
import { ButtonBack } from '@/components/button';
import { LoadingScreen } from '@/components/effect-screen';
import { FormInput, FormSelectQuery, FormTextArea } from '@/components/form';
import { useQueryCategoryDetail, useUpdateCategory } from '@/services/category.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

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
        <FormInput
          label="Tên danh mục"
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          placeholder="Nhập tên danh mục"
        />

        <FormTextArea label="Mô tả danh mục" name="description" placeholder="Nhập mô tả cho danh mục" rows={4} />

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

        <FormInput label="Thứ tự hiển thị" name="priority" type="number" placeholder="Nhập số thứ tự" />

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
