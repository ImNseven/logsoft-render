import { Modal, Form, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { loadsApi } from '../../api/loads.api';
import LoadFormFields from './LoadFormFields';
import type { CreateLoadDto, Load } from '../../types/loads.types';

interface Props {
  open: boolean;
  load: Load | null;
  onClose: () => void;
}

interface FormValues extends Omit<CreateLoadDto, 'readyDate' | 'shipperId'> {
  readyDate?: Dayjs;
}

function buildInitial(load: Load | null): FormValues | undefined {
  if (!load) return undefined;
  return {
    originPointId: load.originPoint?.id,
    destination: load.destination,
    transportTypeId: load.transportType?.id,
    weightKg: load.weightKg ? Number(load.weightKg) : undefined,
    volumeM3: load.volumeM3 ? Number(load.volumeM3) : undefined,
    readyDate: load.readyDate ? dayjs(load.readyDate) : undefined,
    notes: load.notes ?? undefined,
  };
}

export default function EditLoadModal({ open, load, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (dto: Partial<CreateLoadDto>) =>
      loadsApi.update(load!.id, dto).then((r) => r.data),
    onSuccess: () => {
      message.success('Груз обновлён');
      qc.invalidateQueries({ queryKey: ['loads'] });
      onClose();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось обновить груз');
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    const dto: Partial<CreateLoadDto> = {
      ...values,
      readyDate: values.readyDate ? values.readyDate.format('YYYY-MM-DD') : undefined,
    };
    mutation.mutate(dto);
  };

  return (
    <Modal
      open={open}
      title="Редактировать груз"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      confirmLoading={mutation.isPending}
      okText="Сохранить"
      cancelText="Отмена"
      destroyOnClose
      afterOpenChange={(visible) => {
        if (visible) {
          const initial = buildInitial(load);
          if (initial) form.setFieldsValue(initial);
        }
      }}
      width={560}
    >
      <Form form={form} layout="vertical" preserve={false} requiredMark={false}>
        <LoadFormFields />
      </Form>
    </Modal>
  );
}
