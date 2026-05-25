import { Modal, Form, Input, message } from 'antd';
import { adminApi } from '../../api/admin.api';
import { useResponsiveModalWidth } from '../../hooks/useIsMobile';

export type DictionaryType = 'origin-points' | 'transport-types';

interface DictionaryItem {
  id: number;
  name: string;
}

interface FormValues {
  name: string;
}

interface Props {
  open: boolean;
  type: DictionaryType;
  item: DictionaryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_LABELS: Record<DictionaryType, { create: string; edit: string }> = {
  'origin-points': { create: 'Новый пункт отправки', edit: 'Редактировать пункт отправки' },
  'transport-types': { create: 'Новый тип транспорта', edit: 'Редактировать тип транспорта' },
};

export default function DictionaryItemModal({ open, type, item, onClose, onSuccess }: Props) {
  const [form] = Form.useForm<FormValues>();
  const isEdit = !!item;
  const modalSize = useResponsiveModalWidth(480);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isEdit && item) {
        if (type === 'origin-points') {
          await adminApi.updateOriginPoint(item.id, { name: values.name });
        } else {
          await adminApi.updateTransportType(item.id, { name: values.name });
        }
        message.success('Запись обновлена');
      } else {
        if (type === 'origin-points') {
          await adminApi.createOriginPoint({ name: values.name });
        } else {
          await adminApi.createTransportType({ name: values.name });
        }
        message.success('Запись создана');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err?.errorFields) return;
      const raw = err?.response?.data?.message;
      const text = Array.isArray(raw) ? raw.join('; ') : raw;
      message.error(text || 'Не удалось сохранить');
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? TYPE_LABELS[type].edit : TYPE_LABELS[type].create}
      okText="Сохранить"
      cancelText="Отмена"
      onCancel={onClose}
      onOk={handleOk}
      destroyOnClose
      afterOpenChange={(opened) => {
        if (opened) form.setFieldsValue({ name: item?.name ?? '' });
      }}
      {...modalSize}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="name"
          label="Название"
          rules={[
            { required: true, message: 'Введите название' },
            { max: 255, message: 'Не более 255 символов' },
          ]}
        >
          <Input autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
}
