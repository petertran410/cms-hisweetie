import ImgIntro from '@/assets/login-intro.png';
import Logo from '@/assets/logo.png';
import { useMutateLogin } from '@/services/auth.service'; // Make sure this import is correct
import { tokenState } from '@/states/common';
import { WEBSITE_NAME } from '@/utils/resource';
import { Button, Form, Input } from 'antd';
import { useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

const Login = () => {
  const token = useRecoilValue(tokenState);
  const { mutate: loginMutate } = useMutateLogin(); // This should work now

  const onFinish = useCallback(
    (values) => {
      loginMutate(values);
    },
    [loginMutate]
  );

  if (token) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex h-screen w-full">
      <Helmet>
        <title>Đăng nhập | {WEBSITE_NAME}</title>
      </Helmet>
      <div className="hidden lg:block w-[35%] h-full">
        <img src={ImgIntro} alt="login" className="h-full" />
      </div>
      <div className="w-full lg:w-[65%] h-full px-10">
        <div className="flex flex-col justify-center items-center h-full">
          <div className="flex items-center gap-5">
            <img src={Logo} alt="logo" className="w-14 h-14" />
            <p className="font-bold text-4xl">{WEBSITE_NAME}</p>
          </div>

          <Form
            name="loginForm"
            labelCol={{ span: 24 }}
            wrapperCol={{ span: 24 }}
            onFinish={onFinish}
            autoComplete="off"
            className="w-full md:w-[400px] mt-10"
          >
            <Form.Item
              label={<p className="font-bold text-md">Tài khoản</p>}
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tài khoản' }]}
            >
              <Input className="py-2" />
            </Form.Item>

            <Form.Item
              label={<p className="font-bold text-md">Mật khẩu</p>}
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
            >
              <Input.Password className="py-2" />
            </Form.Item>

            <div className="flex justify-center">
              <Form.Item className="mt-14">
                <Button type="primary" htmlType="submit" size="large" className="px-10">
                  Đăng nhập
                </Button>
              </Form.Item>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
