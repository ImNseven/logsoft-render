import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import UsersListPage from '../pages/UsersListPage';
import LoadsListPage from '../pages/loads/LoadsListPage';
import VehiclesListPage from '../pages/vehicles/VehiclesListPage';
import VehicleDetailPage from '../pages/vehicles/VehicleDetailPage';
import DealsListPage from '../pages/deals/DealsListPage';
import DealDetailPage from '../pages/deals/DealDetailPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<ProtectedRoute allowedRoles={['dispatcher']} />}>
            <Route path="/users" element={<UsersListPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['shipper', 'dispatcher']} />}>
            <Route path="/loads" element={<LoadsListPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['carrier', 'dispatcher']} />}>
            <Route path="/vehicles" element={<VehiclesListPage />} />
            <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['shipper', 'carrier', 'dispatcher']} />}>
            <Route path="/deals" element={<DealsListPage />} />
            <Route path="/deals/:id" element={<DealDetailPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
