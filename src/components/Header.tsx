import React, { useState, useEffect } from 'react';
import { ActivePage } from '../types';
import { Plane, RefreshCw, Zap, Clock, Sparkles } from 'lucide-react';

interface HeaderProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  activeDisruptionCount: number;
  totalMonitoredFlights: number;
  totalAffectedPax: number;
  onOpenSimulationModal: () => void;
  onResetData: () => void;
  onAgenticFastTrack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  activeDisruptionCount,
  totalMonitoredFlights,
  totalAffectedPax,
  onOpenSimulationModal,
  onResetData,
  onAgenticFastTrack,
}) => {
  const [timeUtc, setTimeUtc] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navLinks: { page: ActivePage; label: string }[] = [
    { page: 'flights', label: 'Flights' },
    { page: 'disruption', label: 'Disruption & Pax' },
    { page: 'policy', label: 'Policy Engine' },
    { page: 'rebooking', label: 'Rebooking' },
    { page: 'approval', label: 'Approval' },
    { page: 'agents', label: 'Agent Stream' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Bar Contract: 3 zones */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
            <Plane className="w-4 h-4" />
          </div>
          <button
            onClick={() => onNavigate('flights')}
            className="text-base font-semibold tracking-tight text-slate-900 hover:text-sky-600 transition-colors whitespace-nowrap text-left cursor-pointer"
          >
            Flight Disruption Manager
          </button>
        </div>

        {/* Zone 2: 6 Clean navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {navLinks.map((item) => {
            const isActive = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`transition-colors whitespace-nowrap py-1 relative cursor-pointer ${
                  isActive
                    ? 'text-sky-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* UTC Clock */}
          <div className="hidden xl:flex items-center gap-1.5 font-mono text-xs text-slate-500 mr-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="tabular-nums font-medium">{timeUtc || '18:45:00 UTC'}</span>
          </div>

          {onAgenticFastTrack && (
            <button
              onClick={onAgenticFastTrack}
              title="Autonomous agents evaluate policy and inventory for Platinum passenger and route straight to Human-in-the-Loop approval"
              className="px-3 py-1.5 text-xs font-semibold text-sky-900 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-700" />
              <span>⚡ Auto-Pilot to HITL</span>
            </button>
          )}

          <button
            onClick={onResetData}
            title="Reset simulation to initial state"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenSimulationModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Disruption</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Scroller */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 border-t border-slate-100 overflow-x-auto text-xs bg-slate-50">
        {navLinks.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
              activePage === item.page
                ? 'bg-sky-100 text-sky-800 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
