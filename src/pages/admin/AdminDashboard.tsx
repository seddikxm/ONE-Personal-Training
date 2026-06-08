import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CalendarCheck, Dumbbell, TrendingUp, Clock, ArrowRight, Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Appointment, Service } from '../../lib/types';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    activeServices: 0,
  });
  const [upcomingAppts, setUpcomingAppts] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().split('T')[0];

      const [apptsRes, servicesRes] = await Promise.all([
        supabase.from('appointments').select('*').order('appointment_date', { ascending: true }),
        supabase.from('services').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      const appointments = (apptsRes.data || []) as Appointment[];
      const activeCount = servicesRes.count ?? 0;

      const pending = appointments.filter((a) => a.status === 'pending').length;
      const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
      const completed = appointments.filter((a) => a.status === 'completed').length;

      const upcoming = appointments
        .filter((a) => a.appointment_date >= today && a.status !== 'cancelled')
        .slice(0, 5);

      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: pending,
        confirmedAppointments: confirmed,
        completedAppointments: completed,
        activeServices: activeCount,
      });
      setUpcomingAppts(upcoming);
      setLoading(false);
    }
    load();
  }, []);

  const metricCards = [
    { label: 'Total Appointments', value: stats.totalAppointments, icon: CalendarCheck, color: 'primary' },
    { label: 'Pending', value: stats.pendingAppointments, icon: Clock, color: 'warning' },
    { label: 'Confirmed', value: stats.confirmedAppointments, icon: TrendingUp, color: 'primary' },
    { label: 'Completed', value: stats.completedAppointments, icon: Users, color: 'success' },
    { label: 'Active Services', value: stats.activeServices, icon: Dumbbell, color: 'primary' },
  ];

  if (loading) {
    return (
      <div className="ad-loading">
        <div className="al-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="ad-dashboard">
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Dashboard</h1>
          <p className="ad-page-sub">Your studio at a glance.</p>
        </div>
      </div>

      <div className="ad-metrics">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              className={`ad-metric-card ad-metric-card--${card.color}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <div className="ad-metric-icon">
                <Icon size={22} />
              </div>
              <div className="ad-metric-value">{card.value}</div>
              <div className="ad-metric-label">{card.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="ad-dashboard-grid">
        <div className="ad-dashboard-card">
          <div className="ad-card-header">
            <h3>Upcoming Appointments</h3>
            <Link to="/admin/appointments" className="ad-card-link">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {upcomingAppts.length === 0 ? (
            <div className="ad-empty-state">
              <CalendarCheck size={32} />
              <p>No upcoming appointments.</p>
            </div>
          ) : (
            <div className="ad-upcoming-list">
              {upcomingAppts.map((appt) => (
                <div key={appt.id} className="ad-upcoming-item">
                  <div className="ad-upcoming-left">
                    <span className="ad-upcoming-name">{appt.full_name}</span>
                    <span className="ad-upcoming-service">{appt.service_id.slice(0, 8)}...</span>
                  </div>
                  <div className="ad-upcoming-right">
                    <span className="ad-upcoming-date">{appt.appointment_date}</span>
                    <span className="ad-upcoming-time">{appt.start_time}</span>
                    <span className={`ad-badge ad-badge--${appt.status}`}>{appt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="ad-dashboard-card">
          <div className="ad-card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="ad-quick-actions">
            <Link to="/admin/appointments" className="ad-quick-action">
              <CalendarCheck size={18} />
              <span>Manage Appointments</span>
            </Link>
            <Link to="/admin/services" className="ad-quick-action">
              <Dumbbell size={18} />
              <span>Manage Services</span>
            </Link>
            <Link to="/admin/hours" className="ad-quick-action">
              <Clock size={18} />
              <span>Update Hours</span>
            </Link>
            <Link to="/admin/settings" className="ad-quick-action">
              <TrendingUp size={18} />
              <span>Studio Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
