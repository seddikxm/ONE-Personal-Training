import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import business from '../../config/business';
import Button from '../ui/Button';
import { fadeUp, staggerContainer } from '../../utils/animations';
import './ServicesPage.css';

const numberWords = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

function useScrollReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('service-card--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const cards = el.querySelectorAll('.service-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function ServicesPage() {
  const listRef = useScrollReveal();

  return (
    <main className="services-page">
      <motion.section
        className="services-hero"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="services-hero__bg" />
        <div className="services-hero__orb" aria-hidden="true" />
        <div className="container">
          <motion.div className="services-hero__inner" variants={fadeUp}>
            <span className="services-hero__eyebrow">Our Services</span>
            <div className="services-hero__accent" />
            <h1 className="services-hero__title">Comprehensive training,<br />recovery and wellness</h1>
            <p className="services-hero__text">
              From one-to-one coaching to rehabilitation, massage to online training — every service is built around you.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className="section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="container">
          <div className="services-list" ref={listRef}>
            {business.services.map((service, i) => (
              <article key={service.title} className={`service-card ${i % 2 === 1 ? 'service-card--reverse' : ''}`}>
                <div className="service-card__divider" aria-hidden="true" />
                <div className="service-card__number" aria-hidden="true">
                  <span className="service-card__number-digit">{String(i + 1).padStart(2, '0')}</span>
                  <span className="service-card__number-word">{numberWords[i + 1]}</span>
                </div>
                <div className="service-card__image">
                  <div className="service-card__image-overlay" />
                  <img src={service.image} alt={service.title} loading="lazy" />
                </div>
                <div className="service-card__content">
                  <h2 className="service-card__title">{service.title}</h2>
                  <div className="service-card__accent" />
                  {service.fullDescription.split('\n\n').map((p, j) => (
                    <p key={j} className="service-card__text">{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="services-cta"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="services-cta__bg" />
        <div className="container text-center">
          <div className="services-cta__inner">
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.5)' }}>Begin Your Journey</span>
            <h2 className="services-cta__title">Ready to begin?</h2>
            <p className="services-cta__text">
              Contact us to find out more information on our services
            </p>
            <div className="services-cta__action">
              <Button href={`tel:${business.phoneRaw}`} variant="secondary">Contact Us</Button>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
