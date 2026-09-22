import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function ScrollReveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedCounter({
  value,
  suffix = '',
  duration = 1600,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const safe = Number.isFinite(value) ? value : 0;
    if (safe <= 0) {
      setCount(0);
      return;
    }
    const steps = 48;
    const increment = safe / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= safe) {
        setCount(safe);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <>
      {count.toLocaleString('fr-FR')}
      {suffix}
    </>
  );
}
