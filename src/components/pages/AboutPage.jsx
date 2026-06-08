import { useEffect, useState, useCallback } from 'react';
import business from '../../config/business';
import Button from '../ui/Button';
import SectionHeading from '../ui/SectionHeading';
import './AboutPage.css';

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function AboutPage() {
  useScrollReveal();
  const [showAllCerts, setShowAllCerts] = useState(false);
  const certs = business.founder.qualifications;
  const visibleCerts = showAllCerts ? certs : certs.slice(0, 6);

  return (
    <main>
      <section className="about-intro">
        <div className="container">
          <div className="about-intro__content" data-reveal="up">
            <span className="eyebrow">About Us</span>
            <h1>Inspiring clients to move better and get stronger</h1>
            <p className="about-intro__text">{business.about.intro}</p>
          </div>
        </div>
      </section>

      <section className="section about-story">
        <div className="container">
          <div className="about-story__grid">
            <div className="about-story__text" data-reveal="up">
              <span className="about-story__dropcap" aria-hidden="true">T</span>
              {business.about.body.split('\n\n').map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <Button to="/book" variant="outline" style={{ marginTop: 'var(--space-32)' }}>
                Schedule Your Session
              </Button>
            </div>
            <div className="about-story__quote" data-reveal="up" data-reveal-delay="150">
              <svg width="32" height="26" viewBox="0 0 28 24" fill="none" className="about-story__quote-mark">
                <path d="M6.4 0C9.6 0 12.2667 2.13333 12.2667 5.86667C12.2667 13.3333 6.4 19.2 0 21.3333L1.06667 16C4.26667 16 6.93333 14.4 6.93333 10.6667V8.53333H4.26667C2.13333 8.53333 0 6.93333 0 4.26667C0 1.6 2.13333 0 4.26667 0H6.4ZM21.3333 0C24.5333 0 27.2 2.13333 27.2 5.86667C27.2 13.3333 21.3333 19.2 14.9333 21.3333L16 16C19.2 16 21.8667 14.4 21.8667 10.6667V8.53333H19.2C17.0667 8.53333 14.9333 6.93333 14.9333 4.26667C14.9333 1.6 17.0667 0 19.2 0H21.3333Z" fill="currentColor"/>
              </svg>
              <p>{business.founder.quote}</p>
              <cite>— {business.founder.name}, Founder</cite>
            </div>
          </div>
        </div>
      </section>

      <section className="section about-principles">
        <div className="container">
          <SectionHeading
            eyebrow="Our Founding Principles"
            title="Built on education, connection and enjoyment"
            align="center"
          />
          <div className="about-principles__grid">
            {business.foundingPrinciples.map((principle, i) => (
              <div key={i} className="about-principles__card" data-reveal="up" data-reveal-delay={i * 100}>
                <span className="about-principles__num">0{i + 1}</span>
                <div className="about-principles__accent" />
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-founder">
        <div className="container">
          <SectionHeading
            eyebrow="About ONE: Founder"
            title={business.founder.name}
          />
          <div className="about-founder__grid">
            <div className="about-founder__image" data-reveal="up">
              <img src={business.founder.image} alt={business.founder.name} />
            </div>
            <div className="about-founder__content" data-reveal="up" data-reveal-delay="100">
              <p className="about-founder__title">{business.founder.title}</p>
              <div className="about-founder__bio">
                {business.founder.bio.split('\n\n').map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="about-founder__certs">
                <h4>Qualifications</h4>
                <ul>
                  {visibleCerts.map((cert, i) => (
                    <li key={i}>{cert}</li>
                  ))}
                </ul>
                {certs.length > 6 && (
                  <button
                    className="about-founder__certs-toggle"
                    onClick={() => setShowAllCerts(!showAllCerts)}
                  >
                    {showAllCerts ? 'Show less' : `Show ${certs.length - 6} more`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section about-team">
        <div className="container">
          <SectionHeading
            eyebrow="Meet the Team"
            title="The people behind ONE:"
            align="center"
          />
          <TeamCarousel members={business.team} />
        </div>
      </section>

    </main>
  );
}

function TeamCarousel({ members }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % members.length);
  }, [members.length]);

  const prev = useCallback(() => {
    setCurrent(prev => (prev - 1 + members.length) % members.length);
  }, [members.length]);

  useEffect(() => {
    if (paused || members.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, members.length]);

  const m = members[current];

  return (
    <div
      className="team-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button className="team-carousel__arrow team-carousel__arrow--prev" onClick={prev} aria-label="Previous team member">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M13.5 16L8.5 11L13.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="team-carousel__viewport">
        <div className="team-carousel__slide" key={current}>
          <div className={`team-carousel__image ${m.name === 'Issy' ? 'team-carousel__image--issy' : ''}`}>
            <img src={m.image} alt={m.name} />
            <div className="team-carousel__image-accent" />
          </div>
          <div className="team-carousel__body">
            <div className="team-carousel__header">
              <h3>{m.name}</h3>
              <span className="team-carousel__role">{m.role}</span>
            </div>
            <div className="team-carousel__tags">
              {m.expertise.map((item, i) => (
                <span key={i} className="team-carousel__tag">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button className="team-carousel__arrow team-carousel__arrow--next" onClick={next} aria-label="Next team member">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M8.5 16L13.5 11L8.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="team-carousel__dots">
        {members.map((_, i) => (
          <button
            key={i}
            className={`team-carousel__dot ${i === current ? 'team-carousel__dot--active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Go to ${members[i].name}`}
          />
        ))}
      </div>
    </div>
  );
}
