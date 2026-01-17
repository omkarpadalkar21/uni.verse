import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import EventsPage from './pages/EventsPage';

import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import VerifyEmail from './pages/auth/VerifyEmail';
import { ThemeProvider } from './components/theme-provider';

// Club pages
import ClubsPage from './pages/clubs/ClubsPage';
import ClubDetailPage from './pages/clubs/ClubDetailPage';
import RegisterClubPage from './pages/clubs/RegisterClubPage';
import ClubDashboard from './pages/clubs/ClubDashboard';

// Admin pages
import AdminClubsPage from './pages/admin/AdminClubsPage';

// Event pages
import CreateEventPage from './pages/events/CreateEventPage';
import EventDetailPage from './pages/events/EventDetailPage';

// User pages
import UserRegistrationsPage from './pages/UserRegistrationsPage';

// Event registration management
import { EventRegistrationsList } from './components/events/EventRegistrationsList';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="universe-theme">
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          {/* Auth routes */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/verify-email" element={<VerifyEmail />} />

          {/* Club routes */}
          <Route path="/clubs" element={<ClubsPage />} />
          <Route path="/clubs/register" element={<RegisterClubPage />} />
          <Route path="/clubs/:slug" element={<ClubDetailPage />} />

          {/* Club dashboard (protected - for club leaders) */}
          <Route path="/dashboard/club/:slug" element={<ClubDashboard />} />

          {/* Event management routes (protected - for club leaders) */}
          <Route path="/clubs/:slug/events/create" element={<CreateEventPage />} />
          <Route path="/clubs/:slug/events/:eventId/registrations" element={<EventRegistrationsList />} />

          {/* User routes (protected) */}
          <Route path="/my-registrations" element={<UserRegistrationsPage />} />

          {/* Admin routes (protected - for faculty/superadmin) */}
          <Route path="/admin/clubs" element={<AdminClubsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

