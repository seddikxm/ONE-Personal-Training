import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
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
  hidden: { opacity: 0, x: -24 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.22 + i * 0.05, duration: 0.45, ease: [0.25, 0.1, 0, 1] },
  }),
  exit: { opacity: 0, x: -12, transition: { duration: 0.12, ease: [0.4, 0, 1, 1] } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef(null);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const shouldReduceMotion = useReducedMotion();

  const menuPanelVariants = useMemo(() => ({
    hidden: { x: '100%' },
    visible: {
      x: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { type: 'spring', stiffness: 200, damping: 40, mass: 1.1 },
    },
    exit: {
      x: '100%',
      transition: { duration: shouldReduceMotion ? 0 : 0.25, ease: [0.4, 0, 1, 1] },
    },
  }), [shouldReduceMotion]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
      if (e.key === 'Tab' && menuOpen && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    if (menuOpen) {
      document.addEventListener('keydown', handleKeyDown);
      if (panelRef.current) {
        const firstFocusable = panelRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) setTimeout(() => firstFocusable.focus(), 0);
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

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
              ref={panelRef}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 1 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80) setMenuOpen(false);
              }}
            >
              <div className="navbar__mobile-header">
                <h2 className="navbar__mobile-title">Menu</h2>
                <button className="navbar__mobile-close" onClick={() => setMenuOpen(false)}>
                  <X size={22} />
                </button>
              </div>
              <nav className="navbar__mobile-nav">
                {business.navLinks.filter(link => link.path !== '/book').map((link, i) => (
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
                initial={{ opacity: 0, y: 30, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.8, type: 'spring', stiffness: 180, damping: 28 } }}
              >
                <Link to="/book" className="navbar__mobile-cta" onClick={() => setMenuOpen(false)}>
                  <Calendar size={16} />
                  Schedule Your Session
                  <ArrowRight size={16} className="navbar__cta-arrow" />
                </Link>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
