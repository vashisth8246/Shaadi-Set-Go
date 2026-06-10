import { motion } from 'framer-motion';

interface LuxuryPageHeaderProps {
  kicker: string;
  title: string;
  subtitle: string;
}

export default function LuxuryPageHeader({ kicker, title, subtitle }: LuxuryPageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="luxury-page-header"
    >
      <span className="luxury-kicker">✦ {kicker} ✦</span>
      <h1>{title}</h1>
      <div className="luxury-ornament">─── ✦ ───</div>
      <p>{subtitle}</p>
    </motion.header>
  );
}
