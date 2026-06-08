import { motion } from 'framer-motion';
import business from '../../config/business';
import Button from '../ui/Button';
import { fadeUp, staggerContainer, cardItem } from '../../utils/animations';
import './ContactPage.css';

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 1.5C6.42 1.5 3.5 4.42 3.5 8C3.5 13.25 10 18.5 10 18.5C10 18.5 16.5 13.25 16.5 8C16.5 4.42 13.58 1.5 10 1.5Z" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="8" r="2.5" fill="currentColor"/>
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M17.5 14.18V17.04C17.5 17.57 17.07 18.01 16.53 18.04C15.97 18.07 15.42 18.06 14.89 18.01C11.64 17.69 8.57 16.43 6.07 14.43C3.59 12.44 1.72 9.82 0.72 6.82C0.47 6.06 0.32 5.26 0.28 4.44C0.26 3.88 0.67 3.4 1.22 3.36L4.08 3.14C4.58 3.1 5.01 3.43 5.16 3.9L5.94 6.43C6.07 6.86 5.95 7.33 5.63 7.65L4.38 8.9C5.85 11.37 7.87 13.35 10.37 14.76L11.62 13.51C11.94 13.19 12.41 13.06 12.84 13.2L15.37 13.98C15.84 14.13 16.17 14.57 16.13 15.07L17.5 14.18Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <rect x="1.5" y="3.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1.5 5.5L10 11L18.5 5.5" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <path d="M10 0C4.48 0 0 4.48 0 10C0 12.21 0.82 14.24 2.18 15.8L1.56 18.22L4.06 17.62C5.56 18.56 7.32 19.08 9.18 19.08C9.72 19.08 10.24 19.04 10.76 18.96C15.74 18.16 19.58 13.68 18.96 8.54C18.4 4.06 14.48 0 10 0Z" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M7.5 5.5C7.5 5.5 7.24 5.44 7.08 5.82C6.42 7.21 7.06 8.87 8.3 10.1C9.54 11.33 11.24 12.28 12.64 11.74C13.02 11.58 12.96 11.32 12.96 11.32L11.64 10.82C11.64 10.82 11.4 10.76 11.2 11.02C11 11.28 10.34 12.04 10.18 12.06C9.72 11.94 8.4 11.12 7.68 10.2C7.02 9.36 6.92 8.94 6.92 8.94C6.92 8.94 7.18 8.66 7.34 8.4C7.5 8.14 7.42 7.94 7.42 7.94L6.94 6.66C6.8 6.26 6.64 6.3 6.52 6.26C6.4 6.22 6.16 6.18 6 6.18C5.82 6.18 5.58 6.26 5.46 6.56C5.2 7.02 5.36 8.04 5.8 8.88C6.38 10.02 7.68 11.52 9.24 12.26C10.28 12.74 10.92 12.96 11.84 13.12C12.42 13.22 12.98 13.1 13.4 12.88C13.76 12.68 13.94 12.38 13.98 12.08C14.02 11.84 13.98 11.62 13.94 11.52C13.9 11.42 13.74 11.34 13.5 11.26L12.34 10.74" stroke="currentColor" strokeWidth="1.2"/>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M10 5.5V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function mergeHours(hours) {
  if (!hours.length) return [];
  const merged = [];
  let start = hours[0].day;
  let prev = hours[0];
  for (let i = 1; i <= hours.length; i++) {
    const cur = hours[i];
    if (cur && cur.hours === prev.hours) {
      prev = cur;
      continue;
    }
    if (start === prev.day) {
      merged.push({ day: prev.day, hours: prev.hours });
    } else {
      merged.push({ day: `${start} – ${prev.day}`, hours: prev.hours });
    }
    if (cur) {
      start = cur.day;
      prev = cur;
    }
  }
  return merged;
}

