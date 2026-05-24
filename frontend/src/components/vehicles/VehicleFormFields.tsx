import { Form, Input, InputNumber, Select } from 'antd';
import { useTransportTypes } from '../../hooks/useLoads';

export default function VehicleFormFields() {
  const { data: transportTypes, isLoading: ttLoading } = useTransportTypes();

  return (
    <>
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

      <Form.Item
        name="transportTypeId"
        label="Тип транспорта"
        rules={[{ required: true, message: 'Выберите тип транспорта' }]}
      >
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

      <Form.Item
        name="capacityKg"
        label="Грузоподъёмность, кг"
        rules={[{ required: true, message: 'Укажите грузоподъёмность' }]}
      >
        <InputNumber min={0} step={100} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item name="specs" label="Характеристики (необязательно)">
        <Input.TextArea rows={3} maxLength={1000} showCount />
      </Form.Item>
    </>
  );
}
