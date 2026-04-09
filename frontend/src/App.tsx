import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';

import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import VerifyEmail from './pages/auth/VerifyEmail';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import { ThemeProvider } from './components/theme-provider';

// Club pages
import ClubsPage from './pages/clubs/ClubsPage';
import ClubDetailPage from './pages/clubs/ClubDetailPage';
import RegisterClubPage from './pages/clubs/RegisterClubPage';
import ClubDashboard from './pages/clubs/ClubDashboard';
import MyClubDashboardPage from './pages/clubs/MyClubDashboardPage';

// Admin pages
import AdminClubsPage from './pages/admin/AdminClubsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import OrganizerVerificationPage from './pages/admin/OrganizerVerificationPage';
import AdminVenuesPage from './pages/admin/AdminVenuesPage';
import CreateVenuePage from './pages/admin/CreateVenuePage';
import EditVenuePage from './pages/admin/EditVenuePage';

// Event pages
import CreateEventPage from './pages/events/CreateEventPage';
import EventDetailPage from './pages/events/EventDetailPage';
import EventSeatSelectionPage from './pages/events/EventSeatSelectionPage';

// User pages
import UserRegistrationsPage from './pages/UserRegistrationsPage';
import UserProfilePage from './pages/profile/UserProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';

// Misc pages
import NotFoundPage from './pages/NotFoundPage';

// Event registration management
import { EventRegistrationsList } from './components/events/EventRegistrationsList';

// Route protection
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="universe-theme">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/:id/seats" element={<EventSeatSelectionPage />} />

          {/* Auth routes */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />

          {/* Club routes */}
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/register" element={<ProtectedRoute requireClubLeader><RegisterClubPage /></ProtectedRoute>} />
          <Route path="/clubs/:slug" element={<ClubDetailPage />} />

          {/* Club dashboard (protected - for club leaders) */}
          <Route path="/dashboard/club/:slug" element={<ClubDashboard />} />

          {/* My Club portal — for club leaders and members */}
          <Route
            path="/my-club"
            element={
              <ProtectedRoute>
                <MyClubDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Event management routes (protected - for club leaders) */}
          <Route path="/clubs/:slug/events/create" element={<ProtectedRoute requireClubLeader><CreateEventPage /></ProtectedRoute>} />
          <Route path="/clubs/:slug/events/:eventId/registrations" element={<ProtectedRoute requireClubLeader><EventRegistrationsList /></ProtectedRoute>} />

          {/* User routes (protected - any authenticated user) */}
          <Route path="/my-registrations" element={<ProtectedRoute><UserRegistrationsPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
          <Route path="/users/:emailId" element={<UserProfilePage />} />

          {/* Admin routes (protected - SUPERADMIN only) */}
          <Route path="/admin" element={<ProtectedRoute requireSuperAdmin><AdminDashboardPage /></ProtectedRoute>} />
          <Route path="/admin/clubs" element={<ProtectedRoute requireSuperAdmin><AdminClubsPage /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireSuperAdmin><AdminUsersPage /></ProtectedRoute>} />
          <Route path="/admin/organizer-verification" element={<ProtectedRoute requireSuperAdmin><OrganizerVerificationPage /></ProtectedRoute>} />
          <Route path="/admin/venues" element={<ProtectedRoute requireSuperAdmin><AdminVenuesPage /></ProtectedRoute>} />
          <Route path="/admin/venues/create" element={<ProtectedRoute requireSuperAdmin><CreateVenuePage /></ProtectedRoute>} />
          <Route path="/admin/venues/:id/edit" element={<ProtectedRoute requireSuperAdmin><EditVenuePage /></ProtectedRoute>} />

          {/* 404 catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
