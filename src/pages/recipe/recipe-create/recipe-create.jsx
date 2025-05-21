import { ButtonBack } from '@/components/button';
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import Editor from '@/components/form/editor';
import FormItemUpload from '@/components/form/form-upload';
import { useCreateRecipe, useQueryRecipeDetail, useUpdateRecipe } from '@/services/recipe.service';
import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input } from 'antd';
import { useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

const RecipeCreate = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { isPending: loadingCreate, mutate: createMutate } = useCreateRecipe();
  const { isPending: loadingUpdate, mutate: updateMutate } = useUpdateRecipe(id);
  const { isLoading: loadingDetail, data: recipeDetail, error: errorDetail } = useQueryRecipeDetail(id);
  // const [currentPrice, setCurrentPrice] = useState(0);

  const onFinish = useCallback(
    (values) => {
      const {
        title,
        // price,
        // quantity,
        // categoryId,
        description,
        imagesUrl,
        recipeThumbnail,
        // generalDescription,
        instruction
        // isFeatured
      } = values || {};
      const fileList = Array.isArray(imagesUrl) ? imagesUrl : imagesUrl?.fileList || [];
      const recipeThumbnailFileList = Array.isArray(recipeThumbnail)
        ? recipeThumbnail
        : recipeThumbnail?.fileList || [];

      Promise.all(
        [...fileList, ...recipeThumbnailFileList].map(async (item) => {
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
          let recipeThumbnailUrl = null;

          if (!recipeThumbnailFileList?.length) {
            imagesUrl = imagesUrlData;
          } else {
            recipeThumbnailUrl = imagesUrlData?.[imagesUrlData?.length - 1];
            imagesUrl = imagesUrlData?.slice(0, -1);
          }

          const data = {
            title,
            // price,
            // quantity,
            // categoryIds: [categoryId?.value],
            description,
            imagesUrl,
            recipeThumbnail: recipeThumbnailUrl,
            // generalDescription,
            instruction,
            // isFeatured,
            type: 'CONG_THUC'
          };
          id ? updateMutate(data) : createMutate(data);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Tải ảnh công thức thất bại. ${e.message}` });
        });
    },
    [createMutate, updateMutate, id]
  );

  // useEffect(() => {
  //   if (id && recipeDetail) {
  //     setCurrentPrice(recipeDetail?.price);
  //   }
  // }, [id, recipeDetail]);

  if (loadingDetail) {
    return <LoadingScreen className="mt-20" />;
  }

  if (errorDetail) {
    return <ErrorScreen message={errorDetail?.message} className="mt-20" />;
  }

  const { title, description, imagesUrl, ofCategories, instruction, recipeThumbnail } = recipeDetail || {};

  // const initCategory = ofCategories?.map((i) => ({ label: i.name, value: i.id }))?.[0];

  const initialImages = Array.isArray(imagesUrl) ? imagesUrl.map((i) => ({ name: '', url: i })) : undefined;

  const defaultImages = Array.isArray(imagesUrl)
    ? imagesUrl.map((i) => ({
        type: 'image/*',
        url: i,
        uid: i,
        name: ''
      }))
    : undefined;

  const initialRecipeThumbnail = recipeThumbnail ? [{ name: '', url: recipeThumbnail }] : undefined;

  const defaultRecipeThumbnail = recipeThumbnail
    ? [
        {
          type: 'image/*',
          url: recipeThumbnail,
          uid: recipeThumbnail,
          name: ''
        }
      ]
    : undefined;

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[65%] mx-auto">
      <Helmet>
        <title>
          {id ? 'Cập nhật' : 'Tạo'} công thức | {WEBSITE_NAME}
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
          label={<p className="font-bold text-md">Tên công thức</p>}
          name="title"
          initialValue={title}
          rules={[{ required: true, message: 'Vui lòng nhập tên công thức' }]}
          className="mb-10"
        >
          <Input className="py-2" />
        </Form.Item>

        {/* <Form.Item
          label={<p className="font-bold text-md">Mô tả chung</p>}
          name="generalDescription"
          initialValue={generalDescription}
          rules={[{ required: true, message: 'Vui lòng nhập mô tả chung' }]}
          className="mb-10"
        >
          <Input.TextArea rows={2} className="py-2" />
        </Form.Item> */}

        {/* <FormSelectQuery
          allowClear
          initialValue={initCategory}
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
          label="Danh mục"
          labelKey="name"
          valueKey="id"
          name="categoryId"
          request={{
            url: '/api/category/get-all'
          }}
        /> */}

        {/* <Form.Item
          label={<p className="font-bold text-md">Giá công thức (VND)</p>}
          name="price"
          initialValue={price}
          rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
          className="mt-10 mb-0"
        >
          <InputNumber type="number" className="py-1 w-full" onChange={(data) => setCurrentPrice(data || 0)} />
        </Form.Item>
        <p className="mt-0.5 ml-2 mb-10">{formatCurrency(currentPrice)}</p> */}

        {/* <Form.Item
          label={<p className="font-bold text-md">Số lượng trong kho</p>}
          name="quantity"
          initialValue={quantity}
          className="mb-10"
          rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
        >
          <InputNumber type="number" className="py-1 w-full" />
        </Form.Item> */}

        <div className="w-72 mb-10">
          <FormItemUpload
            name="recipeThumbnail"
            label="Ảnh thumbnail công thức"
            multiple
            accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG"
            initialValue={initialRecipeThumbnail}
            defaultFileList={defaultRecipeThumbnail}
            maxCount={1}
          />
        </div>

        <div className="w-72 mb-10">
          <FormItemUpload
            name="imagesUrl"
            label="Ảnh popup công thức (ảnh chính)"
            multiple
            accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG"
            initialValue={initialImages}
            defaultFileList={defaultImages}
            maxCount={1}
          />
        </div>

        {/* <Form.Item
          label={<p className="font-bold text-md">Sản phẩm nổi bật</p>}
          name="isFeatured"
          initialValue={isFeatured}
          valuePropName="checked"
          className="mb-10"
        >
          <Switch />
        </Form.Item> */}

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
          label={<p className="font-bold text-md">Hướng dẫn cách làm</p>}
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
            <ButtonBack route="/recipe" />
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

export default RecipeCreate;
