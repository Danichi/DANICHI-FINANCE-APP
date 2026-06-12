import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useSettings, useUpdateSettings, useRolePresets } from '../lib/api';
import { useToast } from '../components/ui/Toast';

export const Settings: React.FC = () => {
  const { data: settings } = useSettings();
  const { mutateAsync: updateSettings } = useUpdateSettings();
  const { data: presets } = useRolePresets();
  const { toast } = useToast();

  const handleSave = async (updates: Record<string, string>) => {
    try {
      await updateSettings(updates as any);
      toast('Settings saved');
    } catch {
      toast('Failed to save settings', 'error');
    }
  };

  const handleExport = () => {
    fetch('/api/transactions?limit=1000').then(r => r.json()).then(data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'danichi-data.json'; a.click();
      URL.revokeObjectURL(url);
    });
  };

  if (!settings) return <div className="text-[var(--text-tertiary)] text-sm">Loading…</div>;

  return (
    <PageWrapper title="Settings">
      <div className="flex flex-col gap-6 max-w-2xl">
        {/* Partners */}
        <Card>
          <h3 className="font-display text-lg mb-4">Partners</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                label="Partner 1 Name"
                defaultValue={settings.malachiName || 'Malachi'}
                onBlur={e => handleSave({ malachiName: e.target.value })}
              />
            </div>
            <div>
              <Input
                label="Partner 2 Name"
                defaultValue={settings.danielName || 'Daniel'}
                onBlur={e => handleSave({ danielName: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Split Defaults */}
        <Card>
          <h3 className="font-display text-lg mb-4">Split Defaults</h3>
          <p className="text-xs text-[var(--text-secondary)] mb-4">These pre-populate the New Transaction form but can always be changed per transaction.</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="label-caps">Default Client Manager</label>
              <select
                defaultValue={settings.defaultClientManager || 'malachi'}
                onBlur={e => handleSave({ defaultClientManager: e.target.value })}
                className="bg-white border-[2px] border-[#18130e] rounded-xl text-sm font-medium text-[var(--text-primary)] px-3 py-3 focus:border-[var(--accent-orange)] focus:outline-none"
              >
                <option value="malachi">Malachi</option>
                <option value="daniel">Daniel</option>
                <option value="split">Split 50/50</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="label-caps">Default Sales Commission</label>
              <select
                defaultValue={settings.defaultSalesCommission || 'malachi'}
                onBlur={e => handleSave({ defaultSalesCommission: e.target.value })}
                className="bg-white border-[2px] border-[#18130e] rounded-xl text-sm font-medium text-[var(--text-primary)] px-3 py-3 focus:border-[var(--accent-orange)] focus:outline-none"
              >
                <option value="malachi">Malachi</option>
                <option value="daniel">Daniel</option>
                <option value="split">Split 50/50</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Role Presets */}
        <Card>
          <h3 className="font-display text-lg mb-4">Role Presets</h3>
          <div className="flex flex-col gap-2">
            {presets?.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--border-default)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{p.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    CM: {p.clientManager} · Sales: {p.salesCommission} · Work: {p.malachiPercentage}/{p.danielPercentage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Currency */}
        <Card>
          <h3 className="font-display text-lg mb-4">Currency</h3>
          <div className="flex gap-3">
            {['CAD', 'USD'].map(c => (
              <button
                key={c}
                onClick={() => handleSave({ currency: c })}
                className={`px-6 py-2.5 rounded-lg border text-sm font-medium transition-colors ${settings.currency === c || (!settings.currency && c === 'CAD') ? 'border-[var(--accent-orange)] bg-[var(--accent-orange-dim)] text-[var(--accent-orange)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Card>

        {/* Data */}
        <Card>
          <h3 className="font-display text-lg mb-4">Data</h3>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={handleExport}>Export All Data (JSON)</Button>
          </div>
        </Card>
      </div>
    </PageWrapper>
  );
};
