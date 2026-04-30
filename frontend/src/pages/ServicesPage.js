import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, Layers, RefreshCw } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import ServiceModal from '../components/ServiceModal';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const CATEGORIES = ['', 'Web Development', 'Mobile App', 'UI/UX Design', 'SEO', 'Marketing', 'Consulting', 'Other'];

export default function ServicesPage() {
  const { services, pagination, loading, fetchServices, createService, updateService, deleteService } = useServices();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const load = useCallback(() => {
    fetchServices({ page, limit: 8, search, category, status });
  }, [fetchServices, page, search, category, status]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSave = async (formData) => {
    if (editService) {
      const updated = await updateService(editService._id, formData);
      
      load();
      return updated;
    } else {
      await createService(formData);
      load();
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteService(deleteId);
      setDeleteId(null);
      
      if (services.length === 1 && page > 1) setPage(p => p - 1);
      else load();
    } catch (err) {
      toast.error('Failed to delete service');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openCreate = () => { setEditService(null); setShowModal(true); };
  const openEdit = (service) => { setEditService(service); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditService(null); };

  const totalPages = pagination.pages || 1;

  return (
    <div>
      <div className="table-card">
        <div className="table-header">
          <div className="table-header-left">
            <span className="table-title">All Services</span>
            <div className="search-box">
              <Search size={15} />
              <input
                className="search-input"
                placeholder="Search services..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="filter-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select className="filter-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="table-header-right">
            <button className="btn btn-ghost btn-icon" onClick={load} title="Refresh">
              <RefreshCw size={16} />
            </button>
            <button className="btn btn-primary" onClick={openCreate}>
              <Plus size={16} />
              Add Service
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="loading-row">
                  <td colSpan={5}>
                    <div className="loading-dots"><span /><span /><span /></div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <div className="empty-icon"><Layers size={28} /></div>
                      <h3>No services found</h3>
                      <p>{search || category || status ? 'Try adjusting your filters' : 'Create your first service to get started'}</p>
                    </div>
                  </td>
                </tr>
              ) : services.map((s, i) => (
                <tr key={s._id} style={{ animationDelay: `${i * 0.04}s` }}>
                  <td>
                    <div className="service-cell">
                      {s.image_url ? (
                        <>
                          <img
                            src={s.image_url.startsWith('/uploads') ? `http://localhost:5000${s.image_url}` : s.image_url}
                            alt={s.title}
                            className="service-image"
                            onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                          />
                          <div className="service-image-placeholder" style={{ display: 'none' }}><Layers size={16} /></div>
                        </>
                      ) : (
                        <div className="service-image-placeholder"><Layers size={16} /></div>
                      )}
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
                  <td>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn-edit" onClick={() => openEdit(s)} title="Edit">
                        <Pencil size={15} />
                      </button>
                      <button className="btn-del" onClick={() => setDeleteId(s._id)} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <span className="pagination-info">
              Showing {((page - 1) * 8) + 1}–{Math.min(page * 8, pagination.total)} of {pagination.total} services
            </span>
            <div className="pagination-buttons">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return p <= totalPages ? (
                  <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ) : null;
              })}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>Next →</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <ServiceModal
          service={editService}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {deleteId && (
        <ConfirmModal
          title="Delete Service?"
          message="This will permanently remove the service. This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
