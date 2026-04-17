import { useState, useEffect, useCallback } from 'react';
import { Table, Input, Select, Tag, Button, Space, Typography, message, Popconfirm } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { usersApi } from '../api/users.api';
import { useAuthStore } from '../store/useAuthStore';
import type { User, UserRole } from '../types';

const { Title } = Typography;

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  shipper: { label: 'Грузоотправитель', color: 'blue' },
  carrier: { label: 'Перевозчик', color: 'green' },
  dispatcher: { label: 'Диспетчер', color: 'orange' },
};

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Все роли' },
  { value: 'shipper', label: 'Грузоотправитель' },
  { value: 'carrier', label: 'Перевозчик' },
  { value: 'dispatcher', label: 'Диспетчер' },
];

export default function UsersListPage() {
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [role, setRole] = useState<string>('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page, limit };
      if (role) params.role = role;
      if (search) params.search = search;
      const { data } = await usersApi.getUsers(params as any);
      setUsers(data.data);
      setTotal(data.total);
    } catch {
      message.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, [page, limit, role, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleActive = async (user: User) => {
    try {
      await usersApi.updateUser(user.id, { is_active: !user.is_active });
      message.success(user.is_active ? 'Пользователь деактивирован' : 'Пользователь активирован');
      fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
    }
  };

  const handleToggleAdmin = async (user: User) => {
    try {
      await usersApi.updateUser(user.id, { is_admin: !user.is_admin });
      message.success(user.is_admin ? 'Права админа сняты' : 'Назначен админом');
      fetchUsers();
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка');
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
      dataIndex: 'role',
      render: (r: UserRole) => {
        const cfg = ROLE_CONFIG[r];
        return cfg ? <Tag color={cfg.color}>{cfg.label}</Tag> : r;
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
      render: (v: boolean) => v ? <Tag color="green">Активен</Tag> : <Tag color="red">Неактивен</Tag>,
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'created_at',
      render: (v: string) => new Date(v).toLocaleDateString('ru-RU'),
      responsive: ['lg'],
    },
  ];

  if (currentUser?.is_admin) {
    columns.push({
      title: 'Действия',
      key: 'actions',
      render: (_: unknown, record: User) => {
        if (record.id === currentUser.id) return null;
        return (
          <Space size="small" wrap>
            <Popconfirm
              title={record.is_active ? 'Деактивировать пользователя?' : 'Активировать пользователя?'}
              onConfirm={() => handleToggleActive(record)}
              okText="Да"
              cancelText="Нет"
            >
              <Button size="small" danger={record.is_active}>
                {record.is_active ? 'Деактивировать' : 'Активировать'}
              </Button>
            </Popconfirm>
            <Popconfirm
              title={record.is_admin ? 'Снять права админа?' : 'Назначить админом?'}
              onConfirm={() => handleToggleAdmin(record)}
              okText="Да"
              cancelText="Нет"
            >
              <Button size="small" type={record.is_admin ? 'default' : 'primary'}>
                {record.is_admin ? 'Снять админа' : 'Назначить админом'}
              </Button>
            </Popconfirm>
          </Space>
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
        <Select
          value={role}
          onChange={(v) => { setRole(v); setPage(1); }}
          options={ROLE_FILTER_OPTIONS}
          style={{ width: 200 }}
          placeholder="Фильтр по роли"
        />
        <Input.Search
          placeholder="Поиск по имени, телефону..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={(v) => { setSearch(v); setPage(1); }}
          enterButton={<SearchOutlined />}
          style={{ width: 300 }}
          allowClear
          onClear={() => { setSearch(''); setSearchInput(''); setPage(1); }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        scroll={{ x: 600 }}
      />
    </div>
  );
}
