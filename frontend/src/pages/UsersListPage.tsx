import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Input,
  Select,
  Tag,
  Button,
  Space,
  Typography,
  Popconfirm,
  Modal,
  message,
} from 'antd';
import {
  SearchOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { usersApi } from '../api/users.api';
import { useAuthStore } from '../store/useAuthStore';
import type { User, UserRole, UpdateUserDto } from '../types';

const { Title } = Typography;

type EffectiveRole = UserRole | 'admin';

const ROLE_CONFIG: Record<EffectiveRole, { label: string; color: string }> = {
  shipper: { label: 'Грузоотправитель', color: 'blue' },
  carrier: { label: 'Перевозчик', color: 'green' },
  dispatcher: { label: 'Диспетчер', color: 'orange' },
  admin: { label: 'Админ', color: 'gold' },
};

const ROLE_SELECT_OPTIONS: { value: EffectiveRole; label: string }[] = [
  { value: 'shipper', label: 'Грузоотправитель' },
  { value: 'carrier', label: 'Перевозчик' },
  { value: 'dispatcher', label: 'Диспетчер' },
  { value: 'admin', label: 'Админ' },
];

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Все роли' },
  ...ROLE_SELECT_OPTIONS,
];

function effectiveRole(u: User): EffectiveRole {
  return u.is_admin ? 'admin' : u.role;
}

function roleToUpdate(role: EffectiveRole): UpdateUserDto {
  if (role === 'admin') return { role: 'dispatcher', is_admin: true };
  return { role, is_admin: false };
}

export default function UsersListPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = !!currentUser?.is_admin;

  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [savingRoleId, setSavingRoleId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== searchInput) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (roleFilter && roleFilter !== 'admin') params.role = roleFilter;
      if (search) params.search = search;
      const { data } = await usersApi.getUsers(params as any);
      const rows = roleFilter === 'admin' ? data.data.filter((u) => u.is_admin) : data.data;
      setUsers(rows);
      setTotal(roleFilter === 'admin' ? rows.length : data.total);
    } catch {
      message.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, [page, limit, roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const applyRoleChange = async (user: User, next: EffectiveRole) => {
    setSavingRoleId(user.id);
    try {
      await usersApi.updateUser(user.id, roleToUpdate(next));
      message.success('Роль обновлена');
      fetchUsers();
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      message.error(Array.isArray(raw) ? raw.join('; ') : raw || 'Ошибка');
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleRoleChange = (user: User, next: EffectiveRole) => {
    const current = effectiveRole(user);
    if (next === current) return;
    const who = user.full_name || user.phone;
    Modal.confirm({
      title: 'Изменить роль?',
      content: `${who}: «${ROLE_CONFIG[current].label}» → «${ROLE_CONFIG[next].label}»`,
      okText: 'Изменить',
      cancelText: 'Отмена',
      onOk: () => applyRoleChange(user, next),
    });
  };

  const handleToggleActive = async (user: User) => {
    try {
      await usersApi.updateUser(user.id, { is_active: !user.is_active });
      message.success(
        user.is_active ? 'Пользователь деактивирован' : 'Пользователь активирован',
      );
      fetchUsers();
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      message.error(Array.isArray(raw) ? raw.join('; ') : raw || 'Ошибка');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ФИО',
      dataIndex: 'full_name',
      render: (v: string | null) => v || '—',
    },
    {
      title: 'Телефон',
      dataIndex: 'phone',
    },
    {
      title: 'Роль',
      key: 'role',
      width: 200,
      render: (_: unknown, record: User) => {
        const role = effectiveRole(record);
        if (!isAdmin || record.id === currentUser?.id) {
          const cfg = ROLE_CONFIG[role];
          return <Tag color={cfg.color}>{cfg.label}</Tag>;
        }
        return (
          <Select
            size="small"
            value={role}
            options={ROLE_SELECT_OPTIONS}
            style={{ width: '100%' }}
            loading={savingRoleId === record.id}
            onChange={(v) => handleRoleChange(record, v)}
          />
        );
      },
    },
    {
      title: 'Компания',
      dataIndex: 'company_name',
      render: (v: string | null) => v || '—',
      responsive: ['md'],
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      render: (v: boolean) =>
        v ? <Tag color="green">Активен</Tag> : <Tag color="red">Неактивен</Tag>,
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'created_at',
      width: 150,
      render: (v: string) => new Date(v).toLocaleDateString('ru-RU'),
      ...(isAdmin ? {} : { responsive: ['lg' as const] }),
    },
  ];

  if (isAdmin) {
    columns.push({
      title: 'Действия',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: User) => {
        if (record.id === currentUser?.id) return null;
        return record.is_active ? (
          <Popconfirm
            title="Деактивировать пользователя?"
            okText="Да"
            cancelText="Нет"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleToggleActive(record)}
          >
            <Button size="small" danger icon={<StopOutlined />}>
              Деактивировать
            </Button>
          </Popconfirm>
        ) : (
          <Popconfirm
            title="Активировать пользователя?"
            okText="Да"
            cancelText="Нет"
            onConfirm={() => handleToggleActive(record)}
          >
            <Button size="small" type="primary" icon={<CheckCircleOutlined />}>
              Активировать
            </Button>
          </Popconfirm>
        );
      },
    });
  }

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize: limit,
    total,
    showTotal: (t) => `Всего: ${t}`,
    onChange: (p) => setPage(p),
  };

  return (
    <div>
      <Title level={4}>Пользователи</Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="Поиск по имени, телефону, компании..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 320 }}
          allowClear
        />
        <Select
          value={roleFilter}
          onChange={(v) => {
            setRoleFilter(v);
            setPage(1);
          }}
          options={ROLE_FILTER_OPTIONS}
          style={{ width: 200 }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        scroll={{ x: 800 }}
      />
    </div>
  );
}
