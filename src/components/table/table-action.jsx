import { Modal, Tooltip } from 'antd';
import { memo, useState } from 'react';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa';
import { RiEnglishInput } from 'react-icons/ri';
import { FaEye } from 'react-icons/fa6';
import { Link } from 'react-router-dom';

const TableAction = (props) => {
  const { item, onConfirmDelete, loadingConfirm, route, disableDelete, disableView, disableEdit, otherButton } = props;
  const { id } = item || {};
  const [showDelete, setShowDelete] = useState(false);

  return (
    <div className="flex items-center gap-4">
      {!!otherButton && otherButton}

      {!disableView && (
        <Tooltip title="Xem chi tiết">
          <Link to={`/${route}/${id}/detail`} type="primary">
            <div className="w-10 h-9 rounded-md flex items-center justify-center bg-[#009dff] hover:bg-[#008ee6] duration-200">
              <FaEye color="#FFF" />
            </div>
          </Link>
        </Tooltip>
      )}

      {!disableEdit && (
        <Tooltip title="Chỉnh sửa">
          <Link to={`/${route}/${id}/edit`} type="primary">
            <div className="w-10 h-9 rounded-md flex items-center justify-center bg-[#009dff] hover:bg-[#008ee6] duration-200">
              <FaPencilAlt size={13} color="#FFF" />
            </div>
          </Link>
        </Tooltip>
      )}

      {!disableEdit && (
        <Tooltip title="Chỉnh sửa">
          <Link to={`/${route}/${id}/edit-en`} type="primary">
            <div className="w-10 h-9 rounded-md flex items-center justify-center bg-[#009dff] hover:bg-[#008ee6] duration-200">
              <RiEnglishInput size={13} color="#FFF" />
            </div>
          </Link>
        </Tooltip>
      )}

      {!disableDelete && (
        <Tooltip title="Xoá">
          <button
            onClick={() => setShowDelete(true)}
            type="button"
            className="w-10 h-9 rounded-md flex items-center justify-center bg-[#009dff] hover:bg-[#008ee6] duration-200"
          >
            <FaTrashAlt color="#FFF" size={13} />
          </button>
        </Tooltip>
      )}

      <Modal
        title="Xác nhận xoá"
        open={showDelete}
        cancelText="Huỷ bỏ"
        okText="Xác nhận"
        okButtonProps={{ danger: true, loading: loadingConfirm }}
        onOk={() => {
          onConfirmDelete && onConfirmDelete(id);
          setShowDelete(false);
        }}
        onCancel={() => setShowDelete(false)}
      >
        <p className="py-5">Bạn có chắc chắn muốn xoá thông tin này?</p>
      </Modal>
    </div>
  );
};

export default memo(TableAction);
