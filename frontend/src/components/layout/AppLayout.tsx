import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Button, Typography, Space, Dropdown } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import SiderMenu from './SiderMenu';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const ROLE_LABELS: Record<string, string> = {
  shipper: 'Грузоотправитель',
  carrier: 'Перевозчик',
  dispatcher: 'Диспетчер',
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={0}
        onBreakpoint={(broken) => setCollapsed(broken)}
        style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
      >
        <div style={{
          height: 48,
          margin: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
            {collapsed ? 'L' : 'Logistics'}
          </Text>
        </div>
        <SiderMenu />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 0 : 200, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Space>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'logout',
                    icon: <LogoutOutlined />,
                    label: 'Выйти',
                    danger: true,
                    onClick: logout,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <UserOutlined />
                <Text>{user?.full_name || user?.phone}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {user ? ROLE_LABELS[user.role] : ''}
                  {user?.is_admin ? ' (Admin)' : ''}
                </Text>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
