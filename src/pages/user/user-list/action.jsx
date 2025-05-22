import { useBanUser, useChangeUserRole } from '@/services/user.service';
import { userInfoAtom } from '@/states/common';
import { Modal, Select } from 'antd';
import { memo, useState } from 'react';
import { FaTriangleExclamation, FaUser } from 'react-icons/fa6';
import { useRecoilValue } from 'recoil';

const Action = ({ item }) => {
  const { mutate: changeRoleMutate, isPending: loadingChangeRole } = useChangeUserRole();
  const { mutate: banMutate, isPending: loadingBan } = useBanUser();
  const [showChangeRole, setShowChangeRole] = useState(false);
  const [showBan, setShowBan] = useState(false);
  const [currentRole, setCurrentRole] = useState();
  const userInfo = useRecoilValue(userInfoAtom);

  // More robust check for current user
  const isCurrentUser =
    (item?.email && userInfo?.email && item.email === userInfo.email) ||
    (item?.phone && userInfo?.phone && item.phone === userInfo.phone) ||
    (item?.id && userInfo?.id && item.id === userInfo.id);

  if (isCurrentUser) {
    return null; // Don't show action buttons for current user
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setShowChangeRole(true)}
        type="button"
        className="w-10 h-9 rounded-md flex items-center justify-center bg-[#009dff] hover:bg-[#008ee6] duration-200"
      >
        <FaUser color="#FFF" size={13} />
      </button>

      <Modal
        title="Thay đổi quyền người dùng"
        open={showChangeRole}
        cancelText="Huỷ bỏ"
        okText="Xác nhận"
        okButtonProps={{ loading: loadingChangeRole }}
        onOk={() => {
          changeRoleMutate({ username: item?.id, role: currentRole?.value });
          setShowChangeRole(false);
          setCurrentRole(undefined);
        }}
        onCancel={() => {
          setShowChangeRole(false);
          setCurrentRole(undefined);
        }}
      >
        <p className="font-semibold mt-10 mb-2">Chọn quyền</p>

        <div className="mb-10">
          <Select
            className="w-full"
            options={[
              { label: 'User', value: 'ROLE_USER' },
              { label: 'Admin', value: 'ROLE_ADMIN' }
            ]}
            labelInValue
            onChange={(data) => setCurrentRole(data)}
          />
        </div>
      </Modal>

      {!!item?.active && (
        <button
          onClick={() => setShowBan(true)}
          type="button"
          className="w-10 h-9 rounded-md flex items-center justify-center bg-red-500 hover:bg-red-600 duration-200"
        >
          <FaTriangleExclamation color="#FFF" size={13} />
        </button>
      )}

      <Modal
        title="Bann người dùng"
        open={showBan}
        cancelText="Huỷ bỏ"
        okText="Xác nhận"
        okButtonProps={{ danger: true, loading: loadingBan }}
        onOk={() => {
          banMutate({ username: item?.id });
          setShowBan(false);
        }}
        onCancel={() => {
          setShowBan(false);
        }}
      >
        <p className="font-semibold mt-10 mb-10">Bạn có chắc chắn muốn ban người dùng này không?</p>
      </Modal>
    </div>
  );
};

export default memo(Action);
