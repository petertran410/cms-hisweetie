// src/pages/news/news-create/news-create.jsx - UPDATED với dropdown type
import { ButtonBack } from '../../../components/button';
import FormUpload from '../../../components/form/form-upload.jsx';
import { LoadingScreen, ErrorScreen } from '../../../components/effect-screen';
import Editor from '../../../components/form/editor';
import { useCreateNews, useQueryNewsDetail, useUpdateNews } from '@/services/news.service';
import { NEWS_TYPE_OPTIONS, getNewsTypeLabel } from '@/utils/news-types.constants';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input, Select } from 'antd';
import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import { useScrollTop } from '../../../utils/helper';

const NewsCreate = () => {
  const { id } = useParams();
  const isDetail = window.location.pathname.includes('detail');
  const [hasTableOfContents, setHasTableOfContents] = useState(false);

  const { mutate: createMutate, isPending: loadingCreate } = useCreateNews();
  const { mutate: updateMutate, isPending: loadingUpdate } = useUpdateNews(id);
  const { data: newsDetail, isLoading: loadingDetail, error: errorDetail } = useQueryNewsDetail(id);

  const onFinish = useCallback(
    (values) => {
      const { title, description, htmlContent, imagesUrl, type } = values;
      const finalHtmlContent = hasTableOfContents ? `<toc></toc>${htmlContent}` : htmlContent;

      const newsData = {
        title,
        description,
        htmlContent: finalHtmlContent,
        imagesUrl: imagesUrl?.map((i) => i.url) || [],
        type: type || 'NEWS' // Default fallback
      };

      if (id) {
        updateMutate(newsData);
      } else {
        createMutate(newsData);
      }
    },
    [createMutate, updateMutate, id, hasTableOfContents]
  );

  const handleError = useCallback((e) => {
    console.error('Form submission error:', e);
  }, []);

  useScrollTop();

  if (loadingDetail) {
    return <LoadingScreen className="mt-20" />;
  }

  if (errorDetail) {
    return <ErrorScreen message={errorDetail?.message} className="mt-20" />;
  }

  const { title, description, htmlContent, imagesUrl, type } = newsDetail || {};

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
        initialValues={{
          remember: true,
          type: type || 'NEWS' // Set default type
        }}
        onFinish={onFinish}
        onFinishFailed={handleError}
        autoComplete="off"
        className="mt-10"
      >
        <Form.Item
          label={<p className="font-bold text-md">Tiêu đề</p>}
          name="title"
          initialValue={title}
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input className="py-2" disabled={isDetail} placeholder="Nhập tiêu đề bài viết" />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Mô tả</p>}
          name="description"
          initialValue={description}
          rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
        >
          <Input.TextArea className="py-2" disabled={isDetail} placeholder="Nhập mô tả ngắn cho bài viết" rows={3} />
        </Form.Item>

        {/* THÊM MỚI: Dropdown chọn loại bài viết */}
        <Form.Item
          label={<p className="font-bold text-md">Loại bài viết</p>}
          name="type"
          initialValue={type || 'NEWS'}
          rules={[{ required: true, message: 'Vui lòng chọn loại bài viết' }]}
        >
          <Select
            placeholder="Chọn loại bài viết"
            disabled={isDetail}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            options={NEWS_TYPE_OPTIONS}
            className="h-10"
          />
        </Form.Item>

        <FormUpload
          disabled={isDetail}
          name="imagesUrl"
          label="Ảnh đại diện"
          accept=".JPG, .JPEG, .PNG, .GIF, .BMP, .HEIC, .SVG"
          initialValue={initialImages}
          defaultFileList={defaultImages}
          rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 ảnh đại diện' }]}
        />

        <Form.Item
          label={<p className="font-bold text-md">Nội dung</p>}
          name="htmlContent"
          initialValue={htmlContent}
          rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
        >
          <Editor
            showCreateTableOfContents
            getCreateTableOfContents={(value) => setHasTableOfContents(value)}
            defaultValue={htmlContent}
            disabled={isDetail}
            placeholder="Nhập nội dung chi tiết của bài viết..."
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
                disabled={loadingCreate || loadingUpdate}
              >
                <span className="font-semibold">{id ? 'Cập nhật' : 'Tạo mới'}</span>
              </Button>
            </Form.Item>
          ) : (
            <Link to={`/news/${id}/edit`} onClick={() => window.scrollTo(0, 0)}>
              <span className="font-semibold px-10 py-3 bg-blue-500 text-white rounded-md duration-200 hover:bg-blue-600">
                Chỉnh sửa
              </span>
            </Link>
          )}
        </div>
      </Form>

      {/* Hiển thị thông tin loại bài viết cho trang detail */}
      {isDetail && type && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Loại bài viết:</span> {getNewsTypeLabel(type)}
          </p>
        </div>
      )}
    </div>
  );
};

export default NewsCreate;
