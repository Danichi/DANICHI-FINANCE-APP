import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageWrapper } from '../components/layout/PageWrapper';
import { useClients } from '../lib/api';
import { formatCAD, formatDate } from '../lib/formatters';

export const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients();

  const totalRevenue = clients?.reduce((s, c) => s + (c.totalRevenue ?? 0), 0) ?? 0;

  return (
    <PageWrapper>
      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-1">Client Roster</p>
        <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">Clients</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          Clients are added automatically when you log a payment.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-card border-[3px] border-[var(--border-default)] bg-[var(--bg-surface)] h-44 animate-pulse" />
          ))}
        </div>
      ) : clients?.length === 0 ? (
        <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--bg-elevated)', border: '2px solid #18130e' }}>
            <Users size={24} className="text-[var(--accent-orange)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No clients yet</h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-xs mx-auto">
            Log your first payment and the client will appear here automatically.
          </p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-5 mb-8">
            <div className="rounded-card border-[3px] border-[#18130e] bg-[var(--accent-orange)] shadow-card p-5 relative overflow-hidden">
              <div className="hero-card-orb" />
              <div className="relative z-10">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total Revenue</p>
                <p className="font-mono font-bold text-2xl text-white">{formatCAD(totalRevenue)}</p>
              </div>
            </div>
            <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-5">
              <p className="section-label mb-1">Total Clients</p>
              <p className="font-mono font-bold text-2xl text-[var(--text-primary)]">{clients?.length ?? 0}</p>
            </div>
            <div className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-5">
              <p className="section-label mb-1">Avg Revenue / Client</p>
              <p className="font-mono font-bold text-2xl text-[var(--text-primary)]">
                {formatCAD((clients?.length ?? 0) > 0 ? totalRevenue / clients!.length : 0)}
              </p>
            </div>
          </div>

          {/* Client cards */}
          <div className="grid grid-cols-2 gap-5">
            {clients?.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-card border-[3px] border-[#18130e] bg-white shadow-card p-6 cursor-pointer hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
                onClick={() => navigate(`/transactions?client=${encodeURIComponent(client.name)}`)}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight truncate">{client.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <TrendingUp size={12} className="text-[var(--accent-orange)]" />
                      <span className="text-xs font-semibold text-[var(--accent-orange)]">{client.transactionCount ?? 0} payment{client.transactionCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[var(--text-tertiary)] flex-shrink-0 mt-1" />
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Total Revenue</span>
                    <span className="font-mono font-bold text-lg text-[var(--accent-orange)]">{formatCAD(client.totalRevenue ?? 0)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[var(--text-secondary)]">Average per payment</span>
                    <span className="font-mono font-semibold text-[var(--text-primary)]">{formatCAD(client.avgTransactionValue ?? 0)}</span>
                  </div>
                  {client.lastPaymentDate && (
                    <div className="flex justify-between items-center pt-2.5 border-t-[2px] border-[var(--border-default)]">
                      <span className="text-xs text-[var(--text-tertiary)]">Last payment</span>
                      <span className="text-xs font-medium text-[var(--text-secondary)]">{formatDate(client.lastPaymentDate)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  );
};
