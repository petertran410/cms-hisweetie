import LogoDiepTra from '@/assets/logo-dieptra.png';
import LogoLermao from '@/assets/logo-lermao.png';
import { Button, Layout, Popover } from 'antd';
import clsx from 'clsx';
import { useState } from 'react';
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
                      onClick={() => {
                        setOpenPopover(false);
                        if (!isActive) {
                          localStorage.setItem('website', code);
                          window.location.reload();
                        }
                      }}
                    >
                      <div className="w-5 h-5">{!!isActive && <FaCheck className="mt-0.5" color="green" />}</div>
                      <img src={logo} className="w-4 object-cover h-4" />
                      <p className={clsx({ 'font-semibold': isActive })}>{title}</p>
                    </div>
                  );
                })}
              </div>
            }
            title="Chọn website"
            trigger="click"
            open={openPopover}
            onOpenChange={(data) => setOpenPopover(data)}
          >
            <button type="button" className="gap-3 flex flex-row items-center">
              <img src={currentWebsite.logo} className="w-auto object-cover h-8" />
              <p className="text-white font-semibold text-[16px]">{currentWebsite.title}</p>
              <IoChevronDownOutline color="#FFF" />
            </button>
          </Popover>
        )}

        <Button type="text" onClick={() => setCollapsedSidebar(!collapsedSidebar)}>
          {collapsedSidebar ? (
            <HiChevronDoubleRight color="#254f74" size={20} />
          ) : (
            <HiChevronDoubleLeft color="#254f74" size={20} />
          )}
        </Button>
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
