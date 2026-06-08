import business from '../../config/business';
import Hero from '../home/Hero';
import Services from '../home/Services';
import About from '../home/About';
import WhyChooseUs from '../home/WhyChooseUs';
import Stats from '../home/Stats';
import Testimonials from '../home/Testimonials';
import Contact from '../home/Contact';
import Faq from '../home/Faq';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <About />
      <WhyChooseUs />
      <Stats stats={business.stats} />
      <Testimonials testimonials={business.testimonials} />
      <Contact />
      <Faq />
    </main>
  );
}
