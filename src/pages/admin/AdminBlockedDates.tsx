import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Ban, Plus, X, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlockedDate } from '../../lib/types';
import './AdminBlockedDates.css';

export default function AdminBlockedDates() {
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [adding, setAdding] = useState(false);

  const loadBlocked = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('blocked_dates')
      .select('*')
      .order('blocked_date', { ascending: true });
    if (data) setBlockedDates(data as BlockedDate[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadBlocked(); }, [loadBlocked]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newDate) return;
    setAdding(true);
    await supabase.from('blocked_dates').insert({
      blocked_date: newDate,
      reason: newReason,
    });
    setAdding(false);
    setNewDate('');
    setNewReason('');
    setShowForm(false);
    loadBlocked();
  }

  async function handleRemove(id: string) {
    await supabase.from('blocked_dates').delete().eq('id', id);
    loadBlocked();
  }

  function formatDate(d: string) {
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (loading) {
    return <div className="ad-loading"><div className="al-loading-spinner" /></div>;
  }

  return (
    <div className="ad-blocked">
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Blocked Dates</h1>
          <p className="ad-page-sub">Dates when the studio is closed or unavailable.</p>
        </div>
        <button className="ad-btn ad-btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Blocked Date
        </button>
      </div>

      {showForm && (
        <form className="ad-blocked-form" onSubmit={handleAdd}>
          <div className="ad-blocked-fields">
            <div className="ad-field">
              <label>Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
              />
            </div>
            <div className="ad-field">
              <label>Reason</label>
              <input
                type="text"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                placeholder="e.g. Bank Holiday"
              />
            </div>
          </div>
          <div className="ad-blocked-form-actions">
            <button type="submit" className="ad-btn ad-btn-primary" disabled={adding || !newDate}>
              {adding ? 'Adding...' : 'Add'}
            </button>
            <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {blockedDates.length === 0 ? (
        <div className="ad-empty-state">
          <Ban size={40} />
          <p>No blocked dates. The studio is open as scheduled.</p>
        </div>
      ) : (
        <div className="ad-blocked-list">
          {blockedDates.map((bd) => (
            <motion.div
              key={bd.id}
              className="ad-blocked-item"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="ad-blocked-left">
                <Calendar size={18} />
                <div>
                  <span className="ad-blocked-date">{formatDate(bd.blocked_date)}</span>
                  {bd.reason && <span className="ad-blocked-reason">{bd.reason}</span>}
                </div>
              </div>
              <button className="ad-blocked-remove" onClick={() => handleRemove(bd.id)}>
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
