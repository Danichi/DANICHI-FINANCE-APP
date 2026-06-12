import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, width = 'md' }) => (
  <AnimatePresence>
    {open && (
      <>
        <motion.div
          className="fixed inset-0 bg-[#18130e]/40 backdrop-blur-sm z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className={`w-full ${widths[width]} bg-white border-[3px] border-[#18130e] rounded-card shadow-card`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-5 border-b-[2px] border-[var(--border-default)]">
                <h2 className="font-display text-lg font-bold text-[var(--text-primary)]">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full border-[2px] border-[#18130e] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            {children}
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);
