import { API } from '@/utils/API';
import { showToast } from '@/utils/helper';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Modal } from 'antd';
import { useState } from 'react';
import { FaSync } from 'react-icons/fa';

const KiotvietSync = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSync = () => {
    setLoading(true);
    API.request({
      url: '/api/kiotviet/sync',
      method: 'POST'
    })
      .then((res) => {
        showToast({
          type: 'success',
          message: `Đồng bộ thành công ${res.totalSynced} sản phẩm từ KiotViet`
        });
        queryClient.invalidateQueries(['GET_PRODUCTS_LIST']);
        setLoading(false);
        setIsModalOpen(false);
      })
      .catch((err) => {
        showToast({
          type: 'error',
          message: `Đồng bộ thất bại: ${err.message}`
        });
        setLoading(false);
      });
  };

  return (
    <>
      <Button type="primary" icon={<FaSync />} onClick={() => setIsModalOpen(true)}>
        Đồng bộ KiotViet
      </Button>

      <Modal
        title="Đồng bộ sản phẩm từ KiotViet"
        open={isModalOpen}
        onOk={handleSync}
        onCancel={() => setIsModalOpen(false)}
        okText="Đồng bộ"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <p>Thao tác này sẽ đồng bộ sản phẩm từ KiotViet. Tiếp tục?</p>
      </Modal>
    </>
  );
};

export default KiotvietSync;
