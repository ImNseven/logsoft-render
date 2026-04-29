import { Form, Modal, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '../../api/vehicles.api';
import VehicleFormFields from './VehicleFormFields';
import { useAuthStore } from '../../store/useAuthStore';
import type { CreateVehicleDto } from '../../types/vehicles.types';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateVehicleModal({ open, onClose }: Props) {
  const [form] = Form.useForm<CreateVehicleDto>();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const showCarrier = user?.role === 'dispatcher' || !!user?.is_admin;

  const mutation = useMutation({
    mutationFn: (dto: CreateVehicleDto) =>
      vehiclesApi.create(dto).then((r) => r.data),
    onSuccess: () => {
      message.success('Машина добавлена');
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      form.resetFields();
      onClose();
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ?? 'Не удалось добавить машину',
      );
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    mutation.mutate(values);
  };

  return (
    <Modal
      open={open}
      title="Добавить машину"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      confirmLoading={mutation.isPending}
      okText="Добавить"
      cancelText="Отмена"
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <VehicleFormFields showCarrier={showCarrier} />
      </Form>
    </Modal>
  );
}
