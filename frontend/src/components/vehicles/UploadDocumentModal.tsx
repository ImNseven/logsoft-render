import { Button, Form, Modal, Select, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '../../api/vehicles.api';
import { DOC_TYPE_OPTIONS } from './docTypes';
import type { DocType } from '../../types/vehicles.types';

interface Props {
  open: boolean;
  vehicleId: string;
  onClose: () => void;
}

interface FormValues {
  docType: DocType;
  file: { fileList: UploadFile[] };
}

export default function UploadDocumentModal({ open, vehicleId, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (vars: { file: File; docType: DocType }) =>
      vehiclesApi
        .uploadDocument(vehicleId, vars.file, vars.docType)
        .then((r) => r.data),
    onSuccess: () => {
      message.success('Документ загружен');
      qc.invalidateQueries({ queryKey: ['vehicle-documents', vehicleId] });
      qc.invalidateQueries({ queryKey: ['vehicle', vehicleId] });
      form.resetFields();
      onClose();
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ?? 'Не удалось загрузить документ',
      );
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    const file = values.file?.fileList?.[0]?.originFileObj as File | undefined;
    if (!file) {
      message.error('Выберите файл');
      return;
    }
    mutation.mutate({ file, docType: values.docType });
  };

  return (
    <Modal
      open={open}
      title="Загрузить документ"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      confirmLoading={mutation.isPending}
      okText="Загрузить"
      cancelText="Отмена"
      destroyOnClose
      width={480}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          label="Тип документа"
          name="docType"
          rules={[{ required: true, message: 'Выберите тип документа' }]}
        >
          <Select placeholder="Выберите тип" options={DOC_TYPE_OPTIONS} />
        </Form.Item>

        <Form.Item
          label="Файл"
          name="file"
          rules={[{ required: true, message: 'Выберите файл' }]}
          valuePropName="value"
          getValueFromEvent={(e) => e}
        >
          <Upload
            accept=".pdf,.jpg,.jpeg,.png,.heic"
            maxCount={1}
            beforeUpload={() => false}
            listType="text"
          >
            <Button icon={<UploadOutlined />}>Выбрать файл (PDF/JPG/PNG/HEIC, до 20 MB)</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
}
