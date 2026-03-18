import { ButtonBack } from '@/components/button';
import { LoadingScreen } from '@/components/effect-screen';
import FormItemUpload from '@/components/form/form-upload';
import { useCreateTestimonial, useQueryTestimonialDetail, useUpdateTestimonial } from '@/services/testimonial.service';
import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Flex, Form, Input } from 'antd';
import { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { FaSave, FaStar } from 'react-icons/fa';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const TestimonialCreate = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { isPending: loadingCreate, mutate: createMutate } = useCreateTestimonial();
  const { isPending: loadingUpdate, mutate: updateMutate } = useUpdateTestimonial(id);
  const { isLoading: loadingDetail, data: detail } = useQueryTestimonialDetail(id);

  useEffect(() => {
    if (detail && id) {
      form.setFieldsValue({
        name: detail.name,
        review_description: detail.review_description,
        image: detail.image ? [{ uid: detail.image, url: detail.image, name: 'image' }] : []
      });
    }
  }, [detail, id, form]);

  const onFinish = useCallback(
    async (values) => {
      const { name, review_description, image } = values;

      let imageUrl = null;
      const fileList = Array.isArray(image) ? image : image?.fileList || [];
      const file = fileList[0];

      if (file?.url) {
        imageUrl = file.url;
      } else if (file?.originFileObj) {
        try {
          const formData = new FormData();
          formData.append('file', file.originFileObj);
          imageUrl = await API.request({
            url: '/api/file/upload',
            method: 'POST',
            params: formData,
            isUpload: true,
            headers: { 'X-Force-Signature': import.meta.env.VITE_API_KEY }
          });
        } catch (e) {
          showToast({ type: 'error', message: 'Upload ảnh thất bại' });
          return;
        }
      }

      const payload = { name, review_description, image: imageUrl };
      id ? updateMutate(payload) : createMutate(payload);
    },
    [id, createMutate, updateMutate]
  );

  if (id && loadingDetail) return <LoadingScreen />;

  return (
    <>
      <Helmet>
        <title>
          {id ? 'Cập nhật' : 'Tạo'} đánh giá | {WEBSITE_NAME}
        </title>
      </Helmet>

      <Flex justify="center" py-8>
        <div className="w-full max-w-[680px]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FaStar className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{id ? 'Cập nhật đánh giá' : 'Tạo đánh giá mới'}</h1>
              <p className="text-sm text-gray-400">Thêm đánh giá của khách hàng để hiển thị trên website</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <Form form={form} layout="vertical" onFinish={onFinish} className="max-w-2xl mt-4 items-center">
              <Form.Item
                label={<span className="font-semibold text-gray-700">Tên khách hàng</span>}
                name="name"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                className="mb-6"
              >
                <Input placeholder="VD: Nguyễn Văn A" className="!rounded-lg !py-2.5 !px-4" size="large" />
              </Form.Item>

              <Form.Item
                label={<span className="font-semibold text-gray-700">Nội dung đánh giá</span>}
                name="review_description"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                className="mb-6"
              >
                <TextArea
                  rows={5}
                  placeholder="Nhập nội dung đánh giá của khách hàng..."
                  className="!rounded-lg !py-3 !px-4"
                  style={{ resize: 'vertical' }}
                />
              </Form.Item>

              <div className="mb-8">
                <FormItemUpload
                  name="image"
                  label="Hình ảnh khách hàng"
                  accept=".JPG,.JPEG,.PNG,.WEBP"
                  maxCount={1}
                  defaultFileList={detail?.image ? [{ uid: detail.image, url: detail.image, name: 'image' }] : []}
                />
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loadingCreate || loadingUpdate}
                  icon={<FaSave />}
                  className="!rounded-lg !h-11 !px-8 !font-semibold"
                >
                  {id ? 'Cập nhật' : 'Tạo mới'}
                </Button>

                <Button size="large" className="!rounded-lg !h-11 !px-8" onClick={() => navigate('/testimonials')}>
                  Hủy
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Flex>
    </>
  );
};

export default TestimonialCreate;
