import { ButtonBack } from '@/components/button';
import { LoadingScreen } from '@/components/effect-screen';
import { FormSelectQuery, FormUpload } from '@/components/form';
import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { useQueryCategoryDetail, useUpdateCategory } from '@/services/category.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input, InputNumber } from 'antd';
import { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const CategoryEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { data: categoryData, isLoading } = useQueryCategoryDetail(id);
  const { mutate: updateMutate, isPending } = useUpdateCategory(id);

  console.log(categoryData);

  const defaultImageFile = categoryData?.image_url
    ? [
        {
          type: 'image/*',
          url: categoryData.image_url,
          uid: categoryData.image_url,
          name: ''
        }
      ]
    : undefined;

  const onFinish = useCallback(
    async (values) => {
      const { image_url } = values;

      let uploadedImageUrl = null;

      if (image_url?.fileList?.length > 0) {
        const file = image_url.fileList[0];

        if (file.url) {
          uploadedImageUrl = file.url;
        } else if (file.originFileObj) {
          const formData = new FormData();
          formData.append('file', file.originFileObj);

          try {
            uploadedImageUrl = await API.request({
              url: '/api/file/upload',
              method: 'POST',
              params: formData,
              isUpload: true,
              headers: {
                'X-Force-Signature': import.meta.env.VITE_API_KEY
              }
            });
          } catch (error) {
            showToast({ type: 'error', message: `Upload failed: ${error.message}` });
            return;
          }
        }
      }

      const transformedValues = {
        ...values,
        priority: values.priority ? Number(values.priority) : 0,
        parent_id: values.parent_id?.value ?? values.parent_id ?? null,
        image_url: uploadedImageUrl
      };

      console.log('Updating with data:', transformedValues);
      updateMutate(transformedValues);
    },
    [updateMutate]
  );

  useEffect(() => {
    if (categoryData) {
      const parentValue =
        categoryData.parent_id && categoryData.parent_name
          ? {
              label: categoryData.parent_name,
              value: categoryData.parent_id
            }
          : null;

      const imageFileList = categoryData.image_url
        ? [{ url: categoryData.image_url, uid: categoryData.image_url, name: '' }]
        : [];

      form.setFieldsValue({
        name: categoryData.name,
        name_en: categoryData.name_en,
        title_meta: categoryData.title_meta,
        description: categoryData.description,
        parent_id: parentValue,
        priority: categoryData.priority || 0,
        image_url: imageFileList.length > 0 ? { fileList: imageFileList } : undefined
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

        <Form.Item
          label={<p className="font-bold text-md">Tên danh mục (English)</p>}
          name="name_en"
          rules={[{ required: false, message: 'Vui lòng nhập tên danh mục (English)' }]}
        >
          <Input className="py-2" placeholder="Nhập tên danh mục (English)" />
        </Form.Item>

        <Form.Item label={<p className="font-bold text-md">Title Meta</p>} name="title_meta">
          <TextArea className="py-2" placeholder="Nhập mô tả title meta cho danh mục (không bắt buộc)" rows={4} />
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
          filterOption={(inputValue, option) => {
            return option.id !== parseInt(id);
          }}
        />

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
        <div className="w-60 mb-10">
          <FormUpload
            name="image_url"
            label="Hình ảnh danh mục"
            accept="image/*"
            maxCount={1}
            multiple={false}
            defaultFileList={defaultImageFile}
          />
        </div>

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
