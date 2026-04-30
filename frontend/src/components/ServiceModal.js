import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image } from 'lucide-react';

const CATEGORIES = ['Web Development', 'Mobile App', 'UI/UX Design', 'SEO', 'Marketing', 'Consulting', 'Other'];

export default function ServiceModal({ service, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', image_url: '', category: 'Other', status: 'active'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  useEffect(() => {
    if (service) {
      setForm({
        title: service.title || '',
        description: service.description || '',
        image_url: service.image_url || '',
        category: service.category || 'Other',
        status: service.status || 'active'
      });
      if (service.image_url) setImagePreview(service.image_url);
    }
  }, [service]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrors(p => ({...p, image: 'Max 5MB allowed'})); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(p => ({ ...p, image_url: '' }));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setForm(p => ({ ...p, image_url: '' }));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('status', form.status);
      if (imageFile) {
        fd.append('image', imageFile);
      } else {
        fd.append('image_url', form.image_url);
      }
      await onSave(fd);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong';
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{service ? 'Edit Service' : 'Add New Service'}</h2>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.submit && (
              <div style={{ background: 'rgba(224,84,84,0.1)', border: '1px solid rgba(224,84,84,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#e05454', fontSize: 13 }}>
                {errors.submit}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Service Title *</label>
              <input
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Web Design Package"
                value={form.title}
                onChange={e => setForm(p => ({...p, title: e.target.value}))}
                style={errors.title ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.title && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.title}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe this service..."
                value={form.description}
                onChange={e => setForm(p => ({...p, description: e.target.value}))}
                style={errors.description ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.description && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.description}</p>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Image</label>
              {!imagePreview ? (
                <div>
                  <label className="image-upload-area">
                    <input type="file" accept="image/*" ref={fileRef} onChange={handleImageChange} />
                    <div className="upload-icon"><Upload size={24} /></div>
                    <p className="upload-text">Click to upload image</p>
                    <p className="upload-hint">JPG, PNG, GIF, WebP • Max 5MB</p>
                  </label>
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(86,182,198,0.1)' }} />
                    <span style={{ fontSize: 12, color: 'rgba(232,228,217,0.3)' }}>or paste URL</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(86,182,198,0.1)' }} />
                  </div>
                  <input
                    className="form-input"
                    style={{ marginTop: 10 }}
                    placeholder="https://example.com/image.jpg"
                    value={form.image_url}
                    onChange={e => {
                      setForm(p => ({...p, image_url: e.target.value}));
                      if (e.target.value) setImagePreview(e.target.value);
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div className="image-preview">
                    <img src={imagePreview} alt="preview" onError={() => setImagePreview('')} />
                    <button type="button" className="image-preview-remove" onClick={removeImage}>×</button>
                  </div>
                  <span style={{ fontSize: 13, color: 'rgba(232,228,217,0.4)' }}>
                    {imageFile ? imageFile.name : 'Image URL set'}
                  </span>
                </div>
              )}
              {errors.image && <p style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.image}</p>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  Saving...
                </span>
              ) : service ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
