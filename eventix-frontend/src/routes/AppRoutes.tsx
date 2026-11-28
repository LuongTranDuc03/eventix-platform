import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Layouts
import { ConsumerLayout } from '../layouts/ConsumerLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { StaffLayout } from '../layouts/StaffLayout';
import { AuthLayout } from '../layouts/AuthLayout';

// Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { UnauthorizedPage } from '../pages/common/UnauthorizedPage';
import { NotFoundPage } from '../pages/common/NotFoundPage';

// Consumer Pages
import { HomePage } from '../pages/consumer/HomePage';
import { EventDetailPage } from '../pages/consumer/EventDetailPage';
import { WaitingRoomPage } from '../pages/consumer/WaitingRoomPage';
import { BookingPage } from '../pages/consumer/BookingPage';
import { CheckoutPage } from '../pages/consumer/CheckoutPage';
import { MyTicketsPage } from '../pages/consumer/MyTicketsPage';

// Dashboard Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { OrganizerDashboardPage } from '../pages/organizer/OrganizerDashboardPage';
import { CreateEventPage } from '../pages/organizer/CreateEventPage';

// Staff Pages
import { StaffScannerPage } from '../pages/staff/StaffScannerPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public & Consumer Space (Khách hàng) */}
      <Route element={<ConsumerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* Consumer Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'ROLE_ATTENDEE', 'ROLE_ADMIN', 'ROLE_ORGANIZER', 'ROLE_STAFF']} />}>
          <Route path="/events/:id/waiting-room" element={<WaitingRoomPage />} />
          <Route path="/events/:id/booking" element={<BookingPage />} />
          <Route path="/checkout/:orderId" element={<CheckoutPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
        </Route>
      </Route>

      {/* 2. Admin Space (ROLE_ADMIN only) */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="events" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>
      </Route>

      {/* 3. Organizer Space (ROLE_ORGANIZER or ROLE_ADMIN) */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_ORGANIZER', 'ROLE_ADMIN']} />}>
        <Route path="/organizer" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/organizer/dashboard" replace />} />
          <Route path="dashboard" element={<OrganizerDashboardPage />} />
          <Route path="events" element={<OrganizerDashboardPage />} />
          <Route path="create-event" element={<CreateEventPage />} />
        </Route>
      </Route>

      {/* 4. Gate Staff Kiosk Space (ROLE_STAFF or ROLE_ADMIN) */}
      <Route element={<ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']} />}>
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="/staff/scanner" replace />} />
          <Route path="scanner" element={<StaffScannerPage />} />
        </Route>
      </Route>

      {/* 5. Auth Space */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 6. Common & Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
