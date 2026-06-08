import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/animations';
import './SectionHeading.css';

export default function SectionHeading({ eyebrow, title, align = 'left', light }) {
  return (
    <motion.div
      className={`section-heading section-heading--${align} ${light ? 'section-heading--light' : ''}`}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
    </motion.div>
  );
}
