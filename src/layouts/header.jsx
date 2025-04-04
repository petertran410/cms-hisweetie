import { Layout } from 'antd';
import { memo } from 'react';
import Breadcrumb from './components/breadcrumb';
import UserButton from './components/user-button';

const { Header: AntdHeader } = Layout;

const Header = ({ collapsedSidebar }) => {
  return (
    <AntdHeader
      style={{ left: collapsedSidebar ? 80 : 280, width: '-webkit-fill-available' }}
      className="hidden lg:flex bg-white z-50 px-7 border-b border-b-gray-200 duration-300 items-center justify-between h-[40px] lg:h-[64px] fixed top-0 w-full"
    >
      <Breadcrumb />

      <div className="hidden lg:block">
        <UserButton />
      </div>
    </AntdHeader>
  );
};

export default memo(Header);
