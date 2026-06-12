import React from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, title, action }) => (
  <motion.div
    className="min-h-screen"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.22, ease: 'easeOut' }}
  >
    {(title || action) && (
      <div className="flex items-center justify-between mb-8">
        {title && (
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
        )}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </motion.div>
);
