// src/pages/products/products-create/products-create.jsx
import { ButtonBack } from '@/components/button';
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { FormSelectQuery } from '@/components/form';
import Editor from '../../../components/form/editor';
import FormItemUpload from '@/components/form/form-upload';
import {
  useCreateProducts,
  useQueryProductDetail,
  useUpdateProducts,
  useUpsertProductSiteConfig
} from '@/services/products.service';
import { API } from '@/utils/API';
import { formatCurrency, showToast } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input, InputNumber, Switch } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

const ProductsCreate = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { isPending: loadingCreate, mutate: createMutate } = useCreateProducts();
  const { isPending: loadingUpdate, mutate: updateMutate } = useUpdateProducts(id);
  const { isPending: loadingSiteConfig, mutate: upsertSiteConfig } = useUpsertProductSiteConfig(id);
  const { isLoading: loadingDetail, data: productsDetail, error: errorDetail } = useQueryProductDetail(id);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isFeaturedProduct, setIsFeaturedProduct] = useState(false);

  const {
    title,
    title_meta,
    description,
    imagesUrl,
    price,
    general_description,
    instruction,
    isFeatured,
    featuredThumbnail,
    category_id,
    category,
    kiotViet,
    price_on,
    hasSiteConfig
  } = productsDetail || {};

  const onFinish = useCallback(
    (values) => {
      const {
        title: formTitle,
        title_meta: formTitleMeta,
        price: formPrice,
        categoryId,
        description: formDescription,
        imagesUrl: formImagesUrl,
        instruction: formInstruction,
        isFeatured: formIsFeatured,
        featuredThumbnail: formFeaturedThumbnail,
        general_description: formGeneralDescription,
        price_on: formPriceOn
      } = values || {};

      const extractedCategoryId = categoryId?.value ?? categoryId ?? null;

      const fileList = Array.isArray(formImagesUrl) ? formImagesUrl : formImagesUrl?.fileList || [];
      const featuredFileList = Array.isArray(formFeaturedThumbnail)
        ? formFeaturedThumbnail
        : formFeaturedThumbnail?.fileList || [];

      Promise.all(
        [...fileList, ...featuredFileList].map(async (item) => {
          if (item.url) return item.url;
          if (!item?.originFileObj) return null;

          const formData = new FormData();
          formData.append('file', item?.originFileObj);
          return await API.request({
            url: '/api/file/upload',
            method: 'POST',
            params: formData,
            isUpload: true,
            headers: { 'X-Force-Signature': import.meta.env.VITE_API_KEY }
          });
        })
      )
        .then((uploadResults) => {
          const filteredResults = uploadResults.filter(Boolean);
          let productImagesUrl = [];
          let featuredImageUrl = null;

          if (!featuredFileList?.length) {
            productImagesUrl = filteredResults;
          } else {
            featuredImageUrl = filteredResults[filteredResults.length - 1];
            productImagesUrl = filteredResults.slice(0, -1);
          }

          if (id) {
            // ============================
            // EDIT MODE: 2 lần gọi API
            // 1) Shared fields → PATCH /api/product/:id
            // 2) Per-site fields → PATCH /api/product/:id/site-config
            // ============================

            // 1) Update shared fields
            const sharedData = {
              title: formTitle,
              images_url: productImagesUrl,
              kiotviet_price: Number(formPrice) > 0 ? formPrice : null,
              price_on: formPriceOn
            };

            updateMutate(sharedData, {
              onSuccess: () => {
                // 2) Update per-site config
                const siteConfigData = {
                  title_meta: formTitleMeta,
                  description: formDescription,
                  general_description: formGeneralDescription,
                  instruction: formInstruction,
                  is_featured: formIsFeatured,
                  is_visible: true,
                  featured_thumbnail: formIsFeatured ? featuredImageUrl : null,
                  category_id: extractedCategoryId
                };

                upsertSiteConfig(siteConfigData);
              }
            });
          } else {
            // ============================
            // CREATE MODE: tạo product rồi upsert site config
            // ============================
            const data = {
              title: formTitle,
              title_meta: formTitleMeta,
              price: Number(formPrice) > 0 ? formPrice : null,
              description: formDescription,
              images_url: productImagesUrl,
              general_description: formGeneralDescription,
              instruction: formInstruction,
              is_featured: formIsFeatured,
              price_on: formPriceOn,
              featured_thumbnail: formIsFeatured ? featuredImageUrl : null,
              categoryIds: extractedCategoryId ? [extractedCategoryId] : []
            };

            createMutate(data);
          }
        })
        .catch((error) => {
          showToast({ type: 'error', message: `Upload failed: ${error.message}` });
        });
    },
    [createMutate, updateMutate, upsertSiteConfig, id]
  );

  useEffect(() => {
    if (productsDetail && !loadingDetail) {
      const categoryValue = category && category.name ? { value: category_id, label: category.name } : undefined;

      form.setFieldsValue({
        title,
        title_meta,
        general_description,
        categoryId: categoryValue,
        price: price || kiotViet?.price || 0,
        description,
        instruction,
        isFeatured: isFeatured || false,
        price_on: price_on || false
      });

      setCurrentPrice(price || kiotViet?.price || 0);
      setIsFeaturedProduct(isFeatured || false);
    }
  }, [productsDetail, loadingDetail, form]);

  if (id && loadingDetail) return <LoadingScreen className="mt-20" />;
  if (id && errorDetail) return <ErrorScreen message={errorDetail?.message} className="mt-20" />;

  const arrayImageUrl = Array.isArray(imagesUrl) ? imagesUrl : [];
  const FormUpload = FormItemUpload;

  const defaultFileList =
    arrayImageUrl.length > 0 ? arrayImageUrl.map((i) => ({ type: 'image/*', url: i, uid: i, name: '' })) : undefined;

  const initFeaturedImage = featuredThumbnail ? { name: '', url: featuredThumbnail } : undefined;
  const defaultFeaturedImage = featuredThumbnail
    ? { type: 'image/*', url: featuredThumbnail, uid: featuredThumbnail, name: '' }
    : undefined;

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[65%] mx-auto">
      <Helmet>
        <title>
          {id ? 'Cập nhật' : 'Tạo'} sản phẩm | {WEBSITE_NAME}
        </title>
      </Helmet>

      <Form
        form={form}
        name="productForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        className="my-10"
      >
        <Form.Item
          label={<p className="font-bold text-md">Tên sản phẩm</p>}
          name="title"
          initialValue={title}
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          className="mb-10"
        >
          <Input className="py-2" />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Title Meta</p>}
          name="title_meta"
          initialValue={title_meta}
          rules={[{ required: true, message: 'Vui lòng nhập title meta sản phẩm' }]}
          className="mb-10"
        >
          <Input className="py-2" />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Meta description</p>}
          name="general_description"
          initialValue={general_description}
          rules={[{ required: false }]}
          className="mb-10"
        >
          <Input.TextArea rows={2} className="py-2" />
        </Form.Item>

        <FormSelectQuery
          allowClear
          label="Danh mục"
          labelKey="displayName"
          valueKey="id"
          name="categoryId"
          request={{ url: '/api/category/for-cms' }}
          placeholder="Chọn danh mục sản phẩm..."
          initialValue={category_id}
        />

        <Form.Item
          label={<p className="font-bold text-md">Giá sản phẩm (VND)</p>}
          name="price"
          initialValue={price}
          className="mt-10 mb-0"
        >
          <InputNumber type="number" className="py-1 w-full" onChange={(data) => setCurrentPrice(data || 0)} />
        </Form.Item>

        <p className="mt-0.5 ml-2 mb-10">{formatCurrency(currentPrice)}</p>

        <Form.Item
          label={<p className="font-bold text-md">Hiển thị "Liên hệ"</p>}
          name="price_on"
          valuePropName="checked"
          initialValue={price_on || false}
        >
          <Switch />
        </Form.Item>

        <FormUpload
          name="imagesUrl"
          label="Hình sản phẩm"
          maxCount={10}
          accept="image/*"
          multiple
          defaultFileList={defaultFileList}
        />

        <Form.Item
          label={<p className="font-bold text-md">Sản phẩm nổi bật</p>}
          name="isFeatured"
          valuePropName="checked"
          initialValue={isFeatured || false}
        >
          <Switch onChange={(checked) => setIsFeaturedProduct(checked)} />
        </Form.Item>

        {isFeaturedProduct && (
          <FormUpload
            name="featuredThumbnail"
            label="Ảnh nổi bật"
            maxCount={1}
            accept="image/*"
            initialValue={initFeaturedImage}
            defaultFileList={defaultFeaturedImage ? [defaultFeaturedImage] : undefined}
          />
        )}

        <Form.Item
          label={<p className="font-bold text-md">Nội dung mô tả</p>}
          name="description"
          initialValue={description}
        >
          <Editor />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Hướng dẫn sử dụng</p>}
          name="instruction"
          initialValue={instruction}
        >
          <Editor />
        </Form.Item>

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/products" />
          </div>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="px-10"
              loading={loadingCreate || loadingUpdate || loadingSiteConfig}
            >
              <span className="font-semibold">{id ? 'Cập nhật' : 'Tạo mới'}</span>
            </Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
};

export default ProductsCreate;
