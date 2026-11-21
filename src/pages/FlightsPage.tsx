import React from 'react';
import { Flight, ActivePage } from '../types';
import { FlightList } from '../components/FlightList';
import { Plane, AlertTriangle, ShieldCheck, ArrowRight, Users, DollarSign } from 'lucide-react';
import { Tooltip } from '../components/Tooltip';

interface FlightsPageProps {
  flights: Flight[];
  selectedFlightId: string;
  onSelectFlight: (id: string) => void;
  selectedHub: string;
  onSelectHub: (hub: string) => void;
  onNavigate: (page: ActivePage) => void;
  onOpenSimulationModal: () => void;
  onAgenticFastTrack?: () => void;
}

export const FlightsPage: React.FC<FlightsPageProps> = ({
  flights,
  selectedFlightId,
  onSelectFlight,
  selectedHub,
  onSelectHub,
  onNavigate,
  onAgenticFastTrack,
}) => {
  const selectedFlight = flights.find((f) => f.id === selectedFlightId) || flights[0];
  const activeDisruptions = flights.filter((f) => f.status !== 'ON_TIME');
  const totalAffectedPax = activeDisruptions.reduce((acc, f) => acc + f.passengerCount, 0);
  const totalExposure = activeDisruptions.reduce(
    (acc, f) => acc + (f.estimatedDisruptionCost || (f.status === 'CANCELLED' ? 86400 : 42000)),
    0
  );
  const totalBookedRevenue = flights.reduce(
    (acc, f) => acc + (f.totalBookedRevenue || f.passengerCount * 1100),
    0
  );

  return (
    <div className="space-y-5">
      {/* Top Operations Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Monitored Flights</span>
            <Plane className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
            {flights.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
            Rev: ${(totalBookedRevenue / 1000000).toFixed(2)}M
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Disruptions</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-600 tabular-nums mt-1">
            {activeDisruptions.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Agentic recovery active
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Impacted Travelers</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-700 tabular-nums mt-1">
            {totalAffectedPax}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Requiring re-accommodation
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span>Financial Exposure</span>
              <Tooltip content="Estimated operational cost liability including hotel accommodations ($220), meal allowances ($45), and delay/turnback expenses across disrupted flights" iconOnly />
            </span>
            <DollarSign className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-700 tabular-nums mt-1">
            ${(totalExposure / 1000).toFixed(1)}k
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Duty of care & vouchers
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Agent Pipeline</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-mono font-bold text-emerald-700 mt-2">
            5 Agents Synced
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            HITL gate active
          </div>
        </div>
      </div>

      {/* Selected Flight Quick Callout */}
      {selectedFlight && (
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                selectedFlight.status === 'CANCELLED'
                  ? 'bg-rose-500 animate-pulse'
                  : selectedFlight.status === 'DELAYED'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="font-bold text-slate-900 text-sm">
                  Active Flight: {selectedFlight.flightNumber}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-700 font-semibold">
                  {selectedFlight.origin.code} → {selectedFlight.destination.code}
                </span>
                <span className="text-slate-300">·</span>
                <span
                  className={`font-semibold ${
                    selectedFlight.status === 'CANCELLED'
                      ? 'text-rose-600'
                      : selectedFlight.status === 'DELAYED'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }`}
                >
                  {selectedFlight.status}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-800 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                  Booked Rev: ${( (selectedFlight.totalBookedRevenue || 345600) / 1000 ).toFixed(1)}k
                </span>
                {selectedFlight.status !== 'ON_TIME' && (
                  <span className="text-rose-700 font-bold bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded text-[11px]">
                    IRROPS Cost: ${( (selectedFlight.estimatedDisruptionCost || 86400) / 1000 ).toFixed(1)}k
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {selectedFlight.passengerCount} passengers ({selectedFlight.connectionCount} connections) · Avg Fare: ${selectedFlight.averageTicketPrice || 1108} · {selectedFlight.aircraftType}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {onAgenticFastTrack && selectedFlight.status !== 'ON_TIME' && (
              <button
                onClick={onAgenticFastTrack}
                title="Agents evaluate policy, rank rebooking options, and bring you directly to Step 5 for 1-click execution"
                className="px-4 py-1.5 text-xs font-bold text-sky-950 bg-sky-100 hover:bg-sky-200 border border-sky-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>⚡ Auto-Pilot to HITL (Platinum Pax)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onNavigate('disruption')}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Step-by-Step Flow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Flight Grid */}
      <section className="space-y-2">
        <FlightList
          flights={flights}
          selectedFlightId={selectedFlightId}
          onSelectFlight={(id) => {
            onSelectFlight(id);
          }}
          selectedHub={selectedHub}
        />
      </section>
    </div>
  );
};
