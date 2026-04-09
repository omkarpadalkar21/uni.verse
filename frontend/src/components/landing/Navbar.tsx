import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, LayoutDashboard, LogOut, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/theme-provider';
import { getRefreshToken, getAccessToken, authApi } from '@/lib/api';
import { getAuthInfo } from '@/lib/auth';

function getInitials(email: string): string {
  return (email || '??').substring(0, 2).toUpperCase();
}

export const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auth state — initialized synchronously from localStorage and refreshed on route changes
  const [authState, setAuthState] = useState(getAuthInfo);

  const profileRef = useRef<HTMLDivElement>(null);

  // Re-read auth info on every route change (catches same-tab sign-in redirect)
  useEffect(() => {
    setAuthState(getAuthInfo());
  }, [location.pathname]);

  // Re-read when localStorage changes from another tab
  useEffect(() => {
    const handleStorage = () => setAuthState(getAuthInfo());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    const scrollTo = (id: string) => {
      const elem = document.getElementById(id);
      if (elem) {
        const offset = 80;
        const top =
          elem.getBoundingClientRect().top - document.body.getBoundingClientRect().top - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => scrollTo(targetId), 300);
    } else {
      setTimeout(() => {
        scrollTo(targetId);
        window.history.pushState(null, '', href);
      }, 300);
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileMenuOpen(false);
    try {
      const accessToken = getAccessToken() ?? '';
      const refreshToken = getRefreshToken() ?? '';
      await authApi.logout({ accessToken, refreshToken });
    } catch {
      // authApi.logout already calls clearTokens on success;
      // on error, manually clear so the UI still reflects signed-out state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    setAuthState({ loggedIn: false, email: '', isSuperAdmin: false, isClubLeader: false, isClubMember: false });
    navigate('/');
  };

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
  ];

  const { loggedIn, email, isSuperAdmin, isClubLeader, isClubMember } = authState;

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent',
        scrolled ? 'bg-background/80 backdrop-blur-md border-border shadow-lg' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="#hero"
            className="flex items-center gap-2 group"
            onClick={(e) => handleNavClick(e, '#hero')}
          >
            <img
              src="/logo.svg"
              alt="UniVerse Logo"
              className="w-8 h-8 group-hover:rotate-12 transition-transform duration-500"
            />
            <span className="text-xl font-bold font-sans tracking-tight">
              Uni<span className="text-primary">Verse</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.name}
              </a>
            ))}
            {/* Clubs direct link */}
            <Link
              to="/clubs"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Clubs
            </Link>
          </div>

          {/* Desktop right section */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <div className="w-px h-6 bg-border mx-2" />

            {loggedIn ? (
              /* ── Profile avatar + dropdown (signed in) ── */
              <div className="relative" ref={profileRef}>
                <button
                  id="profile-menu-btn"
                  onClick={() => setProfileOpen((o) => !o)}
                  className={cn(
                    'flex items-center justify-center w-9 h-9 rounded-full font-semibold text-sm',
                    'bg-primary/20 text-primary border border-primary/40',
                    'hover:bg-primary/30 hover:border-primary/60 transition-all duration-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background'
                  )}
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                >
                  {getInitials(email)}
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl border border-border/60 bg-background/95 backdrop-blur-lg shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-border/50">
                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          id="profile-menu-profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          My Profile
                        </Link>

                        {(isClubLeader || isClubMember) && (
                          <Link
                            to="/my-club"
                            id="profile-menu-my-club"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-muted/60 transition-colors"
                          >
                            <Users className="h-4 w-4" />
                            My Club Dashboard
                          </Link>
                        )}

                        {isSuperAdmin && (
                          <Link
                            to="/admin"
                            id="profile-menu-admin"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-muted/60 transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-border/50 py-1">
                        <button
                          id="profile-menu-logout"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Guest buttons (not signed in) ── */
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth/signin">Sign In</Link>
                </Button>
                <Button className="glow" asChild>
                  <Link to="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-foreground"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container px-4 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-lg font-medium hover:text-primary transition-colors"
                  onClick={(e) => handleNavClick(e, link.href)}
                >
                  {link.name}
                </a>
              ))}

              {/* Clubs page link in mobile nav */}
              <Link
                to="/clubs"
                className="text-lg font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Clubs
              </Link>

              <div className="flex flex-col gap-4 mt-4">
                  {loggedIn ? (
                    <>
                      <p className="text-xs text-muted-foreground truncate px-1">{email}</p>

                      <Button
                        variant="outline"
                        asChild
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Link to="/profile">
                          <User className="h-4 w-4 mr-2" />
                          My Profile
                        </Link>
                      </Button>

                      {(isClubLeader || isClubMember) && (
                        <Button
                          variant="outline"
                          asChild
                          className="w-full justify-start text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link to="/my-club">
                            <Users className="h-4 w-4 mr-2" />
                            My Club Dashboard
                          </Link>
                        </Button>
                      )}

                      {isSuperAdmin && (
                        <Button
                          variant="outline"
                          asChild
                          className="w-full justify-start text-red-400 border-red-500/30 hover:bg-red-500/10"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Link to="/admin">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Admin Dashboard
                          </Link>
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" asChild className="w-full justify-start">
                        <Link to="/auth/signin">Sign In</Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link to="/auth/signup">Get Started</Link>
                      </Button>
                    </>
                  )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
