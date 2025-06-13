import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Form, Input, InputNumber, Switch, Button, message, Card, Divider, Tooltip } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined, StarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { FormUpload } from '../../../components/form/form-upload';
import { FormSelectQuery } from '../../../components/form/form-select-query';
import { formatCurrency } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { useQueryProductDetail, useCreateProduct, useUpdateProduct } from '@/services/products.service';

const ProductsCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [form] = Form.useForm();
  const [currentPrice, setCurrentPrice] = useState(0);
  const [isFeaturedProduct, setIsFeaturedProduct] = useState(false);
  const [isVisibleProduct, setIsVisibleProduct] = useState(false); // NEW STATE

  // Query product details for editing
  const { data: productData, isLoading: loadingProduct } = useQueryProductDetail(id, {
    enabled: isEdit
  });

  // Mutations
  const { mutate: createProduct, isPending: creatingProduct } = useCreateProduct();
  const { mutate: updateProduct, isPending: updatingProduct } = useUpdateProduct();

  // Extract product data
  const {
    title,
    generalDescription,
    price,
    quantity,
    imagesUrl,
    isFeatured,
    isVisible, // NEW FIELD
    featuredThumbnail,
    recipeThumbnail,
    description,
    instruction,
    type,
    ofCategories
  } = productData || {};

  // Set initial values when editing
  useEffect(() => {
    if (isEdit && productData) {
      setCurrentPrice(price || 0);
      setIsFeaturedProduct(isFeatured || false);
      setIsVisibleProduct(isVisible || false); // NEW STATE SETTER
    }
  }, [isEdit, productData, price, isFeatured, isVisible]);

  // Handle form submission
  const onFinish = (values) => {
    const formData = {
      ...values,
      isFeatured: isFeaturedProduct,
      isVisible: isVisibleProduct, // NEW FIELD
      categoryIds: values.categoryId ? [values.categoryId] : []
    };

    if (isEdit) {
      updateProduct(
        { id: parseInt(id), ...formData },
        {
          onSuccess: () => {
            message.success('Cập nhật sản phẩm thành công!');
            navigate('/products');
          },
          onError: (error) => {
            message.error('Cập nhật sản phẩm thất bại: ' + error.message);
          }
        }
      );
    } else {
      createProduct(formData, {
        onSuccess: () => {
          message.success('Tạo sản phẩm thành công!');
          navigate('/products');
        },
        onError: (error) => {
          message.error('Tạo sản phẩm thất bại: ' + error.message);
        }
      });
    }
  };

  // Prepare initial values for form
  const initCategory =
    ofCategories && ofCategories.length > 0 ? { label: ofCategories[0].name, value: ofCategories[0].id } : undefined;

  const initialImages = imagesUrl
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
        {/* Basic Information Card */}
        <Card title="Thông tin cơ bản" className="mb-6">
          <Form.Item
            label={<p className="font-bold text-md">Tên sản phẩm</p>}
            name="title"
            initialValue={title}
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
            className="mb-4"
          >
            <Input className="py-2" placeholder="Nhập tên sản phẩm" />
          </Form.Item>

          <Form.Item
            label={<p className="font-bold text-md">Mô tả chung</p>}
            name="generalDescription"
            initialValue={generalDescription}
            rules={[{ required: true, message: 'Vui lòng nhập mô tả chung' }]}
            className="mb-4"
          >
            <Input.TextArea rows={2} className="py-2" placeholder="Nhập mô tả chung về sản phẩm" />
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
        </Card>

        {/* Pricing and Inventory Card */}
        <Card title="Giá và kho hàng" className="mb-6">
          <Form.Item
            label={<p className="font-bold text-md">Giá sản phẩm (VND)</p>}
            name="price"
            initialValue={price}
            className="mb-2"
          >
            <InputNumber
              type="number"
              className="py-1 w-full"
              placeholder="Nhập giá sản phẩm"
              onChange={(data) => {
                setCurrentPrice(data || 0);
              }}
            />
          </Form.Item>
          <p className="mt-0.5 ml-2 mb-4 text-green-600 font-medium">{formatCurrency(currentPrice)}</p>

          <Form.Item
            label={<p className="font-bold text-md">Số lượng trong kho</p>}
            name="quantity"
            initialValue={quantity}
            className="mb-4"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber type="number" className="py-1 w-full" placeholder="Nhập số lượng có sẵn" />
          </Form.Item>
        </Card>

        {/* Images Card */}
        <Card title="Hình ảnh sản phẩm" className="mb-6">
          <div className="w-60 mb-4">
            <FormUpload
              name="imagesUrl"
              label="Ảnh sản phẩm"
              multiple
              accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG"
              initialValue={initialImages}
              defaultFileList={initialImages}
              maxCount={10}
            />
          </div>
        </Card>

        {/* Product Settings Card */}
        <Card title="Cài đặt sản phẩm" className="mb-6">
          <div className="space-y-6">
            {/* Website Visibility Toggle - NEW FEATURE */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center space-x-3">
                <div className="text-blue-600">
                  {isVisibleProduct ? (
                    <EyeOutlined className="text-xl" />
                  ) : (
                    <EyeInvisibleOutlined className="text-xl" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-md mb-1">
                    Hiển thị trên website chính
                    <Tooltip title="Khi bật, sản phẩm sẽ được hiển thị trên website chính và có thể mua bán. Khi tắt, sản phẩm sẽ bị ẩn khỏi khách hàng.">
                      <InfoCircleOutlined className="ml-2 text-gray-400" />
                    </Tooltip>
                  </p>
                  <p className="text-sm text-gray-600">
                    {isVisibleProduct
                      ? 'Sản phẩm đang hiển thị công khai trên website'
                      : 'Sản phẩm đang bị ẩn khỏi website chính'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isVisibleProduct}
                onChange={(checked) => setIsVisibleProduct(checked)}
                size="large"
                checkedChildren="Hiển thị"
                unCheckedChildren="Ẩn"
              />
            </div>

            <Divider />

            {/* Featured Product Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-amber-50">
              <div className="flex items-center space-x-3">
                <StarOutlined className={`text-xl ${isFeaturedProduct ? 'text-amber-500' : 'text-gray-400'}`} />
                <div>
                  <p className="font-bold text-md mb-1">
                    Sản phẩm nổi bật
                    <Tooltip title="Sản phẩm nổi bật sẽ được ưu tiên hiển thị ở những vị trí đặc biệt trên website.">
                      <InfoCircleOutlined className="ml-2 text-gray-400" />
                    </Tooltip>
                  </p>
                  <p className="text-sm text-gray-600">
                    {isFeaturedProduct
                      ? 'Sản phẩm này được đánh dấu là nổi bật'
                      : 'Sản phẩm này không được đánh dấu là nổi bật'}
                  </p>
                </div>
              </div>
              <Switch
                checked={isFeaturedProduct}
                onChange={(checked) => setIsFeaturedProduct(checked)}
                size="large"
                checkedChildren="Nổi bật"
                unCheckedChildren="Thường"
              />
            </div>
          </div>
        </Card>

        {/* Submit Buttons */}
        <Form.Item className="mb-0">
          <div className="flex justify-end space-x-3">
            <Button size="large" onClick={() => navigate('/products')}>
              Hủy bỏ
            </Button>
            <Button type="primary" htmlType="submit" size="large" loading={creatingProduct || updatingProduct}>
              {isEdit ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductsCreate;
