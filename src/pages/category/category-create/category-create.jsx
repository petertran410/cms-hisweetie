import { ButtonBack } from '@/components/button';
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { FormSelectQuery } from '@/components/form';
import FormItemUpload from '@/components/form/form-upload';
import { useCreateCategory, useQueryCategoryDetail, useUpdateCategory } from '@/services/category.service';
import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input } from 'antd';
import { useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

const CategoryCreate = () => {
  const { id } = useParams();
  const { isPending: loadingCreate, mutate: createMutate } = useCreateCategory();
  const { isPending: loadingUpdate, mutate: updateMutate } = useUpdateCategory(id);
  const { isLoading: loadingDetail, data: categoryDetail, error: errorDetail } = useQueryCategoryDetail(id);

  const onFinish = useCallback(
    (values) => {
      const { name, parentId, description, imagesUrl } = values;
      const fileData = imagesUrl?.fileList || [];
      const fileList = fileData?.[fileData.length - 1] ? [fileData?.[fileData.length - 1]] : [];

      Promise.all(
        fileList.map(async (item) => {
          if (item.url) {
            return item.url;
          }

          const formData = new FormData();
          formData.append('file', item?.originFileObj);
          return await API.request({
            url: '/api/file/upload',
            method: 'POST',
            params: formData,
            isUpload: true,
            headers: {
              'X-Force-Signature': import.meta.env.VITE_API_KEY
            }
          });
        })
      )
        .then((imagesUrl) => {
          const data = { name, description, imagesUrl, parentId: !id ? parentId?.value : undefined };
          id ? updateMutate(data) : createMutate(data);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Tải ảnh danh mục thất bại. ${e.message}` });
        });
    },
    [createMutate, updateMutate, id]
  );

  if (loadingDetail) {
    return <LoadingScreen className="mt-20" />;
  }

  if (errorDetail) {
    return <ErrorScreen message={errorDetail?.message} className="mt-20" />;
  }

  const { name, parentId, parentName, description, imagesUrl } = categoryDetail || {};
  const initParent = {
    label: parentName,
    value: parentId
  };
  const initialImages = Array.isArray(imagesUrl) ? imagesUrl.map((i) => ({ name: '', url: i })) : undefined;

  const defaultImages = Array.isArray(imagesUrl)
    ? imagesUrl.map((i) => ({
        type: 'image/*',
        url: i,
        uid: i,
        name: ''
      }))
    : undefined;

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[45%] mx-auto">
      <Helmet>
        <title>
          {id ? 'Cập nhật' : 'Tạo'} danh mục | {WEBSITE_NAME}
        </title>
      </Helmet>

      <Form
        name="loginForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        className="mt-10"
      >
        <Form.Item
          label={<p className="font-bold text-md">Tên danh mục</p>}
          name="name"
          initialValue={name}
          rules={[{ required: true, message: 'Vui lòng nhập thông tin' }]}
        >
          <Input className="py-2" />
        </Form.Item>

        <FormSelectQuery
          disabled={!!id}
          initialValue={initParent}
          allowClear
          label="Danh mục cha"
          labelKey="name"
          valueKey="id"
          name="parentId"
          request={{
            url: '/api/category/v2/get-all'
          }}
        />

        <FormItemUpload
          name="imagesUrl"
          label="Ảnh danh mục"
          accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG"
          initialValue={initialImages}
          defaultFileList={defaultImages}
        />

        <Form.Item
          label={<p className="font-bold text-md">Mô tả</p>}
          name="description"
          initialValue={description}
          rules={[{ required: true, message: 'Vui lòng nhập thông tin' }]}
        >
          <Input.TextArea rows={10} className="py-2" />
        </Form.Item>

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/categories" />
          </div>

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
        </div>
      </Form>
    </div>
  );
};

export default CategoryCreate;
