import ImgError from '@/assets/error.png';
import clsx from 'clsx';
import { memo } from 'react';

const ErrorScreen = ({ className, message }) => {
  return (
    <div className={clsx('flex flex-col items-center w-full h-full justify-center', className)}>
      <p className="font-semibold text-xl ">Đã xảy ra lỗi!</p>
      {!!message && <p className="font-medium text-red-500 mt-4 mb-8">{message}</p>}
      <img src={ImgError} alt="loading" style={{ width: 400 }} />
    </div>
  );
};

export default memo(ErrorScreen);
