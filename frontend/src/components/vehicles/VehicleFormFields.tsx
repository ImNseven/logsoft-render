import { Form, Input, InputNumber, Select } from 'antd';
import { useTransportTypes } from '../../hooks/useLoads';
import { useCarriers } from '../../hooks/useVehicles';

interface Props {
  showCarrier?: boolean;
}

export default function VehicleFormFields({ showCarrier = false }: Props) {
  const { data: carriers, isLoading: carriersLoading } = useCarriers(showCarrier);
  const { data: transportTypes, isLoading: ttLoading } = useTransportTypes();

  return (
    <>
      {showCarrier && (
        <Form.Item name="carrierId" label="Перевозчик">
          <Select
            placeholder="Оставьте пустым — текущий пользователь"
            loading={carriersLoading}
            allowClear
            showSearch
            optionFilterProp="label"
            options={(carriers?.data ?? []).map((u) => ({
              value: u.id,
              label: u.full_name || u.company_name || u.phone,
            }))}
          />
        </Form.Item>
      )}

      <Form.Item
        name="plateNumber"
        label="Гос. номер"
        rules={[
          { required: true, message: 'Укажите гос. номер' },
          { max: 20, message: 'Не более 20 символов' },
        ]}
      >
        <Input placeholder="AA1234BB" />
      </Form.Item>

      <Form.Item name="transportTypeId" label="Тип транспорта">
        <Select
          placeholder="Выберите тип"
          loading={ttLoading}
          allowClear
          showSearch
          optionFilterProp="label"
          options={(transportTypes ?? []).map((t) => ({
            value: t.id,
            label: t.name,
          }))}
        />
      </Form.Item>

      <Form.Item name="capacityKg" label="Грузоподъёмность (кг)">
        <InputNumber min={0} step={100} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="specs" label="Характеристики">
        <Input.TextArea rows={3} maxLength={1000} showCount />
      </Form.Item>
    </>
  );
}
