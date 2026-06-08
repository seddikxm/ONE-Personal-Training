import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeading from '../ui/SectionHeading';
import './Testimonials.css';

function Stars({ rating }) {
  return (
    <span className="testimonials__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 16 16" fill={i < rating ? 'currentColor' : 'none'}>
          <path d="M8 1.5L10.12 5.82L15 6.41L11.5 9.75L12.24 14.68L8 12.36L3.76 14.68L4.5 9.75L1 6.41L5.88 5.82L8 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
        </svg>
      ))}
    </span>
  );
}

export default function Testimonials({ testimonials }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (paused || !testimonials?.length) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, testimonials?.length]);

  if (!testimonials || testimonials.length === 0) return null;

  const t = testimonials[current];

  return (
    <motion.section
      className="section section-alt testimonials"
      id="testimonials"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="What our clients say"
          align="center"
        />

        <div
          className="testimonials__carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button className="testimonials__arrow testimonials__arrow--prev" onClick={prev} aria-label="Previous testimonial">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="testimonials__viewport">
            <AnimatePresence mode="wait">
              <motion.div
                className="testimonials__slide"
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <svg className="testimonials__quote" width="32" height="28" viewBox="0 0 28 24" fill="none">
                  <path d="M6.4 0C9.6 0 12.2667 2.13333 12.2667 5.86667C12.2667 13.3333 6.4 19.2 0 21.3333L1.06667 16C4.26667 16 6.93333 14.4 6.93333 10.6667V8.53333H4.26667C2.13333 8.53333 0 6.93333 0 4.26667C0 1.6 2.13333 0 4.26667 0H6.4ZM21.3333 0C24.5333 0 27.2 2.13333 27.2 5.86667C27.2 13.3333 21.3333 19.2 14.9333 21.3333L16 16C19.2 16 21.8667 14.4 21.8667 10.6667V8.53333H19.2C17.0667 8.53333 14.9333 6.93333 14.9333 4.26667C14.9333 1.6 17.0667 0 19.2 0H21.3333Z" fill="currentColor"/>
                </svg>
                <p className="testimonials__text">{t.text}</p>
                <Stars rating={t.rating || 5} />
                <footer className="testimonials__author">
                  <strong>{t.name}</strong>
                  {t.source && <span>{t.source}</span>}
                </footer>
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="testimonials__arrow testimonials__arrow--next" onClick={next} aria-label="Next testimonial">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="testimonials__dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={`testimonials__dot ${i === current ? 'testimonials__dot--active' : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
