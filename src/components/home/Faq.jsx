import { useState } from 'react';
import { motion } from 'framer-motion';
import business from '../../config/business';
import SectionHeading from '../ui/SectionHeading';
import { staggerContainer, cardItem } from '../../utils/animations';
import './Faq.css';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  if (!business.faq || business.faq.length === 0) return null;

  return (
    <motion.section
      className="section section-alt faq"
      id="faq"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container">
        <SectionHeading
          eyebrow="FAQ"
          title="Common questions"
          align="center"
        />
        <motion.div
          className="faq__list"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {business.faq.map((item, i) => (
            <motion.div
              key={i}
              className={`faq__item ${openIndex === i ? 'faq__item--open' : ''}`}
              variants={cardItem}
            >
              <button
                className="faq__question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span>{item.question}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="faq__chevron">
                  <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="faq__answer" role="region">
                <p>{item.answer}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
