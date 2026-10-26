import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  AppstoreOutlined,
  BarcodeOutlined,
  BellOutlined,
  DownOutlined,
  FileTextOutlined,
  InboxOutlined,
  LineChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  QrcodeOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  Dropdown,
  Layout,
  Menu,
  MenuProps,
  message,
} from 'antd';
import { useAuth } from '../hooks/useAuth';

const { Header, Sider, Content } = Layout;

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <AppstoreOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/stock-management',
      icon: <InboxOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/stock-management">Stock Management</Link>,
    },
    {
      key: '/product-identification',
      icon: <BarcodeOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/product-identification">Product Identification</Link>,
    },
    {
      key: '/sales-reports',
      icon: <LineChartOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/sales-reports">Sales Reports</Link>,
    },
    {
      key: '/reports',
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/reports">Reports</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined style={{ fontSize: '16px' }} />,
      label: <Link to="/settings">Settings</Link>,
    },
  ];

  const userDropdownItems: MenuProps['items'] = [
    {
      key: 'user-header',
      disabled: true,
      label: (
        <div className="py-1">
          <p className="font-semibold text-slate-800 m-0">{user?.fullName || 'Admin'}</p>
          <p className="text-xs text-slate-400 m-0">{user?.email || 'admin@example.com'}</p>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Determine active route
  const getActiveKey = () => {
    const path = location.pathname;
    if (path.startsWith('/stock-management')) return '/stock-management';
    if (path.startsWith('/product-identification')) return '/product-identification';
    if (path.startsWith('/sales-reports')) return '/sales-reports';
    if (path.startsWith('/reports')) return '/reports';
    if (path.startsWith('/settings')) return '/settings';
    return '/dashboard';
  };

  const brandLogo = (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800/80 bg-[#081220]">
      {/* 3D Cube Icon */}
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <span className="font-extrabold text-base text-white tracking-wide block leading-tight">
            StockManager
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-tight block">
            QR/Barcode Stock Management
          </span>
        </div>
      )}
    </div>
  );

  return (
    <Layout className="min-h-screen bg-[#f4f7fb]">
      {/* Desktop Sider in Dark Navy */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => setCollapsed(val)}
        breakpoint="lg"
        collapsedWidth={75}
        width={230}
        className="hidden md:block shadow-lg z-20 border-r border-slate-800"
        style={{
          background: '#0c192c',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
        theme="dark"
        trigger={null}
      >
        <div className="flex flex-col h-full justify-between">
          <div>
            {brandLogo}
            <div className="py-3 px-2">
              <Menu
                mode="inline"
                theme="dark"
                selectedKeys={[getActiveKey()]}
                items={menuItems}
                style={{
                  background: 'transparent',
                  borderRight: 0,
                  fontSize: '13.5px',
                  fontWeight: 500,
                }}
                className="stockmanager-menu"
              />
            </div>
          </div>

          {/* Sider Collapse Trigger */}
          <div className="p-3 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
            <Button
              type="text"
              className="text-slate-400 hover:text-white"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
            {!collapsed && (
              <span className="text-xs text-slate-500 font-mono">v1.0 Pro</span>
            )}
          </div>
        </div>
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white">
              <QrcodeOutlined />
            </div>
            <span className="font-bold text-white text-sm">StockManager</span>
          </div>
        }
        placement="left"
        onClose={() => setMobileDrawerOpen(false)}
        open={mobileDrawerOpen}
        styles={{
          header: { background: '#081220', borderBottom: '1px solid #1e293b', color: '#fff' },
          body: { padding: 0, background: '#0c192c' },
        }}
        width={250}
      >
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[getActiveKey()]}
          items={menuItems}
          onClick={() => setMobileDrawerOpen(false)}
          style={{ background: 'transparent' }}
        />
      </Drawer>

      {/* Main Layout Area */}
      <Layout className="bg-[#f4f7fb]">
        {/* Top Header */}
        <Header
          className="sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8 bg-white border-b border-slate-200 shadow-sm"
          style={{ height: '56px', lineHeight: '56px' }}
        >
          {/* Mobile hamburger button */}
          <Button
            type="text"
            className="md:hidden text-slate-700 p-0"
            icon={<MenuUnfoldOutlined style={{ fontSize: '18px' }} />}
            onClick={() => setMobileDrawerOpen(true)}
          />

          <div className="hidden md:block">
            {/* Breadcrumb or subtitle */}
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Inventory & Barcode Console
            </span>
          </div>

          {/* Right Header: Notification + Admin Profile */}
          <div className="flex items-center gap-4">
            <Badge count={3} size="small" offset={[-2, 4]}>
              <Button
                type="text"
                shape="circle"
                icon={<BellOutlined style={{ fontSize: '18px', color: '#475569' }} />}
              />
            </Badge>

            <Dropdown menu={{ items: userDropdownItems }} trigger={['click']} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors">
                <Avatar
                  size={30}
                  icon={<UserOutlined />}
                  src={user?.avatarUrl}
                  className="bg-blue-600 text-white"
                />
                <span className="text-sm font-semibold text-slate-700">
                  {user?.fullName?.split(' ')[0] || 'Admin'}
                </span>
                <DownOutlined style={{ fontSize: '10px', color: '#94a3b8' }} />
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* Content Area */}
        <Content className="p-4 sm:p-6 lg:p-7 max-w-[1550px] w-full mx-auto">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
