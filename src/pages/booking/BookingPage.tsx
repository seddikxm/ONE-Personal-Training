import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Clock, User, CheckCircle, Dumbbell, ChevronLeft, ChevronRight,
  ChevronDown, ArrowRight, Sparkles, MapPin, Phone, Mail, Shield, Diamond,
  Activity, Apple, Heart, Home, Monitor, Sun, Target,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getTimeSlots, dateStr } from '../../lib/availability';
import type { Service, BusinessHours, BlockedDate, BusinessSettings, TimeSlot } from '../../lib/types';
import './BookingPage.css';

const STEPS = ['service', 'datetime', 'details', 'confirm'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HERO_IMAGE = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80';
const HERO_SECONDARY = 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=800&q=80';

function serviceIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('rehab') || n.includes('injury') || n.includes('recovery')) return Heart;
  if (n.includes('sculpt')) return Target;
  if (n.includes('virtual') || n.includes('online')) return Monitor;
  if (n.includes('boxing')) return Target;
  if (n.includes('pilates')) return Activity;
  if (n.includes('yoga')) return Sun;
  if (n.includes('massage')) return Sparkles;
  if (n.includes('home') || n.includes('hotel') || n.includes('office')) return Home;
  if (n.includes('nutrition') || n.includes('sleep')) return Apple;
  return Dumbbell;
}

const fadeSlideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0, 1] } },
};

