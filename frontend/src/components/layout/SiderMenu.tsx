import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  CarOutlined,
  TruckOutlined,
  DollarOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types';

interface MenuItemDef {
  key: string;
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: 'all' | UserRole[];
  adminOnly?: boolean;
}

const allMenuItems: MenuItemDef[] = [
  { key: 'dashboard', icon: <DashboardOutlined />, label: 'Дашборд', path: '/dashboard', roles: 'all' },
  { key: 'loads', icon: <CarOutlined />, label: 'Грузы', path: '/loads', roles: ['shipper', 'dispatcher'] },
  { key: 'vehicles', icon: <TruckOutlined />, label: 'Машины', path: '/vehicles', roles: ['carrier', 'dispatcher'] },
  { key: 'deals', icon: <DollarOutlined />, label: 'Сделки', path: '/deals', roles: ['shipper', 'carrier', 'dispatcher'] },
  { key: 'users', icon: <TeamOutlined />, label: 'Пользователи', path: '/users', roles: ['dispatcher'] },
  { key: 'dictionaries', icon: <BookOutlined />, label: 'Справочники', path: '/dictionaries', roles: 'all', adminOnly: true },
  { key: 'profile', icon: <UserOutlined />, label: 'Профиль', path: '/profile', roles: 'all' },
];

export default function SiderMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const isAdmin = !!user?.is_admin;

  const visibleItems = allMenuItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    if (item.roles === 'all') return true;
    if (isAdmin) return true;
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
