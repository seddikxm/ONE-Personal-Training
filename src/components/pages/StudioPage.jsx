import { useEffect } from 'react';
import business from '../../config/business';
import Button from '../ui/Button';
import SectionHeading from '../ui/SectionHeading';
import './StudioPage.css';

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

export default function StudioPage() {
  useScrollReveal();

  return (
    <main>
      <section className="section studio-intro">
        <div className="container">
          <div className="studio-intro__grid">
            <div className="studio-intro__text" data-reveal="up">
              <span className="studio-intro__dropcap" aria-hidden="true">O</span>
              {business.studio.description.split('\n\n').map((p, i) => (
                <p key={i}>{i === 0 ? p.replace(/^ONE:/, '').trim() : p}</p>
              ))}
            </div>
            <div className="studio-intro__aside" data-reveal="up" data-reveal-delay="150">
              <div className="studio-intro__card">
                <div className="studio-intro__card-ornament" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="19.5" stroke="#A0988A" strokeOpacity="0.15" />
                    <circle cx="20" cy="20" r="12.5" stroke="#A0988A" strokeOpacity="0.1" />
                  </svg>
                </div>
                <div className="studio-intro__card-icon">
                  <svg width="17" height="21" viewBox="0 0 17 21" fill="none">
                    <path d="M8.5 0C3.81 0 0 3.81 0 8.5c0 6.38 8.5 12.75 8.5 12.75S17 14.88 17 8.5C17 3.81 13.19 0 8.5 0zm0 11.56a3.06 3.06 0 110-6.12 3.06 3.06 0 010 6.12z" fill="#EA4335"/>
                  </svg>
                </div>
                <p className="studio-intro__card-label">Location</p>
                <p className="studio-intro__card-street">{business.shortAddress.split(',')[0]}</p>
                <p className="studio-intro__card-city">{business.shortAddress.split(',').slice(1).join(',').trim()}</p>
                <Button href={business.googleMaps} variant="outline" className="studio-intro__card-btn">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Get Directions
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section studio-facilities">
        <div className="container">
          <SectionHeading
            eyebrow="Our Facilities"
            title="Designed with the utmost attention to detail"
            align="center"
          />
          <div className="studio-facilities__list">
            <div className="facility-row" data-reveal="up">
              <div className="facility-row__image">
                <img src={business.studio.images[0]} alt={`${business.name} studio`} loading="lazy" />
              </div>
              <div className="facility-row__list">
                {business.studio.facilities.slice(0, 3).map((facility, i) => (
                  <div key={i} className="facility-row__item">
                    <span className="facility-row__number">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="facility-row__text">{facility}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="facility-row facility-row--reverse" data-reveal="up">
              <div className="facility-row__image">
                <img src={business.studio.images[1]} alt={`${business.name} studio`} loading="lazy" />
              </div>
              <div className="facility-row__list">
                {business.studio.facilities.slice(3).map((facility, i) => (
                  <div key={i} className="facility-row__item">
                    <span className="facility-row__number">{String(i + 4).padStart(2, '0')}</span>
                    <div>
                      <p className="facility-row__text">{facility}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section studio-press">
        <div className="container">
          <SectionHeading
            eyebrow="Press Articles"
            title="As featured in"
            align="center"
          />
          <div className="studio-press__grid">
            {business.pressArticles.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="studio-press__card"
                data-reveal="up"
                data-reveal-delay={i * 100}
              >
                <div className="studio-press__image">
                  <img src={article.image} alt={article.publication} loading="lazy" />
                </div>
                <div className="studio-press__body">
                  <span className="studio-press__pub">{article.publication}</span>
                  <h3>{article.title}</h3>
                  <span className="studio-press__link">
                    Read article
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7H11M11 7L7.5 3.5M11 7L7.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="studio-cta">
        <div className="studio-cta__bg">
          <img src={business.studio.images[1]} alt="" />
        </div>
        <div className="studio-cta__overlay" />
        <div className="container studio-cta__content" data-reveal="up">
          <h2>Experience the studio</h2>
          <p>Book a consultation and visit our Mayfair studio</p>
          <Button to="/book" variant="secondary">Schedule Your Session</Button>
        </div>
      </section>
    </main>
  );
}
