// src/pages/category/category-edit/category-edit.jsx - FIX PRIORITY FIELD
import { ButtonBack } from '@/components/button';
import { LoadingScreen } from '@/components/effect-screen';
import { FormSelectQuery } from '@/components/form';
import { useQueryCategoryDetail, useUpdateCategory } from '@/services/category.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input, InputNumber } from 'antd'; // ✅ Import InputNumber
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
    // ✅ Transform data để đảm bảo types đúng
    const transformedValues = {
      ...values,
      priority: values.priority ? Number(values.priority) : 0,
      parent_id: values.parent_id ? Number(values.parent_id) : undefined
    };

    console.log('Updating with data:', transformedValues); // Debug log
    updateMutate(transformedValues);
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
        <Form.Item
          label={<p className="font-bold text-md">Tên danh mục</p>}
          name="name"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
        >
          <Input className="py-2" placeholder="Nhập tên danh mục" />
        </Form.Item>

        <Form.Item label={<p className="font-bold text-md">Mô tả danh mục</p>} name="description">
          <TextArea className="py-2" placeholder="Nhập mô tả cho danh mục" rows={4} />
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
            placeholder="Nhập số thứ tự"
            min={0}
            precision={0}
            style={{ width: '100%' }}
          />
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
