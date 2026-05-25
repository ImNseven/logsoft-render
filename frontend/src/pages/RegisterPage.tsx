import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Steps, Select, Alert, message } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/useAuthStore';
import type { UserRole } from '../types';

const { Title, Text } = Typography;

const ROLE_OPTIONS = [
  { value: 'shipper' as UserRole, label: 'Грузоотправитель' },
  { value: 'carrier' as UserRole, label: 'Перевозчик' },
  { value: 'dispatcher' as UserRole, label: 'Диспетчер' },
];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [phone, setPhone] = useState('');
  const [temporaryToken, setTemporaryToken] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendCode = useCallback(async (phoneValue: string) => {
    setLoading(true);
    try {
      const { data } = await authApi.sendCode(phoneValue);
      setPhone(phoneValue);
      setCountdown(60);
      setDevCode(data.code ?? null);
      setStep(1);
      message.success('Код отправлен');
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyCode = async (values: { code: string }) => {
    setLoading(true);
    try {
      const { data } = await authApi.verifyCode(phone, values.code);
      setTemporaryToken(data.temporary_token);
      setStep(2);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Неверный код');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (values: {
    password: string;
    role: UserRole;
    full_name?: string;
    company_name?: string;
  }) => {
    setLoading(true);
    try {
      await register(
        { phone, password: values.password, role: values.role, full_name: values.full_name, company_name: values.company_name },
        temporaryToken,
      );
      message.success('Регистрация завершена');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ошибка регистрации';
      message.error(typeof msg === 'string' ? msg : msg[0]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f0f2f5',
      padding: 16,
    }}>
      <Card style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0 }}>Регистрация</Title>
        </div>

        <Steps
          current={step}
          size="small"
          style={{ marginBottom: 32 }}
          items={[
            { title: 'Телефон' },
            { title: 'Код' },
            { title: 'Данные' },
          ]}
        />

        {step === 0 && (
          <Form layout="vertical" onFinish={(v) => sendCode(v.phone)} autoComplete="off">
            <Form.Item
              label="Номер телефона"
              name="phone"
              rules={[
                { required: true, message: 'Введите телефон' },
                { pattern: /^\+\d{10,15}$/, message: 'Формат: +71234567890' },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="+71234567890" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Получить код
              </Button>
            </Form.Item>
          </Form>
        )}

        {step === 1 && (
          <Form layout="vertical" onFinish={verifyCode} autoComplete="off">
            <Text style={{ display: 'block', marginBottom: 16 }}>
              Код отправлен на {phone}
            </Text>
            {devCode && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message={
                  <span>
                    Тестовый режим. Код для входа: <b style={{ fontSize: 18, letterSpacing: 2 }}>{devCode}</b>
                  </span>
                }
              />
            )}
            <Form.Item
              label="Код подтверждения"
              name="code"
              rules={[
                { required: true, message: 'Введите код' },
                { len: 4, message: 'Код должен быть 4 цифры' },
              ]}
            >
              <Input placeholder="0000" size="large" maxLength={4} style={{ textAlign: 'center', letterSpacing: 8 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Подтвердить
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center' }}>
              {countdown > 0 ? (
                <Text type="secondary">Отправить повторно через {countdown} сек</Text>
              ) : (
                <Button type="link" onClick={() => sendCode(phone)} loading={loading}>
                  Отправить код повторно
                </Button>
              )}
            </div>
          </Form>
        )}

        {step === 2 && (
          <Form layout="vertical" onFinish={onRegister} autoComplete="off">
            <Form.Item
              label="Пароль"
              name="password"
              rules={[
                { required: true, message: 'Введите пароль' },
                { min: 6, message: 'Минимум 6 символов' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Пароль" size="large" />
            </Form.Item>
            <Form.Item
              label="Подтверждение пароля"
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Подтвердите пароль' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve();
                    return Promise.reject(new Error('Пароли не совпадают'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Повторите пароль" size="large" />
            </Form.Item>
            <Form.Item
              label="Роль"
              name="role"
              rules={[{ required: true, message: 'Выберите роль' }]}
            >
              <Select placeholder="Выберите роль" size="large" options={ROLE_OPTIONS} />
            </Form.Item>
            <Form.Item label="ФИО" name="full_name">
              <Input placeholder="Иванов Иван Иванович" size="large" />
            </Form.Item>
            <Form.Item label="Компания" name="company_name">
              <Input placeholder="ООО Логистика" size="large" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                Зарегистрироваться
              </Button>
            </Form.Item>
          </Form>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Text>Уже есть аккаунт? </Text>
          <Link to="/login">Войти</Link>
        </div>
      </Card>
    </div>
  );
}
