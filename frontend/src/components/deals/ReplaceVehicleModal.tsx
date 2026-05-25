import { Form, Modal, Select, message } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dealsApi } from '../../api/deals.api';
import { vehiclesApi } from '../../api/vehicles.api';
import { useResponsiveModalWidth } from '../../hooks/useIsMobile';

interface Props {
  open: boolean;
  onClose: () => void;
  dealId: string;
  currentVehicleId: string;
}

export default function ReplaceVehicleModal({ open, onClose, dealId, currentVehicleId }: Props) {
  const [form] = Form.useForm<{ newVehicleId: string }>();
  const qc = useQueryClient();
  const modalSize = useResponsiveModalWidth(520);

  const vehiclesQ = useQuery({
    queryKey: ['vehicles', 'active-for-replace'],
    queryFn: () => vehiclesApi.getAll({ isActive: true, limit: 100 }).then((r) => r.data),
    enabled: open,
    staleTime: 30 * 1000,
  });

  const mutation = useMutation({
    mutationFn: (newVehicleId: string) =>
      dealsApi.replaceVehicle(dealId, { newVehicleId }).then((r) => r.data),
    onSuccess: () => {
      message.success('Машина заменена');
      qc.invalidateQueries({ queryKey: ['deal', dealId] });
      qc.invalidateQueries({ queryKey: ['payment', dealId] });
      qc.invalidateQueries({ queryKey: ['deals'] });
      form.resetFields();
      onClose();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось заменить машину');
    },
  });

  const options = (vehiclesQ.data?.data ?? [])
    .filter((v) => v.id !== currentVehicleId)
    .map((v) => ({
      value: v.id,
      label: `${v.plateNumber} — ${v.transportType?.name ?? 'без типа'}`,
    }));

  const handleOk = async () => {
    const v = await form.validateFields();
    mutation.mutate(v.newVehicleId);
  };

  return (
    <Modal
      open={open}
      title="Заменить машину"
      onCancel={() => { form.resetFields(); onClose(); }}
      onOk={handleOk}
      confirmLoading={mutation.isPending}
      okText="Заменить"
      cancelText="Отмена"
      destroyOnClose
      {...modalSize}
    >
      <Form form={form} layout="vertical" preserve={false}>
        <Form.Item
          name="newVehicleId"
          label="Новая машина"
          rules={[{ required: true, message: 'Выберите машину' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={vehiclesQ.isLoading}
            options={options}
            placeholder="Активная машина"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
