import ImgUser from '@/assets/user-avatar.png';
import { tokenState, userInfoAtom } from '@/states/common';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Popover } from 'antd';
import { memo, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

const UserButton = () => {
  const [open, setOpen] = useState(false);
  const [userInfo, setUserInfo] = useRecoilState(userInfoAtom);
  const setToken = useSetRecoilState(tokenState);
  const queryClient = useQueryClient();

  const { full_name } = userInfo?.[0] || {};

  const popoverContent = (
    <div className="w-80 rounded-sm overflow-hidden">
      <div className="bg-[#1e3b57] flex items-center gap-3 px-4 py-3">
        <img src={ImgUser} alt="user" className="w-10 h-10" />
        <span className="font-semibold text-white">{full_name}</span>
      </div>
      <div className="px-4 py-6">
        <Button
          type="primary"
          danger
          onClick={() => {
            setUserInfo(undefined);
            setToken(undefined);
            queryClient.removeQueries({ queryKey: ['GET_USER_INFO'] });
          }}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <Popover
      overlayInnerStyle={{ padding: 0 }}
      content={popoverContent}
      placement="bottomRight"
      arrow={false}
      trigger="click"
      open={open}
      onOpenChange={(data) => setOpen(data)}
    >
      <div className="flex items-center">
        <button
          type="button"
          className="lg:h-12 rounded-full lg:rounded-xl border border-gray-200 bg-gray-100 lg:px-4 hover:bg-gray-50 duration-200"
        >
          <div className="h-full flex items-center gap-2">
            <img src={ImgUser} alt="user" className="w-8 h-8" />
            <span className="hidden lg:block font-semibold">{full_name}</span>
          </div>
        </button>
      </div>
    </Popover>
  );
};

export default memo(UserButton);
