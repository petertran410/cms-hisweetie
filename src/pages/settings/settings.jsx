import {
  useQueryParentCategories,
  useQueryMenuCategoryConfig,
  useUpdateMenuCategory
} from '@/services/site-config.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Select, Spin } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const SettingsPage = () => {
  const [form] = Form.useForm();

  const { data: parentCategories = [], isLoading: loadingParents } = useQueryParentCategories();
  const { data: menuConfig, isLoading: loadingConfig } = useQueryMenuCategoryConfig();
  const { mutate: updateMutate, isPending } = useUpdateMenuCategory();

  // Slug đang chọn trên form (theo dõi realtime).
  const selectedSlug = Form.useWatch('slug', form);
  // Slug đã lưu (giá trị hiện tại trong DB).
  const savedSlug = menuConfig?.slug || null;
  // Nút mờ khi: chưa chọn gì, hoặc lựa chọn không khác giá trị đã lưu.
  const isUnchanged = !selectedSlug || selectedSlug === savedSlug;

  // Đổ giá trị hiện tại vào form khi load xong config.
  useEffect(() => {
    if (menuConfig?.slug) {
      form.setFieldsValue({ slug: menuConfig.slug });
    }
  }, [menuConfig, form]);

  const onFinish = (values) => {
    const slug = (values.slug || '').trim();
    if (!slug) {
      form.setFields([{ name: 'slug', errors: ['Vui lòng chọn danh mục'] }]);
      return;
    }
    updateMutate({ slug });
  };

  const categoryOptions = parentCategories.map((c) => ({
    value: c.slug,
    label: c.name
  }));

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[45%] mx-auto">
      <Helmet>
        <title>Cấu hình | {WEBSITE_NAME}</title>
      </Helmet>

      <h1 className="text-2xl font-bold mt-6">Cấu hình menu sản phẩm</h1>
      <p className="text-gray-500 mt-1">
        Chọn danh mục cha hiển thị trên menu &quot;Sản phẩm&quot; của website. Menu sẽ đổ các danh mục con trực tiếp của
        danh mục được chọn.
      </p>

      {loadingConfig || loadingParents ? (
        <div className="flex justify-center mt-20">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          name="settingsMenuForm"
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          onFinish={onFinish}
          autoComplete="off"
          className="mt-10"
        >
          <Form.Item
            label={<p className="font-bold text-md">Danh mục menu</p>}
            name="slug"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          >
            <Select
              options={categoryOptions}
              placeholder="Chọn danh mục cha"
              className="h-[38px]"
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <div className="flex items-center gap-8 mt-20 justify-center">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="px-10"
              loading={isPending}
              disabled={isUnchanged}
            >
              <span className="font-semibold">Lưu cấu hình</span>
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default SettingsPage;
