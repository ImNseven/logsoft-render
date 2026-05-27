import { useState } from 'react';
import { Descriptions, Button, Modal, Form, Input, message, Popconfirm, Space, Tag, Typography } from 'antd';
import { EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/useAuthStore';
import { usersApi } from '../api/users.api';
import { useResponsiveModalWidth } from '../hooks/useIsMobile';

const { Title } = Typography;

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  shipper: { label: 'Грузоотправитель', color: 'blue' },
  carrier: { label: 'Перевозчик', color: 'green' },
  dispatcher: { label: 'Диспетчер', color: 'orange' },
};

export default function ProfilePage() {
  const { user, fetchProfile, logout } = useAuthStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const modalSize = useResponsiveModalWidth();

  const openEdit = () => {
    form.setFieldsValue({
      full_name: user?.full_name || '',
      company_name: user?.company_name || '',
    });
    setModalOpen(true);
  };

  const onSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      await usersApi.updateMe(values);
      await fetchProfile();
      setModalOpen(false);
      message.success('Профиль обновлён');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const roleInfo = user ? ROLE_LABELS[user.role] : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 8, flexWrap: 'wrap' }}>
        <Title level={4} style={{ margin: 0 }}>Профиль</Title>
        <Space wrap>
          <Button type="primary" icon={<EditOutlined />} onClick={openEdit}>
            Редактировать
          </Button>
          <Popconfirm
            title="Выйти из аккаунта?"
            okText="Выйти"
            cancelText="Отмена"
            okButtonProps={{ danger: true }}
            onConfirm={logout}
          >
            <Button danger icon={<LogoutOutlined />}>
              Выйти
            </Button>
          </Popconfirm>
        </Space>
      </div>

      <Descriptions bordered column={{ xs: 1, sm: 2 }}>
        <Descriptions.Item label="Телефон">{user?.phone}</Descriptions.Item>
        <Descriptions.Item label="Роль">
          {roleInfo && <Tag color={roleInfo.color}>{roleInfo.label}</Tag>}
          {user?.is_admin && <Tag color="red">Админ</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="ФИО">{user?.full_name || '—'}</Descriptions.Item>
        <Descriptions.Item label="Компания">{user?.company_name || '—'}</Descriptions.Item>
        <Descriptions.Item label="Дата регистрации">
          {user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}
        </Descriptions.Item>
        <Descriptions.Item label="Статус">
          {user?.is_active ? <Tag color="green">Активен</Tag> : <Tag color="red">Неактивен</Tag>}
        </Descriptions.Item>
      </Descriptions>

      <Modal
        title="Редактировать профиль"
        open={modalOpen}
        onOk={onSave}
        onCancel={() => setModalOpen(false)}
        confirmLoading={saving}
        okText="Сохранить"
        cancelText="Отмена"
        {...modalSize}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="ФИО" name="full_name">
            <Input placeholder="Иванов Иван Иванович" />
          </Form.Item>
          <Form.Item label="Компания" name="company_name">
            <Input placeholder="ООО Логистика" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
