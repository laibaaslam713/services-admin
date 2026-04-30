import { Trash2 } from 'lucide-react';

export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal modal-confirm">
        <div className="modal-body" style={{ textAlign: 'center', paddingTop: 32 }}>
          <div className="confirm-icon">
            <Trash2 size={24} />
          </div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>{title || 'Are you sure?'}</h2>
          <p style={{ color: 'rgba(232,228,217,0.5)', fontSize: 14, lineHeight: 1.6 }}>
            {message || 'This action cannot be undone.'}
          </p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center', paddingTop: 0 }}>
          <button className="btn btn-ghost" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}
            style={{ background: 'var(--danger)', color: 'white', borderColor: 'var(--danger)' }}>
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
