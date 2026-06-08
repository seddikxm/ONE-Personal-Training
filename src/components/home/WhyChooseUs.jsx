import { motion } from 'framer-motion';
import business from '../../config/business';
import SectionHeading from '../ui/SectionHeading';
import { staggerContainer, cardItem } from '../../utils/animations';
import './WhyChooseUs.css';

export default function WhyChooseUs() {
  return (
    <motion.section
      className="section why"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container">
        <SectionHeading
          eyebrow="Why ONE:"
          title="Four reasons to train with us"
          align="center"
        />
        <motion.div
          className="why__grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {business.whyChooseUs.map((item) => (
            <motion.div key={item.number} className="why__card" variants={cardItem}>
              <span className="why__number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
