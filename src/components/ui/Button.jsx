import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Button.css';

const btnMotion = {
  whileHover: { scale: 1.05, boxShadow: '0px 10px 30px rgba(255, 69, 0, 0.4)' },
  whileTap: { scale: 0.95 },
  transition: { type: 'spring', stiffness: 400, damping: 17 },
};

const MotionLink = motion(Link);

export default function Button({ children, href, to, variant = 'primary', type, onClick, className = '' }) {
  const classes = `btn btn--${variant} ${className}`;

  if (to) {
    return (
      <MotionLink to={to} className={classes} {...btnMotion}>
        {children}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a
        href={href}
        className={classes}
        target={href.startsWith('http') && !href.includes('wa.me') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...btnMotion}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type || 'button'}
      onClick={onClick}
      className={classes}
      {...btnMotion}
    >
      {children}
    </motion.button>
  );
}
