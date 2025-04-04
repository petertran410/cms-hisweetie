import { ButtonBack } from '@/components/button';
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { useCreateVideo, useQueryVideoDetail, useUpdateVideo } from '@/services/video.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input } from 'antd';
import { useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import GuideGetLink from './guide-get-link';

const VideoCreate = () => {
  const { id } = useParams();
  const { isPending: loadingCreate, mutate: createMutate } = useCreateVideo();
  const { isPending: loadingUpdate, mutate: updateMutate } = useUpdateVideo(id);
  const { isLoading: loadingDetail, data: videoDetail, error: errorDetail } = useQueryVideoDetail(id);

  const { title, imagesUrl } = videoDetail || {};

  const onFinish = useCallback(
    (values) => {
      const { title, embedUrl } = values;
      const data = {
        title: title.trim(),
        imagesUrl: [embedUrl.trim()],
        type: 'VIDEO'
      };
      id ? updateMutate(data) : createMutate(data);
    },
    [createMutate, updateMutate, id]
  );

  if (loadingDetail) {
    return <LoadingScreen className="mt-20" />;
  }

  if (errorDetail) {
    return <ErrorScreen message={errorDetail?.message} className="mt-20" />;
  }

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[45%] mx-auto">
      <Helmet>
        <title>
          {id ? 'Cập nhật' : 'Tạo'} video | {WEBSITE_NAME}
        </title>
      </Helmet>

      <Form
        name="videoForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
        autoComplete="off"
        className="mt-10"
      >
        <Form.Item
          label={<p className="font-bold text-md">Tiêu đề</p>}
          name="title"
          initialValue={title}
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input className="py-2" />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Link nhúng</p>}
          name="embedUrl"
          initialValue={imagesUrl?.[0]}
          rules={[{ required: true, message: 'Vui lòng điền link nhúng' }]}
        >
          <Input.TextArea
            rows={4}
            className="py-2"
            placeholder="Mẫu: https://www.youtube.com/embed/4letvWcz-ic?si=vn0hTIJto8GLbiRl"
          />
        </Form.Item>

        <GuideGetLink />

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/videos" />
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

export default VideoCreate;
