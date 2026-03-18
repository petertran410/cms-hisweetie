import { ButtonBack } from '@/components/button';
import { LoadingScreen } from '@/components/effect-screen';
import FormItemUpload from '@/components/form/form-upload';
import { useCreateTestimonial, useQueryTestimonialDetail, useUpdateTestimonial } from '@/services/testimonial.service';
import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input } from 'antd';
import { useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
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

      <ButtonBack />

      <Form form={form} layout="vertical" onFinish={onFinish} className="max-w-2xl mt-4">
        <Form.Item label="Tên khách hàng" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>

        <Form.Item
          label="Nội dung đánh giá"
          name="review_description"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <TextArea rows={5} placeholder="Nhập nội dung đánh giá" />
        </Form.Item>

        <Form.Item label="Hình ảnh" name="image">
          <FormItemUpload
            maxCount={1}
            defaultFileList={detail?.image ? [{ uid: detail.image, url: detail.image, name: 'image' }] : []}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loadingCreate || loadingUpdate}>
            {id ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default TestimonialCreate;
