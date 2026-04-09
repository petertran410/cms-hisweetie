import LogoDiepTra from '@/assets/logo-dieptra.png';
import LogoLermao from '@/assets/logo-lermao.png';
import { Badge, Button, Layout, Modal, Popover } from 'antd';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { HiChevronDoubleLeft, HiChevronDoubleRight } from 'react-icons/hi';
import { IoChevronDownOutline } from 'react-icons/io5';
import packageJson from '../../../package.json';
import MenuLayout from '../menu';

const { Sider } = Layout;

const SelectWebsite = ({ collapsedSidebar, setCollapsedSidebar }) => {
  const [openPopover, setOpenPopover] = useState(false);
  const localWebsite = localStorage.getItem('website');

  const WEBSITE_LIST = [
    {
      code: 'lermao',
      title: 'Lermao',
      logo: LogoLermao
    },
    {
      code: 'dieptra',
      title: 'Diep Tra',
      logo: LogoDiepTra
    }
  ];

  const currentWebsite = WEBSITE_LIST.find((i) => i.code === localWebsite) || WEBSITE_LIST[0];

  useEffect(() => {
    const expected = localStorage.getItem('website') || 'lermao';
    if (expected !== localWebsite) {
      console.warn(`[Site Mismatch] localStorage='${localWebsite}' nhưng expected='${expected}'`);
    }
  }, [localWebsite]);

  const handleSiteSwitch = (code) => {
    if (code === currentWebsite.code) return;

    Modal.confirm({
      title: `Chuyển sang ${code === 'lermao' ? 'Gấu LerMao' : 'Diep Tra'}?`,
      content: 'Bạn sẽ rời khỏi trang hiện tại. Mọi thay đổi chưa lưu sẽ bị mất.',
      okText: 'Chuyển',
      cancelText: 'Hủy',
      onOk: () => {
        localStorage.setItem('website', code);
        window.location.reload();
      }
    });
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsedSidebar}
      width={280}
      className="hidden lg:block min-h-screen fixed top-0 left-0"
    >
      <div className="flex items-center justify-between py-5 pl-5 pr-2 ">
        {!collapsedSidebar && (
          <>
            <Popover
              content={
                <div className="flex flex-col gap-2">
                  {WEBSITE_LIST.map((item) => {
                    const { code, title, logo } = item;
                    const isActive = currentWebsite.code === code;

                    return (
                      <div
                        key={code}
                        className={clsx('flex items-center gap-2 cursor-pointer hover:opacity-100 duration-200', {
                          'opacity-75': !isActive
                        })}
                        onClick={() => handleSiteSwitch(code)}
                      >
                        <div className="w-5 h-5">{!!isActive && <FaCheck className="mt-0.5" color="green" />}</div>
                        <img src={logo} className="w-4 object-cover h-4" />
                        <p className={clsx({ 'font-semibold': isActive })}>{title}</p>
                      </div>
                    );
                  })}
                </div>
              }
              trigger="click"
              open={openPopover}
              onOpenChange={setOpenPopover}
              placement="bottomLeft"
            >
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
                <img src={currentWebsite.logo} className="w-10 h-10" alt={currentWebsite.title} />
                <div>
                  <div className="text-sm font-semibold text-gray-800">{currentWebsite.title}</div>
                  <div className="text-[10px] text-gray-400 -mt-0.5">v{packageJson.version}</div>
                </div>
                <IoChevronDownOutline className="text-gray-400" />
              </div>
            </Popover>

            <Badge
              count={currentWebsite.code.toUpperCase()}
              style={{
                backgroundColor: currentWebsite.code === 'lermao' ? '#1890ff' : '#52c41a',
                fontWeight: 600,
                fontSize: '10px'
              }}
            />
          </>
        )}

        <Button
          type="text"
          icon={collapsedSidebar ? <HiChevronDoubleRight /> : <HiChevronDoubleLeft />}
          onClick={() => setCollapsedSidebar(!collapsedSidebar)}
          className="text-gray-500"
        />
      </div>
      <div className="w-full h-px bg-[#12283a]" />
      <MenuLayout />
      {!collapsedSidebar && (
        <div className="absolute bottom-0 left-0 border-t border-[#12283a] w-full py-2.5 flex justify-center">
          <p className="text-[#4d4d4d]">Version: {packageJson.version}</p>
        </div>
      )}
    </Sider>
  );
};

export default SelectWebsite;
