import { ButtonBack } from '@/components/button';
import { LoadingScreen } from '@/components/effect-screen';
import { useQueryRedirectDetail, useUpdateRedirect } from '@/services/redirect.service';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Checkbox, Form, Input, Select } from 'antd';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

const { TextArea } = Input;

const STATUS_OPTIONS = [
  { value: 301, label: '301 - Chuyển hướng vĩnh viễn' },
  { value: 302, label: '302 - Chuyển hướng tạm thời' }
];

const PATH_RULE = [
  { required: true, message: 'Vui lòng nhập đường dẫn' },
  { pattern: /^\//, message: 'Đường dẫn phải bắt đầu bằng "/"' }
];

const RedirectEdit = () => {
  const { id } = useParams();
  const [form] = Form.useForm();
  const { data: redirectData, isLoading } = useQueryRedirectDetail(id);
  const { mutate: updateMutate, isPending } = useUpdateRedirect(id);

  const onFinish = (values) => {
    const source = (values.source_path || '').trim();
    const target = (values.target_path || '').trim();

    if (source === target) {
      form.setFields([{ name: 'target_path', errors: ['Đường dẫn mới không được trùng đường dẫn cũ'] }]);
      return;
    }

    updateMutate({
      source_path: source,
      target_path: target,
      status_code: values.status_code ?? 301,
      is_active: values.is_active ?? true,
      note: values.note || null
    });
  };

  useEffect(() => {
    if (redirectData) {
      form.setFieldsValue({
        source_path: redirectData.source_path,
        target_path: redirectData.target_path,
        status_code: redirectData.status_code ?? 301,
        is_active: redirectData.is_active ?? true,
        note: redirectData.note
      });
    }
  }, [redirectData, form]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="w-full md:w-[60%] lg:w-[50%] 2xl:w-[45%] mx-auto">
      <Helmet>
        <title>Chỉnh sửa redirect | {WEBSITE_NAME}</title>
      </Helmet>

      <Form
        form={form}
        name="redirectEditForm"
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
        onFinish={onFinish}
        autoComplete="off"
        className="mt-10"
      >
        <Form.Item
          label={<p className="font-bold text-md">Đường dẫn cũ (source)</p>}
          name="source_path"
          rules={PATH_RULE}
        >
          <Input className="py-2" placeholder="/san-pham/nguyen-lieu-pha-che-lermao/mut-pha-che-lermao" />
        </Form.Item>

        <Form.Item
          label={<p className="font-bold text-md">Đường dẫn mới (target)</p>}
          name="target_path"
          rules={PATH_RULE}
        >
          <Input className="py-2" placeholder="/san-pham/nguyen-lieu-pha-che/mut-pha-che" />
        </Form.Item>

        <Form.Item label={<p className="font-bold text-md">Loại chuyển hướng</p>} name="status_code">
          <Select options={STATUS_OPTIONS} className="h-[38px]" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label={<p className="font-bold text-md">Ghi chú</p>} name="note">
          <TextArea className="py-2" placeholder="Ghi chú (không bắt buộc)" rows={3} />
        </Form.Item>

        <Form.Item name="is_active" valuePropName="checked">
          <Checkbox>
            <span className="font-bold text-md">Kích hoạt redirect</span>
          </Checkbox>
        </Form.Item>

        <div className="flex items-center gap-8 mt-20 justify-center">
          <div className="hidden md:block">
            <ButtonBack route="/redirects" />
          </div>

          <Button type="primary" htmlType="submit" size="large" className="px-10" loading={isPending}>
            <span className="font-semibold">Cập nhật redirect</span>
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default RedirectEdit;
