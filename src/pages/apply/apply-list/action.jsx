import { useChangeApplyStatus } from '@/services/recruitment.service';
import { Input, Modal, Select, Tooltip } from 'antd';
import { memo, useEffect, useState } from 'react';
import { FaEdit } from 'react-icons/fa';
import { STATUS_LIST } from './data';

const Action = ({ item }) => {
  const { mutateAsync: changeMutate, isPending } = useChangeApplyStatus(item?.applicant?.id);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState();
  const [note, setNote] = useState('');

  useEffect(() => {
    if (item.status) {
      setCurrentStatus(STATUS_LIST.find((i) => i.value === item.status));
    }
  }, [item.status]);

  return (
    <div>
      <Tooltip title="Thay đổi trạng thái">
        <div
          onClick={() => setShowChangeStatus(true)}
          className="w-10 h-9 cursor-pointer rounded-md flex items-center justify-center bg-[#009dff] hover:bg-[#008ee6] duration-200"
        >
          <FaEdit color="#FFF" />
        </div>
      </Tooltip>

      <Modal
        title="Thay đổi trạng thái hồ sơ ứng tuyển"
        open={showChangeStatus}
        cancelText="Huỷ bỏ"
        okText="Xác nhận"
        okButtonProps={{ loading: isPending }}
        onOk={() => {
          changeMutate({ note: note.trim(), status: currentStatus?.value }).then(() => {
            setShowChangeStatus(false);
            setCurrentStatus(undefined);
          });
        }}
        onCancel={() => {
          setShowChangeStatus(false);
          setCurrentStatus(STATUS_LIST.find((i) => i.value === item.status));
        }}
      >
        <p className="font-semibold mt-10 mb-2">Chọn trạng thái</p>

        <div className="mb-10">
          <Select
            value={currentStatus}
            className="w-full"
            options={STATUS_LIST}
            labelInValue
            onChange={(data) => setCurrentStatus(data)}
          />
        </div>

        <p className="font-semibold mt-10 mb-2">Ghi chú</p>

        <div className="mb-10">
          <Input.TextArea rows={5} placeholder="Nhập ghi chú" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};

export default memo(Action);
