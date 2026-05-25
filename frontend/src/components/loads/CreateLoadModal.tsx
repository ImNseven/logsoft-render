import { Modal, Form, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Dayjs } from 'dayjs';
import { loadsApi } from '../../api/loads.api';
import LoadFormFields from './LoadFormFields';
import { useAuthStore } from '../../store/useAuthStore';
import { useResponsiveModalWidth } from '../../hooks/useIsMobile';
import type { CreateLoadDto } from '../../types/loads.types';

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormValues extends Omit<CreateLoadDto, 'readyDate'> {
  readyDate?: Dayjs;
}

export default function CreateLoadModal({ open, onClose }: Props) {
  const [form] = Form.useForm<FormValues>();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const showShipper = user?.role === 'dispatcher' || !!user?.is_admin;
  const modalSize = useResponsiveModalWidth(560);

  const mutation = useMutation({
    mutationFn: (dto: CreateLoadDto) => loadsApi.create(dto).then((r) => r.data),
    onSuccess: () => {
      message.success('Груз создан');
      qc.invalidateQueries({ queryKey: ['loads'] });
      form.resetFields();
      onClose();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message ?? 'Не удалось создать груз');
    },
  });

  const handleOk = async () => {
    const values = await form.validateFields();
    const dto: CreateLoadDto = {
      ...values,
      readyDate: values.readyDate ? values.readyDate.format('YYYY-MM-DD') : undefined,
    };
    mutation.mutate(dto);
  };

  return (
    <Modal
      open={open}
      title="Создать груз"
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      onOk={handleOk}
      confirmLoading={mutation.isPending}
      okText="Создать"
      cancelText="Отмена"
      destroyOnClose
      {...modalSize}
    >
      <Form form={form} layout="vertical" preserve={false} requiredMark={false}>
        <LoadFormFields showShipper={showShipper} />
      </Form>
    </Modal>
  );
}

