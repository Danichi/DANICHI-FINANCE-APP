import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { ToastProvider } from './components/ui/Toast';

import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { TransactionDetail } from './pages/TransactionDetail';
import { Analytics } from './pages/Analytics';
import { EquityTracker } from './pages/EquityTracker';
import { Expenses } from './pages/Expenses';
import { Goals } from './pages/Goals';
import { Clients } from './pages/Clients';
import { Settings } from './pages/Settings';
import { NewTransactionForm } from './components/forms/NewTransactionForm';
import { PageWrapper } from './components/layout/PageWrapper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1 },
  },
});

const AppRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/transactions/new" element={
          <PageWrapper title="New Transaction">
            <NewTransactionForm />
          </PageWrapper>
        } />
        <Route path="/transactions/:id" element={<TransactionDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/equity" element={<EquityTracker />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/goals/new" element={<Goals />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <BrowserRouter>
        <div className="flex min-h-screen bg-[var(--bg-base)]">
          <Sidebar />
          <main className="flex-1 ml-[220px] p-8 bg-[var(--bg-base)]">
            <div className="max-w-content mx-auto">
              <AppRoutes />
            </div>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  </QueryClientProvider>
);

export default App;
