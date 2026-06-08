import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cardItem, scaleOnHover } from '../../utils/animations';
import './ServiceCard.css';

export default function ServiceCard({ service, index }) {
  return (
    <motion.article
      className="service-card"
      variants={cardItem}
      whileHover="hover"
      initial="rest"
    >
      <motion.div className="service-card__image" variants={scaleOnHover}>
        <img
          src={service.image}
          alt={service.title}
          loading="lazy"
        />
      </motion.div>
      <div className="service-card__body">
        <h3>{service.title}</h3>
        <p>{service.description}</p>
        <Link to="/services" className="service-card__link">
          Learn more
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </motion.article>
  );
}
