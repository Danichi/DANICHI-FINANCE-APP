import React, { useState, useEffect } from 'react';
import { Moon, Sun, Download, AlertCircle } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useSettings, useUpdateSettings, useRolePresets } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import { useDarkMode } from '../lib/darkMode';

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-1.5">
    <label className="label-caps">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[var(--bg-base)] border-[2px] border-[var(--border-strong)] rounded-xl text-sm font-medium text-[var(--text-primary)] px-3 py-3 focus:border-[var(--accent-orange)] focus:outline-none"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

export const Settings: React.FC = () => {
  const { data: settings } = useSettings();
  const { mutateAsync: updateSettings } = useUpdateSettings();
  const { data: presets } = useRolePresets();
  const { toast } = useToast();
  const { isDark, toggle: toggleDark } = useDarkMode();

  const [ratios, setRatios] = useState({ businessReservePct: '10', clientMgmtPct: '10', salesCommissionPct: '20' });
  const [ratioError, setRatioError] = useState('');

  useEffect(() => {
    if (settings) {
      setRatios({
        businessReservePct: settings.businessReservePct ?? '10',
        clientMgmtPct: settings.clientMgmtPct ?? '10',
        salesCommissionPct: settings.salesCommissionPct ?? '20',
      });
    }
  }, [settings]);

  const workPoolPct = Math.max(0, 100 - parseFloat(ratios.businessReservePct || '0') - parseFloat(ratios.clientMgmtPct || '0') - parseFloat(ratios.salesCommissionPct || '0'));

  const handleSave = async (updates: Record<string, string>) => {
    try {
      await updateSettings(updates as any);
      toast('Settings saved');
    } catch {
      toast('Failed to save settings', 'error');
    }
  };

  const handleRatioSave = async () => {
    const b = parseFloat(ratios.businessReservePct);
    const c = parseFloat(ratios.clientMgmtPct);
    const s = parseFloat(ratios.salesCommissionPct);
    if ([b, c, s].some(n => isNaN(n) || n < 0 || n > 100)) {
      setRatioError('All percentages must be between 0 and 100');
      return;
    }
    if (b + c + s >= 100) {
      setRatioError('The three percentages must sum to less than 100 (the remainder becomes the work pool)');
      return;
    }
    setRatioError('');
    try {
      await updateSettings({ businessReservePct: String(b), clientMgmtPct: String(c), salesCommissionPct: String(s) } as any);
      toast('Revenue formula saved — affects new transactions only');
    } catch {
      toast('Failed to save formula', 'error');
    }
  };

  const handleExport = () => {
    fetch('/api/transactions?limit=1000').then(r => r.json()).then(data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `danichi-export-${new Date().toISOString().slice(0,10)}.json`; a.click();
      URL.revokeObjectURL(url);
    });
  };

  if (!settings) return (
    <PageWrapper title="Settings">
      <div className="flex flex-col gap-5 max-w-2xl">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-card border-[3px] border-[var(--border-default)] h-32 animate-pulse bg-[var(--bg-surface)]" />
        ))}
      </div>
    </PageWrapper>
  );

  return (
    <PageWrapper title="Settings">
      <div className="flex flex-col gap-6 max-w-2xl">

        {/* Appearance */}
        <Card>
          <h3 className="font-display text-lg mb-4 text-[var(--text-primary)]">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Dark Mode</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Easy on the eyes for late-night finance sessions</p>
            </div>
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: isDark ? 'var(--accent-orange)' : 'var(--bg-elevated)',
                border: '2px solid var(--border-strong)',
                boxShadow: '2px 2px 0 var(--border-strong)',
                color: isDark ? '#fff' : 'var(--text-primary)',
              }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </Card>

        {/* Partners */}
        <Card>
          <h3 className="font-display text-lg mb-4 text-[var(--text-primary)]">Partners</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Partner 1 Name"
              defaultValue={settings.malachiName || 'Malachi'}
              onBlur={e => handleSave({ malachiName: e.target.value })}
            />
            <Input
              label="Partner 2 Name"
              defaultValue={settings.danielName || 'Daniel'}
              onBlur={e => handleSave({ danielName: e.target.value })}
            />
          </div>
        </Card>

        {/* Revenue Split Formula */}
        <Card>
          <h3 className="font-display text-lg mb-1 text-[var(--text-primary)]">Revenue Split Formula</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">
            These percentages apply to the net amount of every transaction. The remaining % becomes the work pool split between partners.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label-caps block mb-1.5">Business Reserve %</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" max="99" step="1"
                  value={ratios.businessReservePct}
                  onChange={e => setRatios(r => ({ ...r, businessReservePct: e.target.value }))}
                  className="w-full bg-[var(--bg-base)] border-[2px] border-[var(--border-strong)] rounded-xl text-sm font-mono font-bold text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none"
                />
                <span className="text-[var(--text-secondary)] font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="label-caps block mb-1.5">Client Management %</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" max="99" step="1"
                  value={ratios.clientMgmtPct}
                  onChange={e => setRatios(r => ({ ...r, clientMgmtPct: e.target.value }))}
                  className="w-full bg-[var(--bg-base)] border-[2px] border-[var(--border-strong)] rounded-xl text-sm font-mono font-bold text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none"
                />
                <span className="text-[var(--text-secondary)] font-bold">%</span>
              </div>
            </div>
            <div>
              <label className="label-caps block mb-1.5">Sales Commission %</label>
              <div className="flex items-center gap-2">
                <input
                  type="number" min="0" max="99" step="1"
                  value={ratios.salesCommissionPct}
                  onChange={e => setRatios(r => ({ ...r, salesCommissionPct: e.target.value }))}
                  className="w-full bg-[var(--bg-base)] border-[2px] border-[var(--border-strong)] rounded-xl text-sm font-mono font-bold text-[var(--text-primary)] px-3 py-2.5 focus:border-[var(--accent-orange)] focus:outline-none"
                />
                <span className="text-[var(--text-secondary)] font-bold">%</span>
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <label className="label-caps block mb-1.5">Work Pool (auto)</label>
              <div className="px-3 py-2.5 rounded-xl text-sm font-mono font-bold bg-[var(--bg-surface)] border-[2px] border-[var(--border-default)]"
                style={{ color: workPoolPct < 0 ? 'var(--red)' : workPoolPct < 30 ? 'var(--accent-orange)' : 'var(--green)' }}>
                {workPoolPct.toFixed(0)}%
              </div>
            </div>
          </div>

          {ratioError && (
            <div className="flex items-center gap-2 text-sm text-[var(--red)] mb-3 p-3 rounded-xl bg-[var(--red-dim)]">
              <AlertCircle size={14} /> {ratioError}
            </div>
          )}

          <button
            onClick={handleRatioSave}
            className="px-5 py-2 text-sm font-bold text-white rounded-pill transition-all hover:-translate-x-px hover:-translate-y-px"
            style={{ background: 'var(--accent-orange)', border: '2px solid var(--border-strong)', boxShadow: '3px 3px 0 var(--border-strong)' }}
          >
            Save Formula
          </button>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">Changes apply to new transactions only — existing records are not recalculated.</p>
        </Card>

        {/* Split Defaults */}
        <Card>
          <h3 className="font-display text-lg mb-1 text-[var(--text-primary)]">Split Defaults</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Pre-populates the New Transaction form — always overridable per transaction.</p>
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Default Client Manager"
              value={settings.defaultClientManager || 'malachi'}
              onChange={v => handleSave({ defaultClientManager: v })}
              options={[{ value: 'malachi', label: settings.malachiName || 'Malachi' }, { value: 'daniel', label: settings.danielName || 'Daniel' }, { value: 'split', label: 'Split 50/50' }]}
            />
            <SelectField
              label="Default Sales Commission"
              value={settings.defaultSalesCommission || 'malachi'}
              onChange={v => handleSave({ defaultSalesCommission: v })}
              options={[{ value: 'malachi', label: settings.malachiName || 'Malachi' }, { value: 'daniel', label: settings.danielName || 'Daniel' }, { value: 'split', label: 'Split 50/50' }]}
            />
          </div>
        </Card>

        {/* Role Presets */}
        {presets && presets.length > 0 && (
          <Card>
            <h3 className="font-display text-lg mb-4 text-[var(--text-primary)]">Role Presets</h3>
            <div className="flex flex-col gap-2">
              {presets.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b-[2px] border-[var(--border-default)] last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      CM: {p.clientManager} · Sales: {p.salesCommission} · Work: {p.malachiPercentage}/{p.danielPercentage}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Currency */}
        <Card>
          <h3 className="font-display text-lg mb-4 text-[var(--text-primary)]">Currency</h3>
          <div className="flex gap-3">
            {['CAD', 'USD'].map(c => (
              <button
                key={c}
                onClick={() => handleSave({ currency: c })}
                className={`px-6 py-2.5 rounded-xl border-[2px] text-sm font-bold transition-all ${settings.currency === c || (!settings.currency && c === 'CAD') ? '' : ''}`}
                style={settings.currency === c || (!settings.currency && c === 'CAD')
                  ? { borderColor: 'var(--accent-orange)', background: 'var(--accent-orange-dim)', color: 'var(--accent-orange)', boxShadow: '2px 2px 0 var(--accent-orange)' }
                  : { borderColor: 'var(--border-default)', color: 'var(--text-secondary)', background: 'transparent' }
                }
              >
                {c}
              </button>
            ))}
          </div>
        </Card>

        {/* Data */}
        <Card>
          <h3 className="font-display text-lg mb-2 text-[var(--text-primary)]">Data</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">Export all transaction data as JSON for backup or external processing.</p>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-pill transition-all hover:-translate-x-px hover:-translate-y-px"
            style={{ border: '2px solid var(--border-strong)', boxShadow: '3px 3px 0 var(--border-strong)', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
          >
            <Download size={14} /> Export All Data (JSON)
          </button>
        </Card>

      </div>
    </PageWrapper>
  );
};
