import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import business from '../../config/business';
import SectionHeading from '../ui/SectionHeading';
import ServiceCard from '../ui/ServiceCard';
import Button from '../ui/Button';
import { staggerContainer } from '../../utils/animations';
import './Services.css';

export default function Services() {
  const featured = business.services.slice(0, 6);

  return (
    <motion.section
      className="section services"
      id="services"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="container">
        <SectionHeading
          eyebrow="What We Offer"
          title="Expert training, tailored to you"
          align="center"
        />
        <motion.div
          className="services__grid"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {featured.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </motion.div>
        <div className="services__cta">
          <Link to="/services">
            <Button variant="outline">View All Services</Button>
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
