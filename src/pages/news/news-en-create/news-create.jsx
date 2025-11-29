import { ButtonBack } from '@/components/button';
import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import Editor from '@/components/form/editor';
import FormItemUpload from '@/components/form/form-upload';
import { useCreateNews, useQueryNewsDetail, useUpdateNews } from '@/services/news.service';
import { NEWS_TYPE_OPTIONS } from '@/utils/news-types.constants';
import { API } from '@/utils/API';
import { getHtmlContentWithTOC, showToast, useFormType, useScrollTop } from '@/utils/helper';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input, Select } from 'antd';
import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import GuideGetLink from './guide-get-link';

const NewsCreateEn = () => {
  const { id } = useParams();
  const { isPending: loadingCreate, mutate: createMutate } = useCreateNews();
  const { isPending: loadingUpdate, mutate: updateMutate } = useUpdateNews(id);

  const { isLoading: loadingDetail, data: newsDetail, error: errorDetail } = useQueryNewsDetail(id);
  const { isDetail } = useFormType();
  const [hasTableOfContents, setHasTableOfContents] = useState(false);

  const onFinish = useCallback(
    (values) => {
      const { title_en, html_content_en, description_en, imagesUrl, type, embedUrl, titleMeta } = values || {};
      const fileData = imagesUrl?.fileList || imagesUrl || [];
      const fileList = fileData?.[fileData.length - 1] ? [fileData?.[fileData.length - 1]] : [];

      Promise.all(
        fileList.map(async (item) => {
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
        .then((imagesUrl) => {
          const data = {
            title_en,
            titleMeta,
            html_content_en: getHtmlContentWithTOC(htmlContent, hasTableOfContents),
            description_en,
            imagesUrl,
            type,
            embedUrl: embedUrl?.trim() || null
          };
          id ? updateMutate(data) : createMutate(data);
        })
        .catch((e) => {
          showToast({ type: 'error', message: `Tải ảnh bài viết thất bại. ${e.message}` });
        });
    },
    [createMutate, updateMutate, id, hasTableOfContents]
  );

  useScrollTop();

  if (loadingDetail) {
    return <LoadingScreen className="mt-20" />;
  }

  if (errorDetail) {
    return <ErrorScreen message={errorDetail?.message} className="mt-20" />;
  }

  const { title_en, description_en, html_content_en, imagesUrl, type, embedUrl, titleMeta } = newsDetail || {};

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
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[65%] mx-auto mb-10">
      <Helmet>
        <title>
          {id ? 'Cập nhật' : 'Tạo'} tin tức | {WEBSITE_NAME}
        </title>
      </Helmet>

      <Form
        name="newsForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
        className="mt-10"
      >
        <Form.Item
          label={<p className="font-bold text-md">Tiêu đề English</p>}
          name="title_en"
          initialValue={title_en}
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input className="py-2" disabled={isDetail} />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Title Meta</p>}
          name="titleMeta"
          initialValue={titleMeta}
          rules={[{ required: true, message: 'Vui lòng nhập title meta' }]}
        >
          <Input className="py-2" disabled={isDetail} placeholder="Nhập title meta" />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Loại bài viết</p>}
          name="type"
          initialValue={type || 'NEWS'}
          rules={[{ required: true, message: 'Vui lòng chọn loại bài viết' }]}
        >
          <Select className="h-10" placeholder="Chọn loại bài viết" disabled={isDetail} options={NEWS_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Mô tả</p>}
          name="description_en"
          initialValue={description_en}
        >
          <Input className="py-2" disabled={isDetail} />
        </Form.Item>

        <FormItemUpload
          disabled={isDetail}
          name="imagesUrl"
          label="Ảnh đại diện"
          accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG"
          initialValue={initialImages}
          defaultFileList={defaultImages}
        />

        <Form.Item
          label={<p className="font-bold text-md">Link video nhúng (tùy chọn)</p>}
          name="embedUrl"
          initialValue={embedUrl}
        >
          <Input.TextArea
            rows={4}
            className="py-2"
            placeholder="Mẫu: https://www.youtube.com/embed/4letvWcz-ic?si=vn0hTIJto8GLbiRl"
            disabled={isDetail}
          />
        </Form.Item>

        {!isDetail && <GuideGetLink />}

        <Form.Item
          label={<p className="font-bold text-md">Nội dung</p>}
          name="html_content_en"
          initialValue={html_content_en}
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <Editor
            showCreateTableOfContents
            getCreateTableOfContents={(value) => setHasTableOfContents(value)}
            defaultValue={html_content_en}
            disabled={isDetail}
          />
        </Form.Item>

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/news" />
          </div>

          {!isDetail ? (
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
          ) : (
            <Link to={`/news/${id}/edit-en`} onClick={() => window.scrollTo(0, 0)}>
              <span className="font-semibold px-10 py-3 bg-blue-500 text-white rounded-md duration-200 hover:bg-blue-600">
                Chỉnh sửa
              </span>
            </Link>
          )}
        </div>
      </Form>
    </div>
  );
};

export default NewsCreateEn;