export default function ContactPage() {
  const hours = mergeHours(business.openingHours);

  return (
    <main>
      <motion.section className="contact-hero" variants={staggerContainer} initial="hidden" animate="visible">
        <div className="contact-hero__bg" />
        <div className="container">
          <motion.div className="contact-hero__content" variants={fadeUp}>
            <span className="eyebrow">Get in Touch</span>
            <h1>{business.contact.heading}</h1>
            <p>{business.contact.description.split('\n')[0]}</p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="contact-main"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="container">
          <motion.div className="contact-main__grid" variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            <motion.div className="contact-main__info" variants={staggerContainer}>
              <motion.a href={`tel:${business.phoneRaw}`} className="contact-card contact-card--link" variants={cardItem}>
                <div className="contact-card__icon">
                  <PhoneIcon />
                </div>
                <div className="contact-card__body">
                  <h3>Phone</h3>
                  <span className="contact-card__value">{business.phone}</span>
                </div>
              </motion.a>

              <motion.a href={`mailto:${business.email}`} className="contact-card contact-card--link" variants={cardItem}>
                <div className="contact-card__icon contact-card__icon--email">
                  <EmailIcon />
                </div>
                <div className="contact-card__body">
                  <h3>Email</h3>
                  <span className="contact-card__value">{business.email}</span>
                </div>
              </motion.a>

              <motion.a
                href={`https://wa.me/${business.whatsappRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="contact-card contact-card--link"
                variants={cardItem}
              >
                <div className="contact-card__icon contact-card__icon--whatsapp">
                  <WhatsAppIcon />
                </div>
                <div className="contact-card__body">
                  <h3>WhatsApp</h3>
                  <span className="contact-card__value">{business.whatsapp}</span>
                </div>
              </motion.a>

              <motion.a href={business.googleMaps} target="_blank" rel="noopener noreferrer" className="contact-card contact-card--link" variants={cardItem}>
                <div className="contact-card__icon contact-card__icon--pin">
                  <PinIcon />
                </div>
                <div className="contact-card__body">
                  <h3>Visit Us</h3>
                  <span className="contact-card__value">{business.shortAddress}</span>
                </div>
              </motion.a>

              <motion.div className="contact-card contact-card--hours" variants={cardItem}>
                <div className="contact-card__icon contact-card__icon--hours">
                  <ClockIcon />
                </div>
                <div className="contact-card__body">
                  <h3>Opening Hours</h3>
                  <div className="contact-card__hours">
                    {hours.map(({ day, hours: h }) => (
                      <div key={day} className="contact-card__hours-row">
                        <span>{day}</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div className="contact-main__form-wrapper" variants={fadeUp}>
              <div className="contact-form-card">
                <h2>Send us a message</h2>
                <p className="contact-form-card__sub">We'll respond within 24 hours</p>
                <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                  <div className="contact-form__row">
                    <div className="contact-form__field">
                      <label htmlFor="name">Name</label>
                      <input type="text" id="name" name="name" required placeholder="Your full name" />
                    </div>
                    <div className="contact-form__field">
                      <label htmlFor="email">Email</label>
                      <input type="email" id="email" name="email" required placeholder="your@email.com" />
                    </div>
                  </div>
                  <div className="contact-form__row">
                    <div className="contact-form__field">
                      <label htmlFor="phone">Phone</label>
                      <input type="tel" id="phone" name="phone" placeholder="+44 (0) 7..." />
                    </div>
                    <div className="contact-form__field">
                      <label htmlFor="service">Service Interested In</label>
                      <select id="service" name="service">
                        <option value="">Select a service</option>
                        {business.services.map((s) => (
                          <option key={s.title} value={s.title}>{s.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="contact-form__field contact-form__field--full">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" name="message" rows={4} required placeholder="Tell us about your goals..." />
                  </div>
                  <Button type="submit" variant="primary">
                    Send Message
                    <ArrowRight />
                  </Button>
                </form>
              </div>
            </motion.div>
          </motion.div>

          <motion.div className="contact-map" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }}>
            <div className="contact-map__frame">
              <iframe
                title="ONE: Personal Training Location"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(business.address)}&output=embed`}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="contact-map__info">
              <h3>Find us in Mayfair</h3>
              <p>{business.address}</p>
              <a href={business.googleMaps} target="_blank" rel="noopener noreferrer">
                Open in Google Maps <ArrowRight />
              </a>
            </div>
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}
