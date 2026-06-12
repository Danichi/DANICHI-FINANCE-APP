import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { useClients } from '../lib/api';
import { formatCAD, formatDate } from '../lib/formatters';

export const Clients: React.FC = () => {
  const navigate = useNavigate();
  const { data: clients, isLoading } = useClients();

  return (
    <PageWrapper title="Clients">
      {isLoading ? (
        <div className="text-[var(--text-tertiary)] text-sm">Loading…</div>
      ) : clients?.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16">
          <Users size={48} className="text-[var(--text-tertiary)]" />
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-secondary)]">No clients yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Clients are added automatically when you log transactions</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {clients?.map(client => (
            <Card key={client.id} hover onClick={() => navigate(`/transactions?client=${client.name}`)}>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1 truncate">{client.name}</h3>
              <div className="flex flex-col gap-1.5 mt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Total Revenue</span>
                  <span className="font-mono font-bold text-[var(--accent-orange)]">{formatCAD(client.totalRevenue ?? 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Transactions</span>
                  <span className="font-mono text-[var(--text-primary)]">{client.transactionCount ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Avg Value</span>
                  <span className="font-mono text-[var(--text-primary)]">{formatCAD(client.avgTransactionValue ?? 0)}</span>
                </div>
                {client.lastPaymentDate && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--text-secondary)]">Last Payment</span>
                    <span className="text-[var(--text-tertiary)]">{formatDate(client.lastPaymentDate)}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};
