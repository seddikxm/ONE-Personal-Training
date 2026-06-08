import { useState, useEffect, useCallback } from 'react';
import { Settings, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BusinessSettings } from '../../lib/types';
import './AdminSettings.css';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
    if (data) setSettings(data as BusinessSettings);
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  function update(field: keyof BusinessSettings, value: string | number) {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSaved(false);

    await supabase.from('business_settings').update({
      business_name: settings.business_name,
      business_email: settings.business_email,
      business_phone: settings.business_phone,
      business_address: settings.business_address,
      slot_interval_minutes: settings.slot_interval_minutes,
      booking_notice_hours: settings.booking_notice_hours,
    }).eq('id', settings.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return <div className="ad-loading"><div className="al-loading-spinner" /></div>;
  }

  if (!settings) {
    return (
      <div className="ad-empty-state">
        <Settings size={40} />
        <p>No settings found. Please seed the database.</p>
      </div>
    );
  }

  return (
    <div className="ad-settings">
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Studio Settings</h1>
          <p className="ad-page-sub">Manage your studio's business information.</p>
        </div>
      </div>

      {saved && (
        <div className="ad-saved-toast">Settings saved successfully.</div>
      )}

      <form className="ad-settings-form" onSubmit={handleSave}>
        <div className="ad-settings-section">
          <h3>Business Information</h3>
          <div className="ad-settings-grid">
            <div className="ad-field">
              <label>Studio Name</label>
              <input
                type="text"
                value={settings.business_name}
                onChange={(e) => update('business_name', e.target.value)}
              />
            </div>
            <div className="ad-field">
              <label>Studio Email</label>
              <input
                type="email"
                value={settings.business_email}
                onChange={(e) => update('business_email', e.target.value)}
              />
            </div>
            <div className="ad-field">
              <label>Studio Phone</label>
              <input
                type="text"
                value={settings.business_phone}
                onChange={(e) => update('business_phone', e.target.value)}
              />
            </div>
            <div className="ad-field">
              <label>Studio Address</label>
              <input
                type="text"
                value={settings.business_address}
                onChange={(e) => update('business_address', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="ad-settings-section">
          <h3>Booking Configuration</h3>
          <div className="ad-settings-grid">
            <div className="ad-field">
              <label>Slot Interval (minutes)</label>
              <input
                type="number"
                value={settings.slot_interval_minutes}
                onChange={(e) => update('slot_interval_minutes', Number(e.target.value))}
                min={15}
                step={5}
              />
              <span className="ad-field-hint">Time between available booking slots.</span>
            </div>
            <div className="ad-field">
              <label>Booking Notice (hours)</label>
              <input
                type="number"
                value={settings.booking_notice_hours}
                onChange={(e) => update('booking_notice_hours', Number(e.target.value))}
                min={0}
              />
              <span className="ad-field-hint">Minimum notice required before a booking.</span>
            </div>
          </div>
        </div>

        <div className="ad-settings-submit">
          <button type="submit" className="ad-btn ad-btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
