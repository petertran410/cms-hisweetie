import ImgLoading from '@/assets/loading.svg';
import clsx from 'clsx';
import { memo } from 'react';

const LoadingScreen = ({ className }) => {
  return (
    <div className={clsx('flex flex-col items-center w-full h-full justify-center', className)}>
      <p className="font-semibold text-xl">Hệ thống đang tải dữ liệu</p>
      <img src={ImgLoading} alt="loading" className="w-28" />
    </div>
  );
};

export default memo(LoadingScreen);
