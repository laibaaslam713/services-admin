import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useServices } from '../hooks/useServices';
import { Activity, CheckCircle, XCircle, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const { services, fetchServices, loading } = useServices();
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, categories: 0 });

  useEffect(() => {
    fetchServices({ limit: 100 });
  }, [fetchServices]);

  useEffect(() => {
    const active = services.filter(s => s.status === 'active').length;
    const categories = new Set(services.map(s => s.category)).size;
    setStats({ total: services.length, active, inactive: services.length - active, categories });
  }, [services]);

  const recentServices = services.slice(0, 5);

  return (
    <div>
      <div className="dashboard-welcome">
        <div className="welcome-text">
          <h2>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p>Here's what's happening with your services today.</p>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Services', value: stats.total, icon: <Layers size={22} />, cls: 'teal' },
          { label: 'Active Services', value: stats.active, icon: <CheckCircle size={22} />, cls: 'green' },
          { label: 'Inactive Services', value: stats.inactive, icon: <XCircle size={22} />, cls: 'orange' },
          { label: 'Categories', value: stats.categories, icon: <Activity size={22} />, cls: 'navy' },
        ].map((s, i) => (
          <div className="stat-card" key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div>
              <div className="stat-value">{loading ? '—' : s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="table-card">
        <div className="table-header">
          <span className="table-title">Recent Services</span>
          <Link to="/services" className="btn btn-primary" style={{ fontSize: 13, padding: '9px 16px' }}>
            View All
          </Link>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4}><div className="loading-dots"><span/><span/><span/></div></td></tr>
              ) : recentServices.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-icon"><Layers size={28} /></div>
                      <h3>No services yet</h3>
                      <p>Add your first service to get started</p>
                    </div>
                  </td>
                </tr>
              ) : recentServices.map((s, i) => (
                <tr key={s._id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <td>
                    <div className="service-cell">
                      {s.image_url ? (
                        <img src={s.image_url} alt={s.title} className="service-image"
                          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      ) : null}
                      <div className={`service-image-placeholder ${s.image_url ? 'hidden' : ''}`} style={{ display: s.image_url ? 'none' : 'flex' }}>
                        <Layers size={16} />
                      </div>
                      <div>
                        <div className="service-title">{s.title}</div>
                        <div className="service-desc">{s.description}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-category">{s.category}</span></td>
                  <td><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                  <td style={{ color: 'rgba(232,228,217,0.4)', fontSize: 13 }}>
                    {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
