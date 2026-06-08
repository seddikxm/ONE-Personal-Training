import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, CalendarCheck, Dumbbell, Clock, Ban, Settings, LogOut, Menu,
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import './AdminLayout.css';

const navItems = [
  { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/appointments', label: 'Appointments', icon: CalendarCheck },
  { path: '/admin/services', label: 'Services', icon: Dumbbell },
  { path: '/admin/hours', label: 'Business Hours', icon: Clock },
  { path: '/admin/blocked-dates', label: 'Blocked Dates', icon: Ban },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, loading, user, signOut, checked } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleSignOut() {
    signOut();
    navigate('/admin/login');
  }

  if (loading && !checked) {
    return (
      <div className="al-loading-page">
        <div className="al-loading-spinner" />
        <p>Verifying access...</p>
      </div>
    );
  }

  if (!user && checked) {
    navigate('/admin/login');
    return null;
  }

  if (!isAdmin && checked) {
    return (
      <div className="al-loading-page">
        <div className="al-unauthorized-icon">
          <LogOut size={40} />
        </div>
        <h2>Not Authorized</h2>
        <p>You are signed in, but you are not authorized as an admin.</p>
        <button className="al-unauth-signout" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="ad-layout">
      <aside className={`ad-sidebar ${sidebarOpen ? 'ad-sidebar--open' : ''}`}>
        <div className="ad-sidebar-brand">
          <Link to="/admin/dashboard">
            <span className="ad-brand-name">ONE<span className="ad-brand-dim">:</span></span>
            <span className="ad-brand-sub">Admin</span>
          </Link>
        </div>
        <nav className="ad-sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`ad-nav-item ${isActive ? 'ad-nav-item--active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="ad-sidebar-footer">
          <button className="ad-nav-item ad-nav-item--signout" onClick={handleSignOut}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="ad-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="ad-main">
        <header className="ad-header">
          <button className="ad-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="ad-header-right">
            <span className="ad-header-email">{user?.email}</span>
          </div>
        </header>
        <main className="ad-content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
