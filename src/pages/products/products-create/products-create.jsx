import { ButtonBack } from '@/components/button';
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { FormSelectQuery } from '@/components/form';
// import Editor from '../../../components/form/editor';
import QuillEditor from '@/components/form/quill-editor';
import FormItemUpload from '@/components/form/form-upload';
import { useCreateProducts, useQueryProductDetail, useUpdateProducts } from '@/services/products.service';
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
  const { isLoading: loadingDetail, data: productsDetail, error: errorDetail } = useQueryProductDetail(id);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isFeaturedProduct, setIsFeaturedProduct] = useState(false);

  const {
    title,
    title_meta,
    description,
    imagesUrl,
    price,
    ofCategories,
    general_description,
    instruction,
    isFeatured,
    featuredThumbnail,
    category_id,
    category,
    kiotViet
  } = productsDetail || {};

  const onFinish = useCallback(
    (values) => {
      const {
        title,
        title_meta,
        price,
        categoryId,
        description,
        imagesUrl,
        instruction,
        isFeatured,
        featuredThumbnail,
        general_description
      } = values || {};

      const extractedCategoryId = categoryId?.value ?? categoryId ?? null;

      const fileList = Array.isArray(imagesUrl) ? imagesUrl : imagesUrl?.fileList || [];
      const featuredFileList = Array.isArray(featuredThumbnail) ? featuredThumbnail : featuredThumbnail?.fileList || [];

      Promise.all(
        [...fileList, ...featuredFileList].map(async (item) => {
          if (item.url) {
            return item.url;
          }

          if (!item?.originFileObj) {
            return null;
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

          const data = {
            title,
            title_meta,
            price: Number(price) && Number(price) > 0 ? price : null,
            description,
            images_url: productImagesUrl,
            general_description,
            instruction,
            is_featured: isFeatured,
            featured_thumbnail: isFeatured ? featuredImageUrl : null,
            categoryIds: extractedCategoryId ? [extractedCategoryId] : []
          };

          id ? updateMutate(data) : createMutate(data);
        })
        .catch((error) => {
          showToast({
            type: 'error',
            message: `Upload failed: ${error.message}`
          });
        });
    },
    [createMutate, updateMutate, id]
  );

  useEffect(() => {
    if (productsDetail && !loadingDetail) {
      const categoryValue =
        category && category.name
          ? {
              label: category.name,
              value: category.id
            }
          : null;

      form.setFieldsValue({
        title: title,
        title_meta: title_meta,
        general_description: general_description,
        categoryId: categoryValue,
        price: price,
        isFeatured: isFeatured,
        description: description,
        instruction: instruction
      });

      setCurrentPrice(price || 0);
      setIsFeaturedProduct(isFeatured || false);
    }
  }, [
    productsDetail,
    loadingDetail,
    form,
    title,
    title_meta,
    general_description,
    category_id,
    ofCategories,
    price,
    isFeatured,
    description,
    instruction,
    category
  ]);

  useEffect(() => {
    if (id && productsDetail) {
      setCurrentPrice(productsDetail?.price);
    }
  }, [id, productsDetail]);

  useEffect(() => {
    setIsFeaturedProduct(isFeatured);
  }, [isFeatured]);

  if (loadingDetail) {
    return <LoadingScreen className="mt-20" />;
  }

  if (errorDetail) {
    return <ErrorScreen message={errorDetail?.message} className="mt-20" />;
  }

  const arrayImageUrl = imagesUrl && imagesUrl.length > 0 ? imagesUrl : [];

  const initialImages = arrayImageUrl.length > 0 ? arrayImageUrl.map((i) => ({ name: '', url: i })) : undefined;

  const defaultImages =
    arrayImageUrl.length > 0
      ? arrayImageUrl.map((i) => ({
          type: 'image/*',
          url: i,
          uid: i,
          name: ''
        }))
      : undefined;

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
          rules={[{ required: false, message: 'Vui lòng nhập meta description' }]}
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
          request={{
            url: '/api/category/for-cms'
          }}
          placeholder="Chọn danh mục sản phẩm..."
          initialValue={category_id}
          // fixedOptions={(inputValue, option) => {
          //   return option.id !== parseInt(id);
          // }}
        />

        <Form.Item
          label={<p className="font-bold text-md">Giá sản phẩm (VND)</p>}
          name="price"
          initialValue={price}
          className="mt-10 mb-0"
        >
          <InputNumber
            type="number"
            className="py-1 w-full"
            onChange={(data) => {
              setCurrentPrice(data || 0);
            }}
          />
        </Form.Item>
        <p className="mt-0.5 ml-2 mb-10">{formatCurrency(currentPrice)}</p>

        {/* <Form.Item
          label={<p className="font-bold text-md">Số lượng trong kho</p>}
          name="quantity"
          initialValue={quantity}
          className="mb-10"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        >
          <InputNumber type="number" className="py-1 w-full" />
        </Form.Item> */}

        <div className="w-60 mb-10">
          <FormItemUpload
            name="imagesUrl"
            label="Ảnh sản phẩm"
            multiple
            accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG, .WEBP"
            initialValue={initialImages}
            defaultFileList={defaultImages}
            maxCount={10}
          />
        </div>

        <Form.Item
          label={<p className="font-bold text-md">Sản phẩm nổi bật</p>}
          name="isFeatured"
          initialValue={isFeatured}
          valuePropName="checked"
          className="mb-10"
        >
          <Switch onChange={(e) => setIsFeaturedProduct(e)} />
        </Form.Item>

        {!!isFeaturedProduct && (
          <div className="w-60 mb-10">
            <FormItemUpload
              name="featuredThumbnail"
              multiple
              label="Ảnh sản phẩm nổi bật"
              accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG, .WEBP"
              initialValue={initFeaturedImage ? [initFeaturedImage] : undefined}
              defaultFileList={defaultFeaturedImage ? [defaultFeaturedImage] : undefined}
              maxCount={1}
            />
          </div>
        )}

        <Form.Item
          label={<p className="font-bold text-md">Mô tả chung (Nằm ngay dưới title)</p>}
          name="description"
          initialValue={description}
          className="mb-10"
          rules={[{ required: false, message: 'Vui lòng điền thông tin' }]}
        >
          {/* <FormEditor defaultValue={description} /> */}
          <QuillEditor defaultValue={description} />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Thông tin sản phẩm (Thông tin dài)</p>}
          name="instruction"
          initialValue={instruction}
          className="mb-10"
          rules={[{ required: false, message: 'Vui lòng điền thông tin' }]}
        >
          {/* <FormEditor defaultValue={instruction} /> */}
          <QuillEditor defaultValue={instruction} />
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

export default ProductsCreate;
