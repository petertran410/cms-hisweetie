import { ErrorScreen, LoadingScreen } from '@/components/effect-screen';
import { useQueryUserInfo } from '@/services/auth.service';
import { tokenState, userInfoAtom } from '@/states/common';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Layout, theme } from 'antd';
import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Navigate, Outlet } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useMediaQuery } from '../utils/helper';
import { useGetCurrentRoute } from './components/helper';
import SelectWebsite from './components/select-website';
import Header from './header';
import HeaderMobile from './header-mobile';

const { Content } = Layout;

const MainLayout = () => {
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken();
  const token = useRecoilValue(tokenState);
  const { isLoading, error } = useQueryUserInfo();
  const currentRoute = useGetCurrentRoute();
  const { section } = currentRoute || {};
  const [collapsedSidebar, setCollapsedSidebar] = useState(false);
  const setUserInfo = useSetRecoilState(userInfoAtom);
  const setToken = useSetRecoilState(tokenState);
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery('(max-width: 576px)');
  const isTablet = useMediaQuery('(min-width: 577px) and (max-width : 991px)');

  const getMarginLeft = () => {
    if (isMobile || isTablet) {
      return collapsedSidebar ? 280 : 12;
    }

    return collapsedSidebar ? 80 : 280;
  };

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (isLoading) {
    return <LoadingScreen className="h-screen" />;
  }

  if (error) {
    return (
      <div className="flex h-screen justify-center items-center gap-5 flex-col">
        <div>
          <ErrorScreen message={error.message} />
        </div>
        <Button
          type="primary"
          onClick={() => {
            setUserInfo(undefined);
            setToken(undefined);
            queryClient.removeQueries({ queryKey: ['GET_USER_INFO'] });
          }}
        >
          Đăng nhập lại
        </Button>
      </div>
    );
  }

  return (
    <Layout className="min-h-screen">
      <SelectWebsite collapsedSidebar={collapsedSidebar} setCollapsedSidebar={setCollapsedSidebar} />

      <Layout>
        <HeaderMobile />
        <Header collapsedSidebar={collapsedSidebar} />
        <Content
          className="m-4 md:m-6"
          style={{
            minHeight: 400,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            marginLeft: getMarginLeft()
          }}
        >
          <div className="py-4 px-5 flex items-center gap-3">
            <div className="w-[2px] h-[15px] bg-[#3699ff]" />
            <h2 className="font-bold uppercase mt-0.5">{section}</h2>
          </div>
          <div className="p-5">
            <ErrorBoundary
              FallbackComponent={({ error }) => <ErrorScreen className="mt-20" message={error?.message} />}
            >
              <Outlet />
            </ErrorBoundary>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
