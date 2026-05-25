import { Card, Col, Row, Statistic, Typography } from 'antd';
import { CarOutlined, InboxOutlined, TruckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { loadsApi } from '../api/loads.api';
import { vehiclesApi } from '../api/vehicles.api';
import AdminDashboardPage from './admin/AdminDashboardPage';

const { Title } = Typography;

function useShipperLoadsCount(enabled: boolean) {
  return useQuery({
    queryKey: ['stats', 'loads', 'my', 'active'],
    queryFn: () =>
      loadsApi.getMy({ limit: 1, status: 'active' }).then((r) => r.data.total),
    enabled,
  });
}

function useDispatcherActiveLoadsCount(enabled: boolean) {
  return useQuery({
    queryKey: ['stats', 'loads', 'all', 'active'],
    queryFn: () =>
      loadsApi.getAll({ limit: 1, status: 'active' }).then((r) => r.data.total),
    enabled,
  });
}

function useCarrierVehiclesCount(enabled: boolean) {
  return useQuery({
    queryKey: ['stats', 'vehicles', 'my'],
    queryFn: () =>
      vehiclesApi.getMy({ limit: 1 }).then((r) => r.data.total),
    enabled,
  });
}

function useAllVehiclesCount(enabled: boolean) {
  return useQuery({
    queryKey: ['stats', 'vehicles', 'all'],
    queryFn: () =>
      vehiclesApi.getAll({ limit: 1 }).then((r) => r.data.total),
    enabled,
  });
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const role = user?.role;
  const isAdmin = !!user?.is_admin;

  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  const isShipper = role === 'shipper';
  const isCarrier = role === 'carrier';
  const isDispatcher = role === 'dispatcher';

  const shipperLoads = useShipperLoadsCount(isShipper);
  const dispatcherLoads = useDispatcherActiveLoadsCount(isDispatcher);
  const carrierVehicles = useCarrierVehiclesCount(isCarrier);
  const allVehicles = useAllVehiclesCount(isDispatcher);

  return (
    <div>
      <Title level={4}>
        Добро пожаловать, {user?.full_name || user?.phone}!
      </Title>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {isShipper && (
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable onClick={() => navigate('/loads')}>
              <Statistic
                title="Мои грузы"
                value={shipperLoads.data ?? 0}
                suffix="активных"
                loading={shipperLoads.isLoading}
                prefix={<InboxOutlined style={{ color: '#1677ff' }} />}
              />
            </Card>
          </Col>
        )}

        {isCarrier && (
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable onClick={() => navigate('/vehicles')}>
              <Statistic
                title="Мои машины"
                value={carrierVehicles.data ?? 0}
                loading={carrierVehicles.isLoading}
                prefix={<TruckOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
        )}

        {isDispatcher && (
          <>
            <Col xs={24} sm={12} lg={8}>
              <Card hoverable onClick={() => navigate('/loads')}>
                <Statistic
                  title="Активных грузов"
                  value={dispatcherLoads.data ?? 0}
                  loading={dispatcherLoads.isLoading}
                  prefix={<CarOutlined style={{ color: '#fa8c16' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card hoverable onClick={() => navigate('/vehicles')}>
                <Statistic
                  title="Машин в системе"
                  value={allVehicles.data ?? 0}
                  loading={allVehicles.isLoading}
                  prefix={<TruckOutlined style={{ color: '#fa8c16' }} />}
                />
              </Card>
            </Col>
          </>
        )}
      </Row>
    </div>
  );
}
