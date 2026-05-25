import { Form, Modal, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from '../../api/vehicles.api';
import VehicleFormFields from './VehicleFormFields';
import { useResponsiveModalWidth } from '../../hooks/useIsMobile';
import type { CreateVehicleDto, Vehicle } from '../../types/vehicles.types';

interface Props {
  open: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
}

type FormValues = Omit<CreateVehicleDto, 'carrierId'>;

function buildInitial(vehicle: Vehicle | null): FormValues | undefined {
  if (!vehicle) return undefined;
  return {
    plateNumber: vehicle.plateNumber,
    transportTypeId: vehicle.transportType?.id ?? vehicle.transportTypeId ?? undefined,
    capacityKg: vehicle.capacityKg != null ? Number(vehicle.capacityKg) : undefined,
    specs: vehicle.specs ?? undefined,
  };
}

export default function EditVehicleModal({ open, vehicle, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const qc = useQueryClient();
  const modalSize = useResponsiveModalWidth(520);

  const mutation = useMutation({
    mutationFn: (dto: Partial<CreateVehicleDto>) =>
      vehiclesApi.update(vehicle!.id, dto).then((r) => r.data),
    onSuccess: () => {
      message.success('Машина обновлена');
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['vehicle', vehicle?.id] });
      onClose();
    },
    onError: (err: any) => {
      message.error(
        err?.response?.data?.message ?? 'Не удалось обновить машину',
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
      title="Редактировать машину"
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
          const initial = buildInitial(vehicle);
          if (initial) form.setFieldsValue(initial);
        }
      }}
      {...modalSize}
    >
      <Form form={form} layout="vertical" preserve={false} requiredMark={false}>
        <VehicleFormFields />
      </Form>
    </Modal>
  );
}
