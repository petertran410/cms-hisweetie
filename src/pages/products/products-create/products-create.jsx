import { ButtonBack } from '@/components/button';
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { FormSelectQuery } from '@/components/form';
import Editor from '@/components/form/editor';
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
    description,
    imagesUrl,
    price,
    quantity,
    ofCategories,
    generalDescription,
    instruction,
    isFeatured,
    featuredThumbnail
  } = productsDetail || {};

  const onFinish = useCallback(
    (values) => {
      const {
        title,
        price,
        quantity,
        categoryId,
        description,
        imagesUrl,
        generalDescription,
        instruction,
        isFeatured,
        featuredThumbnail
      } = values || {};
      const fileList = Array.isArray(imagesUrl) ? imagesUrl : imagesUrl?.fileList || [];
      const featuredFileList = Array.isArray(featuredThumbnail) ? featuredThumbnail : featuredThumbnail?.fileList || [];

      Promise.all(
        [...fileList, ...featuredFileList].map(async (item) => {
          if (item.url) {
            return item.url;
          }

          if (!item?.originFileObj) {
            return null; // Skip if there's no file
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
        .then((imagesUrlData) => {
          let imagesUrl = [];
          let featuredImageUrl = null;

          if (!featuredFileList?.length) {
            imagesUrl = imagesUrlData;
          } else {
            featuredImageUrl = imagesUrlData?.[imagesUrlData?.length - 1];
            imagesUrl = imagesUrlData?.slice(0, -1);
          }

          const data = {
            title,
            price: Number(price) && Number(price) > 0 ? price : null,
            quantity,
            categoryIds: [categoryId?.value],
            description,
            imagesUrl,
            generalDescription,
            instruction,
            isFeatured,
            featuredThumbnail: isFeatured ? featuredImageUrl : null,
            type: 'SAN_PHAM'
          };

          id ? updateMutate(data) : createMutate(data);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Tải ảnh sản phẩm thất bại. ${e.message}` });
        });
    },
    [createMutate, updateMutate, id]
  );

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

  const initCategory = ofCategories?.map((i) => ({ label: i.name, value: i.id }))?.[0];

  const initialImages = Array.isArray(imagesUrl) ? imagesUrl.map((i) => ({ name: '', url: i })) : undefined;

  const defaultImages = Array.isArray(imagesUrl)
    ? imagesUrl.map((i) => ({
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
          label={<p className="font-bold text-md">Mô tả chung</p>}
          name="generalDescription"
          initialValue={generalDescription}
          rules={[{ required: true, message: 'Vui lòng nhập mô tả chung' }]}
          className="mb-10"
        >
          <Input.TextArea rows={2} className="py-2" />
        </Form.Item>

        <FormSelectQuery
          allowClear
          initialValue={initCategory}
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          label="Danh mục"
          labelKey="name"
          valueKey="id"
          name="categoryId"
          request={{
            url: '/api/category/v2/get-all'
          }}
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

        <Form.Item
          label={<p className="font-bold text-md">Số lượng trong kho</p>}
          name="quantity"
          initialValue={quantity}
          className="mb-10"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        >
          <InputNumber type="number" className="py-1 w-full" />
        </Form.Item>

        <div className="w-60 mb-10">
          <FormItemUpload
            name="imagesUrl"
            label="Ảnh sản phẩm"
            multiple
            accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG"
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
              accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG"
              initialValue={initFeaturedImage ? [initFeaturedImage] : undefined}
              defaultFileList={defaultFeaturedImage ? [defaultFeaturedImage] : undefined}
              maxCount={1}
            />
          </div>
        )}

        <Form.Item
          label={<p className="font-bold text-md">Thành phần nguyên liệu</p>}
          name="description"
          initialValue={description}
          className="mb-10"
          rules={[{ required: true, message: 'Vui lòng điền thông tin' }]}
        >
          {/* <FormEditor defaultValue={description} /> */}
          <Editor defaultValue={description} />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Hướng dẫn sử dụng</p>}
          name="instruction"
          initialValue={instruction}
          className="mb-10"
          rules={[{ required: true, message: 'Vui lòng điền thông tin' }]}
        >
          {/* <FormEditor defaultValue={instruction} /> */}
          <Editor defaultValue={instruction} />
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
