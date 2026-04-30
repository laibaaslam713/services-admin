import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Settings, LogOut, Menu, X, Layers
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitles = {
    '/dashboard': { title: 'Dashboard', sub: 'Overview of your services' },
    '/services': { title: 'Services', sub: 'Manage all your services' },
  };
  const current = pageTitles[location.pathname] || { title: 'Admin', sub: '' };

  return (
    <div className="layout">
      
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Layers size={18} color="white" />
          </div>
          <h2>Service<span>Hub</span></h2>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Main</span>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </NavLink>

          <NavLink
            to="/services"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Settings size={18} />
            Services
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="nav-link" onClick={logout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      
      <div className="main-content">
        <header className="header">
          <div className="header-title">
            <h1>{current.title}</h1>
            <p>{current.sub}</p>
          </div>
          <div className="header-actions">
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
