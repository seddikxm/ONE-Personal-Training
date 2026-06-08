import { motion } from 'framer-motion';
import business from '../../config/business';
import SectionHeading from '../ui/SectionHeading';
import Button from '../ui/Button';
import { fadeUp } from '../../utils/animations';
import './About.css';

export default function About() {
  return (
    <motion.section
      className="section section-alt about"
      id="about"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container">
        <div className="grid-2">
          <motion.div
            className="about__image"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <img src={business.about.image} alt={`${business.name} studio`} />
          </motion.div>
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <SectionHeading
              eyebrow="About Us"
              title="Movement, strength, and recovery — redefined"
            />
            <p className="about__intro">{business.about.intro}</p>
            {business.about.body.split('\n\n').map((p, i) => (
              <p key={i} className="about__body">{p}</p>
            ))}
            <div className="about__cta">
              <Button to="/about" variant="outline">Learn Our Story</Button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
