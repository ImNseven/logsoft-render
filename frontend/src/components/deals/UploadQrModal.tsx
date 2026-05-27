import { useState } from 'react';
import { Form, InputNumber, Modal, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UploadFile } from 'antd/es/upload/interface';
import { paymentsApi } from '../../api/payments.api';
import { useResponsiveModalWidth } from '../../hooks/useIsMobile';

interface Props {
  open: boolean;
  onClose: () => void;
  paymentId: string | undefined;
  dealId: string;
}

const ACCEPT = '.png,.jpg,.jpeg,.pdf';
const MAX_BYTES = 5 * 1024 * 1024;

export default function UploadQrModal({ open, onClose, paymentId, dealId }: Props) {
  const [form] = Form.useForm<{ amount?: number }>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const qc = useQueryClient();
  const modalSize = useResponsiveModalWidth(520);

  const mutation = useMutation({
    mutationFn: ({ file, amount }: { file: File; amount?: number }) =>
      paymentsApi.sendQr(paymentId!, file, amount).then((r) => r.data),
    onSuccess: () => {
      message.success('QR-код загружен');
      qc.invalidateQueries({ queryKey: ['payment', dealId] });
      qc.invalidateQueries({ queryKey: ['deal', dealId] });
      qc.invalidateQueries({ queryKey: ['deals'] });
      form.resetFields();
      setFileList([]);
      onClose();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось загрузить QR-код');
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    const file = fileList[0]?.originFileObj as File | undefined;
    if (!file) {
      message.error('Выберите файл');
      return;
    }
    if (file.size > MAX_BYTES) {
      message.error('Файл больше 5 МБ');
      return;
    }
    if (!paymentId) return;
    mutation.mutate({ file, amount: values.amount });
  };

  return (
    <Modal
      open={open}
      title="Загрузить QR-код"
      onCancel={() => { form.resetFields(); setFileList([]); onClose(); }}
      onOk={handleOk}
      confirmLoading={mutation.isPending}
      okText="Загрузить"
      cancelText="Отмена"
      destroyOnClose
      {...modalSize}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item name="amount" label="Сумма">
          <InputNumber<number>
            style={{ width: '100%' }}
            min={0}
            formatter={(v) =>
              v === undefined || v === null
                ? ''
                : new Intl.NumberFormat('ru-RU').format(Number(v))
            }
            parser={(s) => Number((s ?? '').replace(/\s/g, '')) as any}
          />
        </Form.Item>
        <Form.Item label="Файл" required>
          <Upload
            accept={ACCEPT}
            multiple={false}
            maxCount={1}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: fl }) => setFileList(fl.slice(-1))}
            onRemove={() => setFileList([])}
            style={{ width: '100%' }}
          >
            <button
              type="button"
              style={{
                width: '100%',
                background: 'transparent',
                border: '1px dashed #d9d9d9',
                padding: '8px 12px',
                cursor: 'pointer',
                borderRadius: 6,
              }}
            >
              <UploadOutlined /> Выбрать файл
            </button>
          </Upload>
          <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>
            PNG, JPG, PDF · до 5 МБ
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}
