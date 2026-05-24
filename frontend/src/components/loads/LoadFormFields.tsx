import { Form, Input, InputNumber, Select, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useOriginPoints, useTransportTypes, useShippers } from '../../hooks/useLoads';

const disablePastAndToday = (current: Dayjs) =>
  current && current.isBefore(dayjs().add(1, 'day').startOf('day'));

interface Props {
  showShipper?: boolean;
}

export default function LoadFormFields({ showShipper = false }: Props) {
  const { data: originPoints, isLoading: opLoading } = useOriginPoints();
  const { data: transportTypes, isLoading: ttLoading } = useTransportTypes();
  const { data: shippers, isLoading: shLoading } = useShippers(showShipper);

  return (
    <>
      {showShipper && (
        <Form.Item name="shipperId" label="Грузоотправитель (необязательно)">
          <Select
            placeholder="Оставьте пустым — будет указан текущий пользователь"
            loading={shLoading}
            allowClear
            showSearch
            optionFilterProp="label"
            options={(shippers?.data ?? []).map((u) => ({
              value: u.id,
              label: u.full_name || u.company_name || u.phone,
            }))}
          />
        </Form.Item>
      )}

      <Form.Item
        name="originPointId"
        label="Пункт отправки"
        rules={[{ required: true, message: 'Выберите пункт отправки' }]}
      >
        <Select
          placeholder="Выберите пункт"
          loading={opLoading}
          showSearch
          optionFilterProp="label"
          options={(originPoints ?? []).map((p) => ({ value: p.id, label: p.name }))}
        />
      </Form.Item>

      <Form.Item
        name="destination"
        label="Пункт назначения"
        rules={[{ required: true, message: 'Укажите пункт назначения' }, { max: 500 }]}
      >
        <Input placeholder="Введите город или адрес" />
      </Form.Item>

      <Form.Item name="transportTypeId" label="Тип транспорта (необязательно)">
        <Select
          placeholder="Выберите тип"
          loading={ttLoading}
          allowClear
          showSearch
          optionFilterProp="label"
          options={(transportTypes ?? []).map((t) => ({ value: t.id, label: t.name }))}
        />
      </Form.Item>

      <Form.Item
        name="weightKg"
        label="Вес, кг"
        rules={[{ required: true, message: 'Укажите вес' }]}
      >
        <InputNumber min={0} step={100} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="volumeM3"
        label="Объём, м³"
        rules={[{ required: true, message: 'Укажите объём' }]}
      >
        <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="readyDate"
        label="Дата готовности"
        rules={[{ required: true, message: 'Укажите дату готовности' }]}
      >
        <DatePicker
          style={{ width: '100%' }}
          format="DD.MM.YYYY"
          disabledDate={disablePastAndToday}
        />
      </Form.Item>

      <Form.Item name="notes" label="Примечания (необязательно)">
        <Input.TextArea rows={3} maxLength={1000} showCount />
      </Form.Item>
    </>
  );
}
