import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Button, Typography, Space, Dropdown, Drawer } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MenuOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import SiderMenu from './SiderMenu';
import { useIsMobile } from '../../hooks/useIsMobile';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

const ROLE_LABELS: Record<string, string> = {
  shipper: 'Грузоотправитель',
  carrier: 'Перевозчик',
  dispatcher: 'Диспетчер',
};

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  const menuClickClose = () => {
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}
        >
          <div
            style={{
              height: 48,
              margin: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
              {collapsed ? 'L' : 'Logistics'}
            </Text>
          </div>
          <SiderMenu />
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={240}
          styles={{
            body: { padding: 0, background: '#001529' },
            header: { display: 'none' },
          }}
        >
          <div
            style={{
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
              Logistics
            </Text>
          </div>
          <div onClick={menuClickClose}>
            <SiderMenu />
          </div>
        </Drawer>
      )}

      <Layout
        style={{
          marginLeft: isMobile ? 0 : collapsed ? 80 : 200,
          transition: 'margin-left 0.2s',
        }}
      >
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
          }}
        >
          <Button
            type="text"
            icon={
              isMobile ? (
                <MenuOutlined />
              ) : collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )
            }
            onClick={() =>
              isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)
            }
            style={{ fontSize: 18, width: 44, height: 44 }}
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
                {!isMobile && (
                  <>
                    <Text>{user?.full_name || user?.phone}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {user ? ROLE_LABELS[user.role] : ''}
                      {user?.is_admin ? ' (Admin)' : ''}
                    </Text>
                  </>
                )}
                {isMobile && (
                  <Text style={{ fontSize: 13 }}>
                    {user?.full_name || user?.phone}
                  </Text>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: isMobile ? 12 : 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
