import React, { useState } from 'react';
import { DisruptionType, DisruptionSeverity, Flight } from '../types';
import { X, Zap } from 'lucide-react';

interface SimulationControlsModalProps {
  flights: Flight[];
  isOpen: boolean;
  onClose: () => void;
  onTriggerDisruption: (
    flightId: string,
    type: DisruptionType,
    severity: DisruptionSeverity,
    rootCause: string,
    description: string,
    estimatedDelayMinutes: number
  ) => void;
}

export const SimulationControlsModal: React.FC<SimulationControlsModalProps> = ({
  flights,
  isOpen,
  onClose,
  onTriggerDisruption,
}) => {
  const [selectedFlightId, setSelectedFlightId] = useState<string>(flights[0]?.id || 'FL-UA882');
  const [disruptionType, setDisruptionType] = useState<DisruptionType>('CANCELLATION');
  const [severity, setSeverity] = useState<DisruptionSeverity>('CRITICAL');
  const [rootCause, setRootCause] = useState('Engine #2 Hydraulic Sensor Fault (Air Turnback on Taxiway)');
  const [description, setDescription] = useState(
    'Low hydraulic pressure detected in Engine #2 during taxi. Boroscope inspection confirms metal shavings. Aircraft removed from service for unscheduled overhaul.'
  );
  const [delayMinutes, setDelayMinutes] = useState(720);

  if (!isOpen) return null;

  // Preset Scenarios
  const PRESET_SCENARIOS = [
    {
      title: 'Engine Failure Cancellation (SFO → LHR)',
      flightId: 'FL-UA882',
      type: 'CANCELLATION' as DisruptionType,
      severity: 'CRITICAL' as DisruptionSeverity,
      rootCause: 'Engine #2 Hydraulic Sensor Fault (Air Turnback on Taxiway)',
      description: 'During taxi to Runway 28L, low hydraulic pressure reported in Engine #2. Tech Ops boroscope confirms metal shavings. Aircraft removed from service.',
      delayMinutes: 720,
      badge: 'Critical · 312 Pax · ~$251k exposure',
    },
    {
      title: 'Severe ATC Ground Stop (JFK → CDG)',
      flightId: 'FL-DL420',
      type: 'LONG_DELAY' as DisruptionType,
      severity: 'HIGH' as DisruptionSeverity,
      rootCause: 'FAA Ground Delay Program & Severe Convective Weather Line',
      description: 'FAA ATCSCC issued GDP for New York TRACON. 270 min departure gate hold, resulting in 42 missed onward European connections in Paris CDG.',
      delayMinutes: 270,
      badge: 'High · 42 Misconnects · ~$185k exposure',
    },
    {
      title: 'Aircraft Gauge Downsize (LAX → HND)',
      flightId: 'FL-AA198',
      type: 'AIRCRAFT_CHANGE' as DisruptionType,
      severity: 'HIGH' as DisruptionSeverity,
      rootCause: 'Inbound Bird Strike Gauge Change (Boeing 787-9 to Boeing 737-MAX8)',
      description: 'Scheduled 787-9 damaged by bird strike on descent. Standby 737-MAX8 downsized capacity from 240 booked passengers to 172 seats, creating 68 oversold involuntary bump passengers.',
      delayMinutes: 75,
      badge: 'High · 68 Pax Oversold · ~$82k exposure',
    },
    {
      title: 'Heathrow Freezing Fog (SFO → LHR)',
      flightId: 'FL-BA284',
      type: 'AIRPORT_CLOSURE' as DisruptionType,
      severity: 'HIGH' as DisruptionSeverity,
      rootCause: 'Heathrow Low Visibility Operations CAT III Below Minimums',
      description: 'Dense freezing fog at LHR reduces airport acceptance rate by 40%. Mandatory 180 min departure hold instituted at SFO with crew duty timeout risk.',
      delayMinutes: 180,
      badge: 'High · 110 Connections · ~$243k exposure',
    },
  ];

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setSelectedFlightId(preset.flightId);
    setDisruptionType(preset.type);
    setSeverity(preset.severity);
    setRootCause(preset.rootCause);
    setDescription(preset.description);
    setDelayMinutes(preset.delayMinutes);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerDisruption(
      selectedFlightId,
      disruptionType,
      severity,
      rootCause,
      description,
      delayMinutes
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Simulate Disruption Incident
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trigger simulated irregular operations (IRROPS) into the agentic workflow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[75vh] overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Preset Incident Scenarios
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_SCENARIOS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                    selectedFlightId === preset.flightId && disruptionType === preset.type
                      ? 'bg-sky-50 border-sky-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">
                    {preset.title}
                  </div>
                  <div className="text-[11px] font-mono text-sky-700 font-medium mt-1">
                    {preset.badge}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Monitored Flight
              </label>
              <select
                value={selectedFlightId}
                onChange={(e) => setSelectedFlightId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
              >
                {flights.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.flightNumber} ({f.origin.code} → {f.destination.code}) · {f.passengerCount} Pax
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disruption Classification
                </label>
                <select
                  value={disruptionType}
                  onChange={(e) => setDisruptionType(e.target.value as DisruptionType)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
                >
                  <option value="CANCELLATION">Cancellation (Mechanical / Operational)</option>
                  <option value="LONG_DELAY">Long Delay (ATC / Weather &gt; 180 min)</option>
                  <option value="AIRCRAFT_CHANGE">Aircraft Gauge Downsize (Oversold Pax)</option>
                  <option value="MISSED_CONNECTION">Inbound Delay Missed Connection</option>
                  <option value="AIRPORT_CLOSURE">Airport Closure / Freezing Fog</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Severity Rating
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as DisruptionSeverity)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Multi-Agent Intervention)</option>
                  <option value="HIGH">HIGH (Priority Rebooking & Care)</option>
                  <option value="MODERATE">MODERATE (Monitoring / Minor Delay)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Root Cause Summary
                </label>
                <input
                  type="text"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Delay (min)
                </label>
                <input
                  type="number"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Trigger Disruption & Run Agent Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
