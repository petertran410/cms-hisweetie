import { TableAction } from '@/components/table';
import { useDeleteRecruitment } from '@/services/recruitment.service';
import { Tooltip } from 'antd';
import { memo } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Action = ({ item }) => {
  const { mutate: deleteMutate, isPending } = useDeleteRecruitment();

  return (
    <TableAction
      route="recruitment"
      item={item}
      onConfirmDelete={(id) => deleteMutate({ id })}
      loadingConfirm={isPending}
      disableView
      disableDelete
      otherButton={
        <Tooltip title="Hồ sơ ứng tuyển">
          <Link to={`/recruitment/${item.id}/applies`}>
            <div className="w-10 h-9 rounded-md flex items-center justify-center bg-[#009dff] hover:bg-[#008ee6] duration-200">
              <FaFileAlt color="#FFF" />
            </div>
          </Link>
        </Tooltip>
      }
    />
  );
};

export default memo(Action);
