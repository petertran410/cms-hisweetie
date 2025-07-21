import React, { useState } from 'react';
import { Modal, Form, Input } from 'antd';

const ImageCaptionModal = ({ visible, onCancel, onSave, initialValues = {} }) => {
  const [form] = Form.useForm();

  // Thiết lập giá trị ban đầu khi modal mở
  React.useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue({
        alt: initialValues.alt || '',
        caption: initialValues.caption || ''
      });
    }
  }, [visible, initialValues, form]);

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        onSave(values);
        form.resetFields();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title="Thông tin hình ảnh"
      visible={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleSave}
      okText="Xác nhận"
      cancelText="Hủy bỏ"
    >
      <Form form={form} layout="vertical" initialValues={{ alt: '', caption: '' }}>
        <Form.Item name="alt" label="Mô tả hình ảnh (ALT)" tooltip="Thuộc tính ALT giúp SEO và người dùng khiếm thị">
          <Input placeholder="Mô tả nội dung của hình ảnh" />
        </Form.Item>

        <Form.Item
          name="caption"
          label="Chú thích hiển thị dưới hình"
          tooltip="Chú thích sẽ hiển thị phía dưới hình ảnh"
        >
          <Input.TextArea placeholder="Ví dụ: Cá piranha bung đô là loài ăn tạp. Ảnh: Sylvain CORDIER" rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ImageCaptionModal;
