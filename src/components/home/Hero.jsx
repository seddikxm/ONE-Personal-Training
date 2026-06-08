import { motion } from 'framer-motion';
import business from '../../config/business';
import Button from '../ui/Button';
import './Hero.css';

const heroContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 12 },
  },
};

export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero__bg">
        <img src={business.hero.image} alt="" />
        <div className="hero__overlay" />
      </div>
      <motion.div
        className="hero__content container"
        variants={heroContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.span className="eyebrow" variants={heroItem}>{business.hero.eyebrow}</motion.span>
        <motion.h1 className="hero__title" variants={heroItem}>{business.hero.headline}</motion.h1>
        <motion.p className="hero__subtitle" variants={heroItem}>{business.hero.supporting}</motion.p>
        <motion.div className="hero__actions" variants={heroItem}>
          <Button href="/book" variant="hero">{business.hero.primaryCta}</Button>
          <Button href={`tel:${business.phoneRaw}`} variant="hero-outline">{business.hero.secondaryCta}</Button>
        </motion.div>
        <motion.p className="hero__trust" variants={heroItem}>{business.hero.trustLine}</motion.p>
      </motion.div>
    </section>
  );
}
