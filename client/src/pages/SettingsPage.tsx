import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { SystemSettings } from '../types';
import { Sliders, RotateCcw, Save, Cpu } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { addToast } = useApp();

  const [settings, setSettings] = useState<SystemSettings>({
    weights: {
      capacity: 0.25,
      equipment: 0.20,
      availability: 0.20,
      utilization: 0.15,
      preference: 0.10,
      demand: 0.10,
    },
    thresholds: {
      underutilized: 40,
      healthy: 80,
      high: 90,
      overDemanded: 90,
    },
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.getSettings();
        if (res.settings) {
          setSettings(res.settings);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };

    fetchSettings();
  }, []);

  const totalWeight = Object.values(settings.weights).reduce((a, b) => a + b, 0);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      addToast(
        'success',
        'Configuration Saved',
        'Updated allocation scoring weights and utilization thresholds.'
      );
    } catch (err: any) {
      addToast('error', 'Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setSettings({
      weights: {
        capacity: 0.25,
        equipment: 0.20,
        availability: 0.20,
        utilization: 0.15,
        preference: 0.10,
        demand: 0.10,
      },
      thresholds: {
        underutilized: 40,
        healthy: 80,
        high: 90,
        overDemanded: 90,
      },
    });
    addToast('info', 'Defaults Restored', 'Click Save Configuration to apply.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="pb-6 border-b border-[#D7D7D5]">
        <span className="text-[11px] font-semibold text-[#73777A] uppercase tracking-wider block mb-1">
          Algorithmic Tuning
        </span>
        <h1 className="font-serif text-[38px] sm:text-[46px] font-bold leading-[1.0] text-[#30383D]">
          System Controls
        </h1>
        <p className="mt-3 font-sans text-[14px] leading-relaxed text-[#73777A]">
          Calibrate the AI multi-objective scoring weights and campus utilization health thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Scoring Weights */}
        <div className="p-8 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#D7D7D5]">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#30383D] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#30383D]" />
                <span>Allocation Scoring Weights (Stage 2 Soft Scoring)</span>
              </h2>
              <p className="text-xs text-[#73777A] mt-0.5">
                Adjust relative influence of each factor. Total weight normalized to 1.0.
              </p>
            </div>
            <span
              className={`font-mono font-bold text-xs px-3 py-1 rounded-[8px] ${
                Math.abs(totalWeight - 1.0) < 0.01
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Sum: {totalWeight.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            {[
              { key: 'capacity', label: 'Capacity Fit Weight', desc: 'Penalizes wasted seats' },
              { key: 'equipment', label: 'Equipment Match Weight', desc: 'Bonus for hardware coverage' },
              { key: 'availability', label: 'Availability Buffer Weight', desc: 'Clean turnaround gaps' },
              { key: 'utilization', label: 'Utilization Balance Weight', desc: 'Favors lower used spaces' },
              { key: 'preference', label: 'User Preference Weight', desc: 'Satisfies user requests' },
              { key: 'demand', label: 'Demand Balance Weight', desc: 'Reroutes from bottlenecks' },
            ].map((item) => (
              <div key={item.key} className="p-4 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#30383D]">{item.label}</span>
                  <span className="font-mono text-[#30383D] font-bold text-sm">
                    {(settings.weights as any)[item.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.05"
                  value={(settings.weights as any)[item.key]}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      weights: {
                        ...settings.weights,
                        [item.key]: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-[#30383D]"
                />
                <span className="text-[10px] text-[#73777A]">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Utilization Thresholds */}
        <div className="p-8 rounded-[16px] bg-white border border-[#D7D7D5] shadow-sm space-y-5">
          <div className="pb-4 border-b border-[#D7D7D5]">
            <h2 className="font-serif text-lg font-bold text-[#30383D] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#30383D]" />
              <span>Campus Health Thresholds (% Scheduled Load)</span>
            </h2>
            <p className="text-xs text-[#73777A] mt-0.5">
              Defines boundaries for triggering automated underutilized or over-demanded alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
            <div className="p-4 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] space-y-1.5">
              <label className="text-amber-700 font-bold block">
                Underutilized Threshold (&lt; %)
              </label>
              <input
                type="number"
                min="10"
                max="60"
                value={settings.thresholds.underutilized}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    thresholds: {
                      ...settings.thresholds,
                      underutilized: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full bg-white border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D] font-mono font-bold"
              />
              <span className="text-[10px] text-[#73777A]">Flags low-demand facilities</span>
            </div>

            <div className="p-4 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] space-y-1.5">
              <label className="text-emerald-700 font-bold block">
                Healthy Target Limit (Up to %)
              </label>
              <input
                type="number"
                min="50"
                max="85"
                value={settings.thresholds.healthy}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    thresholds: {
                      ...settings.thresholds,
                      healthy: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full bg-white border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D] font-mono font-bold"
              />
              <span className="text-[10px] text-[#73777A]">Optimal equilibrium boundary</span>
            </div>

            <div className="p-4 rounded-[12px] bg-[#F7F7F5] border border-[#D7D7D5] space-y-1.5">
              <label className="text-rose-700 font-bold block">
                Over-Demanded Alert (&gt; %)
              </label>
              <input
                type="number"
                min="70"
                max="98"
                value={settings.thresholds.overDemanded}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    thresholds: {
                      ...settings.thresholds,
                      overDemanded: parseInt(e.target.value, 10),
                    },
                  })
                }
                className="w-full bg-white border border-[#D7D7D5] rounded-[8px] px-3 py-2 text-[#30383D] font-mono font-bold"
              />
              <span className="text-[10px] text-[#73777A]">Triggers re-routing recommendation</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-[#73777A] hover:text-[#30383D] flex items-center gap-1.5 transition font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Challenge Defaults</span>
          </button>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-[10px] bg-[#30383D] hover:bg-[#1F2428] text-white font-medium text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
