import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Service } from '../../lib/types';
import './AdminServices.css';

const emptyForm = {
  name: '',
  description: '',
  duration_minutes: 60,
  price: 0,
  is_active: true,
};

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadServices = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('name');
    if (data) setServices(data as Service[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadServices(); }, [loadServices]);

  function openNew() {
    setForm(emptyForm);
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(service: Service) {
    setForm({
      name: service.name,
      description: service.description,
      duration_minutes: service.duration_minutes,
      price: service.price,
      is_active: service.is_active,
    });
    setEditing(service);
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    if (editing) {
      await supabase.from('services').update(form).eq('id', editing.id);
    } else {
      await supabase.from('services').insert(form);
    }

    setSaving(false);
    setShowModal(false);
    loadServices();
  }

  async function toggleActive(service: Service) {
    await supabase
      .from('services')
      .update({ is_active: !service.is_active })
      .eq('id', service.id);
    loadServices();
  }

  return (
    <div className="ad-services">
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Services</h1>
          <p className="ad-page-sub">Manage your fitness classes and training sessions.</p>
        </div>
        <button className="ad-btn ad-btn-primary" onClick={openNew}>
          <Plus size={18} />
          Add Service
        </button>
      </div>

      {loading ? (
        <div className="ad-loading"><div className="al-loading-spinner" /></div>
      ) : services.length === 0 ? (
        <div className="ad-empty-state">
          <Dumbbell size={40} />
          <p>No services yet. Add your first one.</p>
        </div>
      ) : (
        <div className="ad-svc-grid">
          {services.map((svc, i) => (
            <motion.div
              key={svc.id}
              className={`ad-svc-card ${!svc.is_active ? 'ad-svc-card--inactive' : ''}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.03 }}
            >
              <div className="ad-svc-top">
                <h3>{svc.name}</h3>
                <span className={`ad-badge ad-badge--${svc.is_active ? 'confirmed' : 'cancelled'}`}>
                  {svc.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="ad-svc-desc">{svc.description}</p>
              <div className="ad-svc-meta">
                <span>{svc.duration_minutes} min</span>
                <span className="ad-svc-price">£{Number(svc.price).toFixed(2)}</span>
              </div>
              <div className="ad-svc-actions">
                <button className="ad-svc-action" onClick={() => openEdit(svc)}>Edit</button>
                <button className="ad-svc-action" onClick={() => toggleActive(svc)}>
                  {svc.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="ad-modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              className="ad-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ad-modal-header">
                <h2>{editing ? 'Edit Service' : 'Add Service'}</h2>
                <button className="ad-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSave} className="ad-modal-form">
                <div className="ad-field">
                  <label>Service Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Personal Training"
                    required
                  />
                </div>
                <div className="ad-field">
                  <label>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the service..."
                    rows={3}
                  />
                </div>
                <div className="ad-field-row">
                  <div className="ad-field">
                    <label>Duration (minutes)</label>
                    <input
                      type="number"
                      value={form.duration_minutes}
                      onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                      min={15}
                      step={5}
                      required
                    />
                  </div>
                  <div className="ad-field">
                    <label>Price (£)</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                      min={0}
                      step={0.5}
                      required
                    />
                  </div>
                </div>
                <div className="ad-modal-actions">
                  <button type="button" className="ad-btn ad-btn-ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="ad-btn ad-btn-primary" disabled={saving || !form.name}>
                    {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
