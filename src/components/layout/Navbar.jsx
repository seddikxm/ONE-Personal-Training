import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Calendar, ArrowRight, X } from 'lucide-react';
import business from '../../config/business';
import { slideDown } from '../../utils/animations';
import './Navbar.css';

const linkVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.15 + i * 0.06, duration: 0.4, ease: [0.25, 0.1, 0, 1] },
  }),
};

const mobileLinkVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.3 + i * 0.07, duration: 0.35, ease: [0.25, 0.1, 0, 1] },
  }),
  exit: { opacity: 0, x: -10, transition: { duration: 0.15 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const menuPanelVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 32, mass: 0.8 } },
  exit: { x: '100%', transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [menuOpen]);

  const scrollOrNavigate = (path) => {
    if (isHome && path.startsWith('#')) {
      const el = document.getElementById(path.slice(1));
      if (el) { el.scrollIntoView({ behavior: 'smooth' }); setMenuOpen(false); return; }
    }
  };

  return (
    <motion.header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      variants={slideDown}
      initial="hidden"
      animate="visible"
    >
      <div className="navbar__accent" />
      <div className="navbar__grain" />

      <div className="navbar__inner container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark" aria-hidden="true" />
          <span className="navbar__logo-text">
            ONE<span className="navbar__logo-dim">:</span>
          </span>
        </Link>

        <nav className="navbar__desktop">
          {business.navLinks.map((link, i) => (
            <motion.div
              key={link.path}
              custom={i}
              variants={linkVariants}
              initial="hidden"
              animate="visible"
              className="navbar__link-wrap"
            >
              <Link
                to={link.path}
                className={`navbar__link ${link.path === '/book' ? 'navbar__link--cta' : ''} ${location.pathname === link.path ? 'navbar__link--active' : ''}`}
                onClick={() => scrollOrNavigate(link.path)}
              >
                {link.path === '/book' && <Calendar size={14} />}
                {link.label}
                {link.path === '/book' && <ArrowRight size={14} className="navbar__cta-arrow" />}
              </Link>
              {location.pathname === link.path && link.path !== '/book' && (
                <motion.span
                  className="navbar__active-dot"
                  layoutId="navDot"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </motion.div>
          ))}
        </nav>

        <div className="navbar__right">
          <Link to="/book" className="navbar__book-btn">
            <Calendar size={15} />
            <span>Schedule</span>
            <ArrowRight size={14} className="navbar__book-arrow" />
          </Link>

          <button
            className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="navbar__mobile-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="navbar__mobile-panel"
              variants={menuPanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="navbar__mobile-header">
                <span className="navbar__mobile-title">Menu</span>
                <button className="navbar__mobile-close" onClick={() => setMenuOpen(false)}>
                  <X size={22} />
                </button>
              </div>
              <nav className="navbar__mobile-nav">
                {business.navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    custom={i}
                    variants={mobileLinkVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Link
                      to={link.path}
                      className={`navbar__mobile-link ${location.pathname === link.path ? 'navbar__mobile-link--active' : ''}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                      <ArrowRight size={16} className="navbar__mobile-arrow" />
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <motion.div
                className="navbar__mobile-footer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.7 } }}
              >
                <Link to="/book" className="navbar__mobile-cta" onClick={() => setMenuOpen(false)}>
                  <Calendar size={16} />
                  Schedule Your Session
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
