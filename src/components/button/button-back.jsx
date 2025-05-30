import { Button } from 'antd';
import { memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ButtonBack = ({ route }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Button
      type="default"
      size="large"
      className="px-10"
      onClick={() => {
        if (location.key !== 'default') {
          navigate(-1);
          return;
        }
        navigate(route);
      }}
    >
      Trở về
    </Button>
  );
};

export default memo(ButtonBack);
