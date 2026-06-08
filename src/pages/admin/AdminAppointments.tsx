import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Search, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Appointment } from '../../lib/types';
import './AdminAppointments.css';

const STATUSES = ['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const;

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    if (data) setAppointments(data as Appointment[]);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function updateStatus(id: string, status: string) {
    await supabase.from('appointments').update({ status }).eq('id', id);
    loadAppointments();
  }

  const filtered = appointments.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.full_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q)
    );
  });

  return (
    <div className="ad-appointments">
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Appointments</h1>
          <p className="ad-page-sub">Manage all client bookings.</p>
        </div>
      </div>

      <div className="ad-appt-toolbar">
        <div className="ad-search-wrap">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="ad-filter-wrap">
          <button className="ad-filter-btn" onClick={() => setShowFilter(!showFilter)}>
            {statusFilter === 'all' ? 'All Status' : statusFilter}
            <ChevronDown size={14} />
          </button>
          {showFilter && (
            <div className="ad-filter-dropdown">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  className={`ad-filter-option ${s === statusFilter ? 'ad-filter-option--sel' : ''}`}
                  onClick={() => { setStatusFilter(s); setShowFilter(false); }}
                >
                  {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="ad-loading"><div className="al-loading-spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="ad-empty-state">
          <CalendarCheck size={40} />
          <p>No appointments found.</p>
        </div>
      ) : (
        <div className="ad-appt-table-wrap">
          <table className="ad-appt-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Date</th>
                <th>Time</th>
                <th>Contact</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => (
                <motion.tr
                  key={appt.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="ad-cell-name">{appt.full_name}</td>
                  <td className="ad-cell-service">{appt.service_id.slice(0, 8)}...</td>
                  <td>{appt.appointment_date}</td>
                  <td>{appt.start_time} – {appt.end_time}</td>
                  <td>
                    <div className="ad-cell-contact">
                      <span>{appt.email}</span>
                      {appt.phone && <span className="ad-cell-phone">{appt.phone}</span>}
                    </div>
                  </td>
                  <td className="ad-cell-notes">{appt.notes || '—'}</td>
                  <td>
                    <span className={`ad-badge ad-badge--${appt.status}`}>{appt.status}</span>
                  </td>
                  <td>
                    <div className="ad-cell-actions">
                      {(['pending', 'confirmed', 'cancelled', 'completed'] as const).map((s) => (
                        s !== appt.status && (
                          <button
                            key={s}
                            className={`ad-action-btn ad-action-btn--${s}`}
                            onClick={() => updateStatus(appt.id, s)}
                            title={`Mark as ${s}`}
                          >
                            {s}
                          </button>
                        )
                      ))}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