const fadeSlideLeft = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0, 1] } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.25, 0.1, 0, 1] } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calMonth, setCalMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const continueRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const [servicesRes, hoursRes, blockedRes, settingsRes] = await Promise.all([
        supabase.from('services').select('*').eq('is_active', true).order('name'),
        supabase.from('business_hours').select('*').order('weekday'),
        supabase.from('blocked_dates').select('*'),
        supabase.from('business_settings').select('*').limit(1).maybeSingle(),
      ]);
      if (servicesRes.data) setServices(servicesRes.data as Service[]);
      if (hoursRes.data) setBusinessHours(hoursRes.data as BusinessHours[]);
      if (blockedRes.data) setBlockedDates(blockedRes.data as BlockedDate[]);
      if (settingsRes.data) setSettings(settingsRes.data as BusinessSettings);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate && businessHours.length > 0) {
      const slots = getTimeSlots({
        date: selectedDate,
        businessHours,
        blockedDates,
        appointments: [],
        service: { duration_minutes: selectedService.duration_minutes },
        slotInterval: settings?.slot_interval_minutes ?? 60,
        bookingNoticeHours: settings?.booking_notice_hours ?? 2,
      });
      setTimeSlots(slots);
      setSelectedSlot(null);
    }
  }, [selectedService, selectedDate, businessHours, blockedDates, settings]);

  function goTo(s: number) {
    setStep(s);
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  function handleSelectService(svc: Service) {
    setSelectedService(svc);
    setTimeout(() => continueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
  }

  async function handleSubmit() {
    if (!selectedService || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    const startH = String(selectedSlot.start.getHours()).padStart(2, '0');
    const startM = String(selectedSlot.start.getMinutes()).padStart(2, '0');
    const endH = String(selectedSlot.end.getHours()).padStart(2, '0');
    const endM = String(selectedSlot.end.getMinutes()).padStart(2, '0');
    const { error } = await supabase.from('appointments').insert({
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      service_id: selectedService.id,
      appointment_date: dateStr(selectedDate),
      start_time: `${startH}:${startM}`,
      end_time: `${endH}:${endM}`,
      status: 'pending',
      notes: form.notes,
    });
    setSubmitting(false);
    if (!error) { setSubmitted(true); setTimeout(() => setShowSuccessAnim(true), 100); }
  }

  function renderCalendar() {
    const year = calMonth.getFullYear();
    const month = calMonth.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startDay = first.getDay();
    const offset = startDay === 0 ? 6 : startDay - 1;
    const daysInMonth = last.getDate();
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const cells: (number | null)[] = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) for (let i = 0; i < remaining; i++) cells.push(null);

    function isDateBlocked(date: Date) { return blockedDates.some((b) => b.blocked_date === dateStr(date)); }
    function getWeekdayHours(date: Date) {
      const idx = date.getDay() === 0 ? 6 : date.getDay() - 1;
      return businessHours.find((h) => h.weekday === idx);
    }

    return (
      <div className="bp-calendar">
        <div className="bp-cal-header">
          <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} className="bp-cal-arrow"><ChevronLeft size={18} /></button>
          <span className="bp-cal-title">{monthNames[month]} <span className="bp-cal-year">{year}</span></span>
          <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} className="bp-cal-arrow"><ChevronRight size={18} /></button>
        </div>
        <div className="bp-cal-grid">
          {dayLabels.map((l) => <div key={l} className="bp-cal-day-label">{l}</div>)}
          {cells.map((d, i) => {
            if (d === null) return <div key={`e${i}`} />;
            const dateObj = new Date(year, month, d);
            const ds = dateStr(dateObj);
            const isPast = dateObj < today;
            const blocked = isDateBlocked(dateObj);
            const bh = getWeekdayHours(dateObj);
            const closed = !bh || !bh.is_open;
            const disabled = isPast || blocked || closed;
            const isSelected = selectedDate && dateStr(selectedDate) === ds;
            return (
              <button
                key={ds}
                className={`bp-cal-day ${isSelected ? 'bp-cal-day--sel' : ''} ${disabled ? 'bp-cal-day--disabled' : ''}`}
                disabled={disabled}
                onClick={() => { setSelectedDate(dateObj); setSelectedSlot(null); setTimeout(() => slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50); }}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bp-page">
        <div className="bp-loading-container">
          <div className="al-loading-spinner" />
          <p>Preparing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bp-page">
      {/* ───── HERO — Cinematic Threshold ───── */}
      <section className="bp-hero">
        <div className="bp-hero-bg">
          <img src={HERO_IMAGE} alt="Modern fitness studio training space" />
          <div className="bp-hero-overlay" />
          <div className="bp-hero-bg-layer" />
          <div className="bp-hero-bg-blend">
            <img src={HERO_SECONDARY} alt="" aria-hidden="true" />
          </div>
        </div>
        <div className="bp-hero-grain" />
        <div className="bp-hero-pattern" aria-hidden="true" />
        <div className="bp-hero-spotlight" aria-hidden="true" />
        <div className="bp-hero-corner bp-hero-corner--tl" />
        <div className="bp-hero-corner bp-hero-corner--br" />

        <div className="bp-hero-content">
          <motion.span
            className="bp-hero-eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
          >
            <Diamond size={10} /> ONE: Mayfair · Personal Training
          </motion.span>

          <div className="bp-hero-heading">
            <motion.span
              className="bp-hero-heading-line-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.25, 0.1, 0, 1] }}
            >
              Reserve
            </motion.span>
            <motion.span
              className="bp-hero-heading-line-2"
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0, 1] }}
            >
              Your Session
            </motion.span>
          </div>

          <motion.div
            className="bp-hero-rule"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.1, 0, 1] }}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4, ease: [0.25, 0.1, 0, 1] }}
          >
            Select your service, choose your time, and step into London's finest personal training studio.
          </motion.p>

          {settings && (
            <motion.div
              className="bp-hero-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55, ease: [0.25, 0.1, 0, 1] }}
            >
              <div className="bp-hero-card-inner">
                <MapPin size={12} />
                <a
                  href="https://maps.google.com/?q=ONE+PERSONAL+TRAINING+35+South+Audley+Street+Mayfair+London"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bp-hero-card-link"
                >{settings.business_address || '35 South Audley Street, Mayfair, London'}</a>
              </div>
              <div className="bp-hero-card-dot">·</div>
              <div className="bp-hero-card-inner">
                <Phone size={12} />
                <a href={`tel:${settings.business_phone?.replace(/\s/g, '') || '+447740461947'}`} className="bp-hero-card-link">{settings.business_phone || '+44 (0) 7740461947'}</a>
              </div>
              <div className="bp-hero-card-dot">·</div>
              <div className="bp-hero-card-inner">
                <Mail size={12} />
                <a href={`mailto:${settings.business_email || 'info@onepersonaltraining.co.uk'}`} className="bp-hero-card-link">{settings.business_email || 'info@onepersonaltraining.co.uk'}</a>
              </div>
            </motion.div>
          )}

          <motion.div
            className="bp-hero-scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <span className="bp-hero-scroll-label">Scroll</span>
            <div className="bp-hero-scroll-track">
              <motion.div
                className="bp-hero-scroll-dot"
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <motion.div
              className="bp-hero-scroll-chevron"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown size={14} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {submitted ? (
        /* ───── SUCCESS ───── */
        <section className="bp-success-section">
          <motion.div
            className="bp-success container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
          >
            {showSuccessAnim && (
              <motion.div
                className="bp-success-ring"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.25, 0.1, 0, 1] }}
              >
                <div className="bp-success-icon">
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0, 1] }}
                  >
                    <CheckCircle size={56} />
                  </motion.div>
                </div>
              </motion.div>
            )}
            <div className="bp-success-particles" aria-hidden="true">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="bp-success-particle"
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: Math.cos((i / 8) * Math.PI * 2) * 80,
                    y: Math.sin((i / 8) * Math.PI * 2) * 80,
                  }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
                />
              ))}
            </div>
            <h2 className="bp-success-title">Booking Confirmed</h2>
            <p className="bp-success-text">
              Thank you, <strong>{form.full_name}</strong>. Your <strong>{selectedService?.name}</strong> session is secured.
            </p>

            <div className="bp-success-card">
              <div className="bp-success-card-accent" />
              <div className="bp-success-card-content">
                <div className="bp-success-row">
                  <span className="bp-success-label">Date</span>
                  <span className="bp-success-value">{selectedDate ? dateStr(selectedDate) : ''}</span>
                </div>
                <div className="bp-success-row">
                  <span className="bp-success-label">Time</span>
                  <span className="bp-success-value">{selectedSlot?.label}</span>
                </div>
                <div className="bp-success-row">
                  <span className="bp-success-label">Duration</span>
                  <span className="bp-success-value">{selectedService?.duration_minutes} min</span>
                </div>
                {selectedService && Number(selectedService.price) > 0 && (
                  <div className="bp-success-row">
                    <span className="bp-success-label">Investment</span>
                    <span className="bp-success-value">£{Number(selectedService.price).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            <p className="bp-success-sub">A confirmation email is on its way to <strong>{form.email}</strong>. We look forward to welcoming you at ONE: Mayfair.</p>

            <button
              className="bp-btn bp-btn-primary"
              onClick={() => {
                setStep(0); setSelectedService(null); setSelectedDate(null);
                setSelectedSlot(null); setForm({ full_name: '', email: '', phone: '', notes: '' });
                setSubmitted(false); setShowSuccessAnim(false);
              }}
            >
              Book Another Session <ArrowRight size={18} />
            </button>
          </motion.div>
        </section>
      ) : (
        <>
          {/* ───── STEPS INDICATOR ───── */}
          <div className="bp-steps-wrap">
            <div className="bp-steps container">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  className={`bp-step ${i === step ? 'bp-step--active' : ''} ${i < step ? 'bp-step--done' : ''}`}
                  onClick={() => i < step && goTo(i)}
                >
                  <span className="bp-step-line" />
                  <span className="bp-step-num">{i < step ? <CheckCircle size={14} /> : i + 1}</span>
                  <span className="bp-step-label">{['Choose Service', 'Date & Time', 'Your Details', 'Confirm'][i]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ───── CONTENT ───── */}
          <div className="bp-content container" ref={contentRef}>
            <AnimatePresence mode="wait">
              {/* STEP 0: SERVICE */}
              {step === 0 && (
                <motion.div
                  key="step0"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="bp-step-header">
                    <div className="bp-step-badge"><Dumbbell size={18} /></div>
                    <div>
                      <h2 className="bp-section-title">Choose Your Session</h2>
                      <p className="bp-section-sub">Select the training experience that matches your goals.</p>
                    </div>
                  </div>

                  <motion.div className="bp-services-grid" variants={stagger} initial="hidden" animate="visible">
                    {services.map((svc) => {
                      const SvcIcon = serviceIcon(svc.name);
                      return (
                      <motion.button
                        key={svc.id}
                        variants={fadeSlideUp}
                        className={`bp-svc-card ${selectedService?.id === svc.id ? 'bp-svc-card--sel' : ''}`}
                        onClick={() => handleSelectService(svc)}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="bp-svc-card-accent" />
                        <div className="bp-svc-card-top">
                          <div className="bp-svc-card-icon">
                            <SvcIcon size={20} />
                          </div>
                          <span className="bp-svc-price">£{Number(svc.price).toFixed(2)}</span>
                        </div>
                        <h3>{svc.name}</h3>
                        <p>{svc.description}</p>
                        <div className="bp-svc-meta">
                          <Clock size={14} />
                          <span>{svc.duration_minutes} minutes</span>
                        </div>
                        {selectedService?.id === svc.id && (
                          <motion.div
                            className="bp-svc-selected-badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                          >
                            <CheckCircle size={16} />
                            Selected
                          </motion.div>
                        )}
                      </motion.button>
                    );
                    })}
                  </motion.div>
                  <div className="bp-nav-row" ref={continueRef}>
                    <div />
                    <button className="bp-btn bp-btn-primary" disabled={!selectedService} onClick={() => goTo(1)}>
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: DATE & TIME */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="bp-step-header">
                    <div className="bp-step-badge"><CalendarDays size={18} /></div>
                    <div>
                      <h2 className="bp-section-title">Select Date & Time</h2>
                      <p className="bp-section-sub">Pick a date and available slot for your session.</p>
                    </div>
                  </div>

                  <div className="bp-datetime-layout">
                    <motion.div
                      className="bp-cal-wrap"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                    >
                      {renderCalendar()}
                    </motion.div>
                    <motion.div
                      ref={slotsRef}
                      className="bp-slots-wrap"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      <div className="bp-slots-header">
                        <Clock size={16} />
                        <h4>Available Times</h4>
                        {selectedDate && (
                          <span className="bp-slots-date-label">{monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}</span>
                        )}
                      </div>
                      {!selectedDate ? (
                        <p className="bp-slots-hint">Select a date on the calendar to view available times.</p>
                      ) : timeSlots.length === 0 ? (
                        <p className="bp-slots-hint">No available slots for this date.</p>
                      ) : (
                        <motion.div className="bp-slots-grid" variants={stagger} initial="hidden" animate="visible">
                          {timeSlots.map((slot) => (
                            <motion.button
                              key={slot.label}
                              variants={fadeSlideUp}
                              className={`bp-slot ${selectedSlot?.label === slot.label ? 'bp-slot--sel' : ''}`}
                              onClick={() => { setSelectedSlot(slot); setTimeout(() => continueRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                            >
                              {slot.label.split(' - ')[0]}
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  </div>

                  <div className="bp-nav-row">
                    <button className="bp-btn bp-btn-ghost" onClick={() => goTo(0)}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button className="bp-btn bp-btn-primary" disabled={!selectedSlot} onClick={() => goTo(2)}>
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: DETAILS */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="bp-step-header">
                    <div className="bp-step-badge"><User size={18} /></div>
                    <div>
                      <h2 className="bp-section-title">Your Details</h2>
                      <p className="bp-section-sub">Enter your contact information to secure your booking.</p>
                    </div>
                  </div>

                  <div className="bp-form">
                    <div className="bp-field bp-field--fullname">
                      <label htmlFor="bp-name">Full Name</label>
                      <input
                        id="bp-name"
                        type="text"
                        placeholder="e.g. Jane Smith"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      />
                    </div>
                    <div className="bp-field bp-field--email">
                      <label htmlFor="bp-email">Email Address</label>
                      <input
                        id="bp-email"
                        type="email"
                        placeholder="jane@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="bp-field bp-field--phone">
                      <label htmlFor="bp-phone">Phone Number</label>
                      <input
                        id="bp-phone"
                        type="tel"
                        placeholder="+44 7700 000000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </div>
                    <div className="bp-field bp-field--notes">
                      <label htmlFor="bp-notes">Notes (optional)</label>
                      <textarea
                        id="bp-notes"
                        placeholder="Goals, injuries, or anything we should know..."
                        rows={3}
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      />
                    </div>
                  </div>

                  <motion.div
                    className="bp-form-summary-mini"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="bp-form-summary-label">Booking:</span>
                    <span className="bp-form-summary-value">{selectedService?.name}</span>
                    <span className="bp-form-summary-dot">·</span>
                    <span className="bp-form-summary-value">{selectedDate ? dateStr(selectedDate) : ''}</span>
                    <span className="bp-form-summary-dot">·</span>
                    <span className="bp-form-summary-value">{selectedSlot?.label.split(' - ')[0]}</span>
                  </motion.div>

                  <div className="bp-nav-row">
                    <button className="bp-btn bp-btn-ghost" onClick={() => goTo(1)}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button className="bp-btn bp-btn-primary" disabled={!form.full_name || !form.email || !form.phone} onClick={() => goTo(3)}>
                      Continue <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CONFIRM */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="bp-step-header">
                    <div className="bp-step-badge"><Shield size={18} /></div>
                    <div>
                      <h2 className="bp-section-title">Confirm Booking</h2>
                      <p className="bp-section-sub">Review your details before confirming.</p>
                    </div>
                  </div>

                  <div className="bp-confirm-cards">
                    <motion.div
                      className="bp-confirm-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                    >
                      <div className="bp-confirm-card-accent" />
                      <div className="bp-confirm-card-head">
                        <Dumbbell size={16} />
                        <span>Session Details</span>
                      </div>
                      <div className="bp-confirm-card-body">
                        <div className="bp-confirm-row">
                          <span className="bp-confirm-label">Service</span>
                          <span className="bp-confirm-value">{selectedService?.name}</span>
                        </div>
                        <div className="bp-confirm-row">
                          <span className="bp-confirm-label">Date</span>
                          <span className="bp-confirm-value">{selectedDate ? dateStr(selectedDate) : ''}</span>
                        </div>
                        <div className="bp-confirm-row">
                          <span className="bp-confirm-label">Time</span>
                          <span className="bp-confirm-value">{selectedSlot?.label}</span>
                        </div>
                        <div className="bp-confirm-row">
                          <span className="bp-confirm-label">Duration</span>
                          <span className="bp-confirm-value">{selectedService?.duration_minutes} minutes</span>
                        </div>
                        {selectedService && Number(selectedService.price) > 0 && (
                          <div className="bp-confirm-row bp-confirm-row--total">
                            <span className="bp-confirm-label">Investment</span>
                            <span className="bp-confirm-value">£{Number(selectedService.price).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    <motion.div
                      className="bp-confirm-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <div className="bp-confirm-card-accent" />
                      <div className="bp-confirm-card-head">
                        <User size={16} />
                        <span>Your Information</span>
                      </div>
                      <div className="bp-confirm-card-body">
                        <div className="bp-confirm-row">
                          <span className="bp-confirm-label">Name</span>
                          <span className="bp-confirm-value">{form.full_name}</span>
                        </div>
                        <div className="bp-confirm-row">
                          <span className="bp-confirm-label">Email</span>
                          <span className="bp-confirm-value">{form.email}</span>
                        </div>
                        <div className="bp-confirm-row">
                          <span className="bp-confirm-label">Phone</span>
                          <span className="bp-confirm-value">{form.phone}</span>
                        </div>
                        {form.notes && (
                          <div className="bp-confirm-row bp-confirm-row--notes">
                            <span className="bp-confirm-label">Notes</span>
                            <span className="bp-confirm-value">{form.notes}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  <div className="bp-confirm-policy">
                    <Shield size={14} />
                    Your information is kept private and will only be used to manage your booking.
                  </div>

                  <div className="bp-nav-row">
                    <button className="bp-btn bp-btn-ghost" onClick={() => goTo(2)}>
                      <ChevronLeft size={18} /> Back
                    </button>
                    <button
                      className="bp-btn bp-btn-primary bp-btn-confirm"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      <Sparkles size={18} />
                      {submitting ? 'Booking...' : 'Confirm & Book'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}
