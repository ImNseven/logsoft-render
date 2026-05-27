import { Button, Card, Space, Table, Tooltip, Typography, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useVehicleDocuments } from '../../hooks/useVehicles';
import { vehiclesApi } from '../../api/vehicles.api';
import { DOC_TYPE_LABELS } from '../vehicles/docTypes';
import MobileCardList from '../common/MobileCardList';
import { useIsMobile } from '../../hooks/useIsMobile';
import type { VehicleDocument } from '../../types/vehicles.types';

const { Title } = Typography;

interface Props {
  vehicleId: string | undefined;
  canDownload: boolean;
}

export default function DealDocumentsList({ vehicleId, canDownload }: Props) {
  const { data, isLoading } = useVehicleDocuments(vehicleId);
  const isMobile = useIsMobile();

  const handleDownload = async (id: string) => {
    try {
      const { data } = await vehiclesApi.downloadDocument(id);
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      message.error(err?.response?.data?.message ?? 'Не удалось получить ссылку');
    }
  };

  const baseColumns: ColumnsType<VehicleDocument> = [
    {
      title: 'Тип документа',
      dataIndex: 'docType',
      key: 'docType',
      render: (t: VehicleDocument['docType']) => DOC_TYPE_LABELS[t] ?? t,
    },
  ];

  const fullColumns: ColumnsType<VehicleDocument> = [
    ...baseColumns,
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
      width: 200,
      render: (_, r) => (
        <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(r.id)}>
          Скачать
        </Button>
      ),
    },
  ];

  const lockedColumns: ColumnsType<VehicleDocument> = [
    ...baseColumns,
    {
      title: 'Действия',
      key: 'actions',
      width: 280,
      render: () => (
        <Tooltip title="Имя файла и скачивание откроются после раскрытия сделки">
          <Button size="small" icon={<DownloadOutlined />} disabled>
            Скрыто до раскрытия
          </Button>
        </Tooltip>
      ),
    },
  ];

  const columns = canDownload ? fullColumns : lockedColumns;

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>Документы машины</Title>
      </Space>
      {isMobile ? (
        <MobileCardList<VehicleDocument>
          items={data ?? []}
          rowKey={(d) => d.id}
          loading={isLoading}
          emptyText="Документов пока нет"
          renderCard={(r) => (
            <Card styles={{ body: { padding: 14 } }} style={{ borderRadius: 12 }}>
              <div style={{ marginBottom: 4 }}>
                <Typography.Text strong style={{ fontSize: 14 }}>
                  {DOC_TYPE_LABELS[r.docType] ?? r.docType}
                </Typography.Text>
              </div>
              {canDownload ? (
                <>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4, wordBreak: 'break-all' }}>
                    {r.fileName}
                  </div>
                  <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
                    {dayjs(r.createdAt).format('DD.MM.YYYY HH:mm')}
                  </div>
                  <Button block icon={<DownloadOutlined />} onClick={() => handleDownload(r.id)}>
                    Скачать
                  </Button>
                </>
              ) : (
                <Tooltip title="Имя файла и скачивание откроются после раскрытия сделки">
                  <Button block icon={<DownloadOutlined />} disabled>
                    Скрыто до раскрытия
                  </Button>
                </Tooltip>
              )}
            </Card>
          )}
        />
      ) : (
        <Table<VehicleDocument>
          rowKey="id"
          columns={columns}
          dataSource={data ?? []}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 700 }}
          locale={{ emptyText: 'Документов пока нет' }}
        />
      )}
    </Card>
  );
}
