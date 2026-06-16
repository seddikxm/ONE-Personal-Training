import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck, Search, X, MoreHorizontal, Clock, CheckCircle,
  XCircle, CheckCheck, RefreshCw, ChevronLeft, ChevronRight,
  Users, AlertCircle, TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Appointment, Service } from '../../lib/types';
import './AdminAppointments.css';

const STATUSES = ['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const;

const statusConfig = {
  pending: { icon: Clock, label: 'Pending', color: 'warning' },
  confirmed: { icon: CheckCircle, label: 'Confirmed', color: 'primary' },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'error' },
  completed: { icon: CheckCheck, label: 'Completed', color: 'success' },
} as const;

const PAGE_SIZES = [10, 25, 50];

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0, 1] } },
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    const [apptsRes, servicesRes] = await Promise.all([
      supabase.from('appointments').select('*').order('appointment_date', { ascending: false }),
      supabase.from('services').select('id, name'),
    ]);
    if (apptsRes.data) setAppointments(apptsRes.data as Appointment[]);
    if (servicesRes.data) {
      const map: Record<string, string> = {};
      (servicesRes.data as Pick<Service, 'id' | 'name'>[]).forEach((s) => { map[s.id] = s.name; });
      setServices(map);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (error) {
      showToast(error.message, 'error');
      return;
    }
    showToast(`Appointment marked as ${status}`, 'success');
    setOpenMenuId(null);
    loadData();
  }

  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.full_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.phone.includes(q)
    );
  });

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    today: appointments.filter((a) => a.appointment_date === new Date().toISOString().split('T')[0]).length,
  };

  const statCards = [
    { label: 'Total Bookings', value: stats.total, icon: CalendarCheck, color: 'primary' as const, change: '' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'warning' as const, change: 'Requires attention' },
    { label: 'Confirmed', value: stats.confirmed, icon: TrendingUp, color: 'primary' as const, change: 'Upcoming sessions' },
    { label: 'Today', value: stats.today, icon: Users, color: 'accent' as const, change: 'Scheduled for today' },
  ];

  return (
    <div className="aa-page">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`aa-toast aa-toast--${toast.type}`}
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
          >
            {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="aa-header">
        <div className="aa-header-left">
          <h1 className="aa-title">Appointments</h1>
          <p className="aa-subtitle">Manage all client bookings across your studio.</p>
        </div>
        <button
          className={`aa-refresh-btn ${refreshing ? 'aa-refresh-btn--spinning' : ''}`}
          onClick={loadData}
          disabled={refreshing}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="aa-stats">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className={`aa-stat-card aa-stat-card--${card.color}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.25, 0.1, 0, 1] }}
            >
              <div className="aa-stat-icon"><Icon size={18} /></div>
              <div className="aa-stat-body">
                <span className="aa-stat-value">{card.value}</span>
                <span className="aa-stat-label">{card.label}</span>
                {card.change && <span className="aa-stat-change">{card.change}</span>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="aa-toolbar">
        <div className="aa-search">
          <Search size={16} />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          {search && (
            <button className="aa-search-clear" onClick={() => { setSearch(''); searchRef.current?.focus(); }}>
              <X size={14} />
            </button>
          )}
        </div>
        <div className="aa-filter-group">
          {STATUSES.map((s) => (
            <button
              key={s}
              className={`aa-filter-pill ${s === statusFilter ? 'aa-filter-pill--active' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(0); }}
            >
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="aa-loading">
          <div className="al-loading-spinner" />
          <p>Loading appointments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          className="aa-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="aa-empty-icon"><CalendarCheck size={48} /></div>
          <h3>No appointments found</h3>
          <p>
            {search || statusFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'When clients book sessions, they will appear here.'}
          </p>
          {(search || statusFilter !== 'all') && (
            <button className="aa-empty-btn" onClick={() => { setSearch(''); setStatusFilter('all'); }}>
              Clear filters
            </button>
          )}
        </motion.div>
      ) : (
        <>
          {/* Table (desktop) */}
          <div className="aa-table-wrap">
            <motion.table
              className="aa-table"
              variants={stagger}
              initial="hidden"
              animate="visible"
            >
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th><span className="aa-sr-label">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((appt) => {
                  const StatusIcon = statusConfig[appt.status].icon;
                  const statusCfg = statusConfig[appt.status];
                  return (
                    <motion.tr
                      key={appt.id}
                      variants={rowVariants}
                      className="aa-row"
                    >
                      <td className="aa-cell-client">
                        <div className="aa-client-avatar">{appt.full_name.charAt(0).toUpperCase()}</div>
                        <div className="aa-client-info">
                          <span className="aa-client-name">{appt.full_name}</span>
                          <span className="aa-client-contact">{appt.email}</span>
                        </div>
                      </td>
                      <td className="aa-cell-service">
                        <span className="aa-service-name">{services[appt.service_id] || 'Unknown Service'}</span>
                      </td>
                      <td className="aa-cell-date">
                        <span className="aa-date">{appt.appointment_date}</span>
                      </td>
                      <td className="aa-cell-time">
                        <span className="aa-time">{formatTime(appt.start_time)}</span>
                        <span className="aa-time-end">– {formatTime(appt.end_time)}</span>
                      </td>
                      <td className="aa-cell-status">
                        <span className={`aa-status-badge aa-status-badge--${appt.status}`}>
                          <StatusIcon size={12} />
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="aa-cell-actions">
                        <div className="aa-action-menu" ref={openMenuId === appt.id ? menuRef : undefined}>
                          <button
                            className="aa-action-trigger"
                            onClick={() => setOpenMenuId(openMenuId === appt.id ? null : appt.id)}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          <AnimatePresence>
                            {openMenuId === appt.id && (
                              <motion.div
                                className="aa-action-dropdown"
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.15 }}
                              >
                                {(['pending', 'confirmed', 'cancelled', 'completed'] as const).map((s) => {
                                  if (s === appt.status) return null;
                                  const Icon = statusConfig[s].icon;
                                  return (
                                    <button
                                      key={s}
                                      className={`aa-action-item aa-action-item--${s}`}
                                      onClick={() => updateStatus(appt.id, s)}
                                    >
                                      <Icon size={14} />
                                      Mark {statusConfig[s].label}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </motion.table>
          </div>

          {/* Cards (mobile) */}
          <div className="aa-cards">
            {paged.map((appt) => {
              const StatusIcon = statusConfig[appt.status].icon;
              const statusCfg = statusConfig[appt.status];
              return (
                <motion.div
                  key={appt.id}
                  className="aa-card"
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="aa-card-top">
                    <div className="aa-client-avatar">{appt.full_name.charAt(0).toUpperCase()}</div>
                    <div className="aa-card-client">
                      <span className="aa-client-name">{appt.full_name}</span>
                      <span className="aa-card-service">{services[appt.service_id] || 'Unknown Service'}</span>
                    </div>
                    <span className={`aa-status-badge aa-status-badge--${appt.status}`}>
                      <StatusIcon size={10} />
                      {statusCfg.label}
                    </span>
                  </div>
                  <div className="aa-card-body">
                    <div className="aa-card-row">
                      <span>Date</span>
                      <span>{appt.appointment_date}</span>
                    </div>
                    <div className="aa-card-row">
                      <span>Time</span>
                      <span>{formatTime(appt.start_time)} – {formatTime(appt.end_time)}</span>
                    </div>
                    <div className="aa-card-row">
                      <span>Email</span>
                      <span>{appt.email}</span>
                    </div>
                    {appt.phone && (
                      <div className="aa-card-row">
                        <span>Phone</span>
                        <span>{appt.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="aa-card-actions">
                    {(['pending', 'confirmed', 'cancelled', 'completed'] as const).map((s) => {
                      if (s === appt.status) return null;
                      const Icon = statusConfig[s].icon;
                      return (
                        <button
                          key={s}
                          className={`aa-card-action aa-card-action--${s}`}
                          onClick={() => updateStatus(appt.id, s)}
                        >
                          <Icon size={12} />
                          {statusConfig[s].label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="aa-pagination">
            <div className="aa-page-info">
              Showing <strong>{safePage * pageSize + 1}</strong>–
              <strong>{Math.min((safePage + 1) * pageSize, filtered.length)}</strong> of{' '}
              <strong>{filtered.length}</strong> appointments
            </div>
            <div className="aa-page-controls">
              <select
                className="aa-page-size"
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              >
                {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} per page</option>)}
              </select>
              <div className="aa-page-nav">
                <button
                  className="aa-page-btn"
                  disabled={safePage === 0}
                  onClick={() => setPage(safePage - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(pageCount, 5) }, (_, i) => {
                  const start = Math.max(0, Math.min(safePage - 2, pageCount - 5));
                  const p = start + i;
                  if (p >= pageCount) return null;
                  return (
                    <button
                      key={p}
                      className={`aa-page-btn aa-page-num ${p === safePage ? 'aa-page-num--active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p + 1}
                    </button>
                  );
                })}
                <button
                  className="aa-page-btn"
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(safePage + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
