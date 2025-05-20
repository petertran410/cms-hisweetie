// src/components/sync/sync-button.jsx
import { useMutation } from '@tanstack/react-query';
import { Button, message } from 'antd';
import { API } from '@/utils/API';

const SyncButton = ({ onSyncComplete }) => {
  const { mutate: syncProducts, isLoading } = useMutation({
    mutationFn: () =>
      API.request({
        url: '/api/sync/products/incremental',
        method: 'GET'
      }),
    onSuccess: (data) => {
      message.success(`Synced ${data.totalProductsProcessed} products successfully!`);
      if (onSyncComplete) onSyncComplete();
    },
    onError: (error) => {
      message.error(`Sync failed: ${error.message}`);
    }
  });

  return (
    <Button type="primary" onClick={() => syncProducts()} loading={isLoading} icon={<SyncOutlined />}>
      Sync Products from KiotViet
    </Button>
  );
};

export default SyncButton;
