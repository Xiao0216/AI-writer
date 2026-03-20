import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Button } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  SettingOutlined,
  CrownOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'membership',
      icon: <CrownOutlined />,
      label: '会员中心',
      onClick: () => navigate('/app/membership'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];
  
  const siderMenuItems = [
    {
      key: '/app/dashboard',
      icon: <HomeOutlined />,
      label: <Link to="/app/dashboard">工作台</Link>,
    },
    {
      key: '/app/works',
      icon: <BookOutlined />,
      label: <Link to="/app/dashboard">我的作品</Link>,
    },
    {
      key: '/app/settings',
      icon: <SettingOutlined />,
      label: <Link to="/app/settings">设置</Link>,
    },
  ];
  
  return (
    <AntLayout className="min-h-screen">
      <Header className="flex items-center justify-between px-6 bg-white border-b">
        <div className="flex items-center">
          <Link to="/app/dashboard" className="text-xl font-bold text-primary">
            文枢AI
          </Link>
          <span className="ml-2 text-gray-400 text-sm">小说全流程创作平台</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button type="primary">新建作品</Button>
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <span className="ml-2">{user?.nickname || '用户'}</span>
            </div>
          </Dropdown>
        </div>
      </Header>
      
      <AntLayout>
        <Sider width={200} className="bg-white border-r">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            items={siderMenuItems}
            className="border-r-0"
          />
        </Sider>
        
        <Content className="p-6 bg-gray-50">
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
