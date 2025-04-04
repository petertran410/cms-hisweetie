import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Upload } from 'antd';
import { saveAs } from 'file-saver';
import { useState } from 'react';
import { FaUpload } from 'react-icons/fa6';

const ImportProduct = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [canClose, setCanClose] = useState(true);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState();
  const queryClient = useQueryClient();

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setFile(undefined);
  };

  const onSubmit = () => {
    setLoading(true);
    setCanClose(false);

    API.upload({
      url: '/api/file/import/product',
      file,
      responseType: 'arraybuffer'
    })
      .then((res) => {
        console.log(res instanceof ArrayBuffer);
        showToast({
          type: 'success',
          duration: 60000,
          message: 'Tải file lên thành công. Xem kết quả trong file vừa tải về'
        });
        queryClient.refetchQueries({ queryKey: ['GET_PRODUCTS_LIST'] });
        setLoading(false);
        setCanClose(true);
        handleCancel();
        const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, 'Ket-qua-import-san-pham.xlsx');
      })
      .catch((e) => {
        if (e) {
          const blob = new Blob([e], { type: 'text/plain' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'Import-san-pham-bi-loi.txt';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        showToast({ type: 'error', message: 'Import sản phẩm thất bại. Xem thông tin lỗi trong file vừa tải xuống' });
        setLoading(false);
        setCanClose(true);
      });
  };

  return (
    <>
      <Button type="primary" onClick={showModal} className="px-4 py-2 h-[35px]">
        <FaUpload color="#fff" />
        Import file
      </Button>
      <Modal
        width={600}
        title="Import file sản phẩm"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
        closable={canClose}
        maskClosable={canClose}
      >
        <div className="mt-16">
          <div className="flex flex-col items-center justify-center">
            <Upload
              fileList={file ? [file] : undefined}
              disabled={loading}
              accept=".xlsx"
              beforeUpload={() => false}
              className="flex flex-col items-center"
              onChange={(e) => setFile(e.file)}
            >
              <Button icon={<FaUpload />} className="mx-auto">
                Chọn file
              </Button>
            </Upload>

            <Button type="primary" className="mt-10" loading={loading} disabled={!file} onClick={onSubmit}>
              Bắt đầu import
            </Button>

            {loading && (
              <p className="mt-4 text-center">Đang import danh sách sản phẩm, bạn vui lòng đợi trong giây lát...</p>
            )}
          </div>
          <div className="flex items-center justify-end mt-16 gap-2">
            <p>Tải file mẫu:</p>
            <a
              href={`${window.location.origin}/Import-san-pham.xlsx`}
              target="_blank"
              className="text-green-500 font-semibold"
            >
              Import-san-pham.xlsx
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImportProduct;
