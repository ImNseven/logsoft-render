import { useState } from 'react';
import { Tabs, Table, Button, Space, Typography, Popconfirm, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import DictionaryItemModal, { DictionaryType } from '../../components/admin/DictionaryItemModal';
import type { OriginPoint, TransportType } from '../../types';

const { Title } = Typography;

type DictItem = OriginPoint | TransportType;

function DictionaryTable({ type }: { type: DictionaryType }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<DictItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const queryKey = ['admin', type, 'all'];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      (type === 'origin-points'
        ? adminApi.getAllOriginPoints()
        : adminApi.getAllTransportTypes()
      ).then((r) => r.data),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: [type] });
  };

  const handleRemove = async (item: DictItem) => {
    try {
      if (type === 'origin-points') {
        await adminApi.removeOriginPoint(item.id);
      } else {
        await adminApi.removeTransportType(item.id);
      }
      message.success('Удалено');
      refresh();
    } catch (err: any) {
      const raw = err?.response?.data?.message;
      message.error(Array.isArray(raw) ? raw.join('; ') : raw || 'Ошибка');
    }
  };

  const columns: ColumnsType<DictItem> = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: 'Название', dataIndex: 'name' },
    {
      title: 'Действия',
      key: 'actions',
      width: 240,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(record)}>
            Изменить
          </Button>
          <Popconfirm
            title="Удалить запись?"
            description="Это действие нельзя отменить."
            onConfirm={() => handleRemove(record)}
            okText="Удалить"
            cancelText="Отмена"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
          Добавить
        </Button>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data ?? []}
        loading={isLoading}
        pagination={false}
        scroll={{ x: 600 }}
      />
      <DictionaryItemModal
        open={createOpen || !!editing}
        type={type}
        item={editing}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        onSuccess={refresh}
      />
    </>
  );
}

export default function AdminDictionariesPage() {
  return (
    <div>
      <Title level={4}>Справочники</Title>
      <Tabs
        items={[
          {
            key: 'origin-points',
            label: 'Пункты отправки',
            children: <DictionaryTable type="origin-points" />,
          },
          {
            key: 'transport-types',
            label: 'Типы транспорта',
            children: <DictionaryTable type="transport-types" />,
          },
        ]}
      />
    </div>
  );
}
