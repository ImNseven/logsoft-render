import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types';

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: 'all' | UserRole[];
}

const allMenuItems: MenuItem[] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Дашборд', path: '/dashboard', roles: 'all' },
  { key: 'users', icon: <TeamOutlined />, label: 'Пользователи', path: '/users', roles: ['dispatcher'] },
  { key: 'profile', icon: <UserOutlined />, label: 'Профиль', path: '/profile', roles: 'all' },
];

export default function SiderMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const visibleItems = allMenuItems.filter((item) => {
    if (item.roles === 'all') return true;
    if (user?.is_admin) return true;
    return user ? item.roles.includes(user.role) : false;
  });

  const items = visibleItems.map((item) => ({
    key: item.key,
    icon: item.icon,
    label: item.label,
  }));

  const selectedKey = visibleItems.find((item) =>
    location.pathname.startsWith(item.path),
  )?.key;

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={selectedKey ? [selectedKey] : []}
      items={items}
      onClick={({ key }) => {
        const item = visibleItems.find((i) => i.key === key);
        if (item) navigate(item.path);
      }}
    />
  );
}
