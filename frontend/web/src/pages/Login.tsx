import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { MobileOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';

import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('password');
  
  const handlePasswordLogin = async (values: { phone: string; password: string }) => {
    setLoading(true);
    try {
      const { user, accessToken } = await authService.login(values);
      login(user, accessToken);
      message.success('登录成功');
      navigate('/app/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCodeLogin = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      const { user, accessToken } = await authService.loginWithCode(values.phone, values.code);
      login(user, accessToken);
      message.success('登录成功');
      navigate('/app/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendCode = async (phone: string) => {
    try {
      await authService.sendCode(phone);
      message.success('验证码已发送');
    } catch (error: any) {
      message.error(error.response?.data?.message || '发送失败');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">文枢AI</h1>
          <p className="text-gray-500 mt-2">小说全流程创作平台</p>
        </div>
        
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            {
              key: 'password',
              label: '密码登录',
              children: (
                <Form onFinish={handlePasswordLogin} layout="vertical">
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                    ]}
                  >
                    <Input prefix={<MobileOutlined />} placeholder="手机号" size="large" />
                  </Form.Item>
                  
                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password prefix={<LockOutlined />} placeholder="密码" size="large" />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'code',
              label: '验证码登录',
              children: (
                <Form onFinish={handleCodeLogin} layout="vertical">
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
                    ]}
                  >
                    <Input prefix={<MobileOutlined />} placeholder="手机号" size="large" />
                  </Form.Item>
                  
                  <Form.Item
                    name="code"
                    rules={[{ required: true, message: '请输入验证码' }]}
                  >
                    <Input
                      prefix={<SafetyOutlined />}
                      placeholder="验证码"
                      size="large"
                      suffix={
                        <Button
                          type="link"
                          onClick={() => {
                            const phone = (document.querySelector('input[placeholder="手机号"]') as HTMLInputElement)?.value;
                            if (phone) handleSendCode(phone);
                          }}
                        >
                          获取验证码
                        </Button>
                      }
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                      登录
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
        
        <div className="text-center">
          <span className="text-gray-500">还没有账号？</span>
          <Link to="/register" className="text-primary ml-1">立即注册</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
