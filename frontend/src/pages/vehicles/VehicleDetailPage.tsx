import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Descriptions,
  Popconfirm,
  Result,
  Space,
  Spin,
  Table,
  Typography,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useVehicle, useVehicleDocuments } from '../../hooks/useVehicles';
import { vehiclesApi } from '../../api/vehicles.api';
import { useAuthStore } from '../../store/useAuthStore';
import EditVehicleModal from '../../components/vehicles/EditVehicleModal';
import UploadDocumentModal from '../../components/vehicles/UploadDocumentModal';
import { DOC_TYPE_LABELS } from '../../components/vehicles/docTypes';
import type { VehicleDocument } from '../../types/vehicles.types';

const { Title } = Typography;

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAdmin = !!user?.is_admin;
  const isDispatcher = user?.role === 'dispatcher';
  const isCarrier = user?.role === 'carrier';

  const { data: vehicle, isLoading, isError } = useVehicle(id);
  const { data: documents, isLoading: docsLoading } = useVehicleDocuments(id);
  const qc = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const isOwnVehicle = !!vehicle && user?.id === vehicle.carrierId;
  const canModify = isDispatcher || isAdmin || (isCarrier && isOwnVehicle);
  const canUpload = canModify;
  const canDelete = canModify;

  const deactivateMutation = useMutation({
    mutationFn: () => vehiclesApi.deactivate(id!).then((r) => r.data),
    onSuccess: () => {
      message.success('Машина деактивирована');
      qc.invalidateQueries({ queryKey: ['vehicle', id] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ?? 'Не удалось деактивировать',
      );
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => vehiclesApi.activate(id!).then((r) => r.data),
    onSuccess: () => {
      message.success('Машина активирована');
      qc.invalidateQueries({ queryKey: ['vehicle', id] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось активировать');
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: string) => vehiclesApi.deleteDocument(docId),
    onSuccess: () => {
      message.success('Документ удалён');
      qc.invalidateQueries({ queryKey: ['vehicle-documents', id] });
      qc.invalidateQueries({ queryKey: ['vehicle', id] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось удалить');
    },
  });

  const handleDownload = async (docId: string) => {
    try {
      const { data } = await vehiclesApi.downloadDocument(docId);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ?? 'Не удалось получить ссылку',
      );
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (isError || !vehicle) {
    return (
      <Result
        status="404"
        title="Машина не найдена"
        extra={
          <Button type="primary" onClick={() => navigate('/vehicles')}>
            К списку машин
          </Button>
        }
      />
    );
  }

  const docColumns: ColumnsType<VehicleDocument> = [
    {
      title: 'Тип документа',
      dataIndex: 'docType',
      key: 'docType',
      render: (t: VehicleDocument['docType']) => DOC_TYPE_LABELS[t] ?? t,
    },
    { title: 'Имя файла', dataIndex: 'fileName', key: 'fileName' },
    {
      title: 'Дата загрузки',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 220,
      render: (_, r) => (
        <Space>
          <Button
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(r.id)}
          >
            Скачать
          </Button>
          {canDelete && (
            <Popconfirm
              title="Удалить документ?"
              okText="Да"
              cancelText="Нет"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteDocMutation.mutate(r.id)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Удалить
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Breadcrumb
        items={[
          { title: <Link to="/vehicles">Машины</Link> },
          { title: vehicle.plateNumber },
        ]}
      />

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/vehicles')}
            >
              Назад
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              {vehicle.plateNumber}
            </Title>
          </Space>
          <Space>
            {canModify && (
              <Button
                icon={<EditOutlined />}
                onClick={() => setEditOpen(true)}
              >
                Редактировать
              </Button>
            )}
            {canModify && vehicle.isActive && (
              <Popconfirm
                title="Деактивировать машину?"
                okText="Да"
                cancelText="Нет"
                okButtonProps={{ danger: true }}
                onConfirm={() => deactivateMutation.mutate()}
              >
                <Button danger icon={<StopOutlined />} loading={deactivateMutation.isPending}>
                  Деактивировать
                </Button>
              </Popconfirm>
            )}
            {canModify && !vehicle.isActive && (
              <Popconfirm
                title="Активировать машину?"
                okText="Да"
                cancelText="Нет"
                onConfirm={() => activateMutation.mutate()}
              >
                <Button type="primary" icon={<CheckCircleOutlined />} loading={activateMutation.isPending}>
                  Активировать
                </Button>
              </Popconfirm>
            )}
          </Space>
        </div>

        <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="small">
          <Descriptions.Item label="Гос. номер">
            {vehicle.plateNumber}
          </Descriptions.Item>
          <Descriptions.Item label="Перевозчик">
            {vehicle.carrier?.full_name ||
              vehicle.carrier?.company_name ||
              vehicle.carrier?.phone ||
              '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Тип транспорта">
            {vehicle.transportType?.name ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Грузоподъёмность (кг)">
            {vehicle.capacityKg != null && vehicle.capacityKg !== ''
              ? Number(vehicle.capacityKg).toLocaleString('ru-RU')
              : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Статус">
            {vehicle.isActive ? (
              <Badge status="success" text="Активна" />
            ) : (
              <Badge status="default" text="Неактивна" />
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Характеристики" span={2}>
            {vehicle.specs ?? '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Дата добавления" span={2}>
            {dayjs(vehicle.createdAt).format('DD.MM.YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Документы
          </Title>
          {canUpload && (
            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              onClick={() => setUploadOpen(true)}
            >
              Загрузить документ
            </Button>
          )}
        </div>

        <Table<VehicleDocument>
          rowKey="id"
          columns={docColumns}
          dataSource={documents ?? []}
          loading={docsLoading}
          pagination={false}
          locale={{ emptyText: 'Документов пока нет' }}
        />
      </Card>

      <EditVehicleModal
        open={editOpen}
        vehicle={vehicle}
        onClose={() => setEditOpen(false)}
      />
      {id && (
        <UploadDocumentModal
          open={uploadOpen}
          vehicleId={id}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </Space>
  );
}
