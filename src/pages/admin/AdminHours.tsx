import { useState, useEffect, useCallback } from 'react';
import { Clock, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BusinessHours } from '../../lib/types';
import './AdminHours.css';

const WEEKDAY_LABELS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function AdminHours() {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadHours = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('business_hours')
      .select('*')
      .order('weekday');
    if (data) setHours(data as BusinessHours[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadHours(); }, [loadHours]);

  function updateHour(id: string, field: string, value: boolean | string) {
    setHours((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h))
    );
  }

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    for (const h of hours) {
      await supabase
        .from('business_hours')
        .update({
          is_open: h.is_open,
          start_time: h.start_time,
          end_time: h.end_time,
        })
        .eq('id', h.id);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return <div className="ad-loading"><div className="al-loading-spinner" /></div>;
  }

  return (
    <div className="ad-hours">
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Business Hours</h1>
          <p className="ad-page-sub">Set your studio's weekly opening hours.</p>
        </div>
        <button className="ad-btn ad-btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div className="ad-saved-toast">Hours updated successfully.</div>
      )}

      <div className="ad-hours-list">
        {hours.map((h) => (
          <div key={h.id} className={`ad-hours-row ${!h.is_open ? 'ad-hours-row--closed' : ''}`}>
            <div className="ad-hours-day">
              <Clock size={18} />
              <span>{WEEKDAY_LABELS[h.weekday]}</span>
            </div>
            <div className="ad-hours-toggle">
              <label className="ad-toggle">
                <input
                  type="checkbox"
                  checked={h.is_open}
                  onChange={(e) => updateHour(h.id, 'is_open', e.target.checked)}
                />
                <span className="ad-toggle-track">
                  <span className="ad-toggle-knob" />
                </span>
              </label>
              <span className="ad-hours-status">{h.is_open ? 'Open' : 'Closed'}</span>
            </div>
            {h.is_open && (
              <div className="ad-hours-times">
                <div className="ad-hours-time-field">
                  <label>Open</label>
                  <input
                    type="time"
                    value={h.start_time}
                    onChange={(e) => updateHour(h.id, 'start_time', e.target.value)}
                  />
                </div>
                <span className="ad-hours-sep">to</span>
                <div className="ad-hours-time-field">
                  <label>Close</label>
                  <input
                    type="time"
                    value={h.end_time}
                    onChange={(e) => updateHour(h.id, 'end_time', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
