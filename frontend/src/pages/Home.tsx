import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import type { CSSProperties } from 'react';
import type { Variants } from 'framer-motion';
import { MapPin, Utensils, Camera, Music, Sparkles, Calculator, Star, ChevronDown } from 'lucide-react';
import { services, testimonials } from '../data/constants';
import { pageImages } from '../data/siteContent';

const iconMap = {
  MapPin,
  Utensils,
  Camera,
  Music,
  Sparkles,
  Calculator,
};

const ease = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease },
  },
};

const heroWords = ['Vadodara', 'Weddings,', 'Curated', 'Like', 'Royalty'];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="luxury-hero">
        <div
          className="luxury-hero-bg luxury-image"
          style={{ backgroundImage: `url('${pageImages.homeHero}')` }}
        />
        <div className="luxury-hero-overlay" />
        <div className="luxury-particles" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} style={{ '--i': index } as CSSProperties} />
          ))}
        </div>

        <div className="luxury-hero-content">
          <motion.div
            className="luxury-hero-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            ✦ Vadodara · Gujarat ✦
          </motion.div>
          <h1 className="luxury-hero-title" aria-label="Vadodara Weddings, Curated Like Royalty">
            {heroWords.map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 + index * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="luxury-hero-copy"
          >
            A private wedding concierge for families who expect grace, precision, and unforgettable celebration.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="luxury-hero-actions"
          >
            <Link to="/booking" className="luxury-btn luxury-btn-primary">
              Start Planning <span>→</span>
            </Link>
            <Link to="/venues" className="luxury-btn luxury-btn-outline">
              Explore Venues <span>→</span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="luxury-scroll-cue"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        >
          <span>Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      <section className="luxury-section">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="luxury-section-heading"
          >
            <span className="luxury-kicker">✦ What We Curate ✦</span>
            <h2>Every Detail, Quietly Orchestrated</h2>
            <div className="luxury-ornament">─── ✦ ───</div>
            <p>From palatial venues to the final floral note, Shaadi SetGo brings Vadodara's finest wedding partners into one seamless experience.</p>
          </motion.div>

          <motion.div
            className="luxury-stats"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              ['120+', 'Curated Vendors', 120],
              ['500+', 'Celebrations Planned', 500],
              ['5★', 'Concierge Standard', 5],
            ].map(([label, text, end]) => (
              <motion.div className="luxury-stat" variants={item} key={text}>
                <strong>
                  <CountUp end={Number(end)} duration={2} enableScrollSpy scrollSpyOnce />
                  {label.toString().replace(/[0-9]/g, '')}
                </strong>
                <span>{text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {services.map((service) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap];
              return (
                <motion.div key={service.title} variants={item}>
                  <Link to={service.link} className="luxury-card luxury-service-card group">
                    <div className="luxury-card-icon">
                      <Icon className="w-8 h-8" />
                    </div>
                    <span className="luxury-card-tag">Concierge</span>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <span className="luxury-enquire">Enquire →</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <div className="luxury-divider" />

      <section className="luxury-section luxury-section-alt">
        <div className="luxury-container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="luxury-section-heading"
          >
            <span className="luxury-kicker">✦ Families We Served ✦</span>
            <h2>Trust, Told Softly</h2>
            <div className="luxury-ornament">─── ✦ ───</div>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {testimonials.map((testimonial) => (
              <motion.div key={testimonial.id} variants={item} className="luxury-card luxury-testimonial">
                <div className="flex items-center mb-5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                  ))}
                </div>
                <p>"{testimonial.text}"</p>
                <div className="flex items-center mt-7">
                  <img loading="lazy" src={testimonial.image} alt={testimonial.name} className="luxury-avatar" />
                  <div>
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.wedding}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="luxury-cta">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="luxury-container text-center"
        >
          <span className="luxury-kicker">✦ Your Wedding Desk Awaits ✦</span>
          <h2>Ready to Plan Your Dream Wedding?</h2>
          <p>Step into a calmer way to plan. We will bring the right people, timing, and taste to the table.</p>
          <Link to="/booking" className="luxury-btn luxury-btn-primary">
            Get Started <span>→</span>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
