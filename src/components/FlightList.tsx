import React, { useState } from 'react';
import { Flight } from '../types';
import { AlertTriangle, CheckCircle2, Clock, Search, ChevronRight } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface FlightListProps {
  flights: Flight[];
  selectedFlightId: string | null;
  onSelectFlight: (flightId: string) => void;
  selectedHub: string;
}

export const FlightList: React.FC<FlightListProps> = ({
  flights,
  selectedFlightId,
  onSelectFlight,
  selectedHub,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'disrupted' | 'ontime'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFlights = flights.filter((flight) => {
    if (selectedHub !== 'ALL' && flight.origin.code !== selectedHub && flight.destination.code !== selectedHub) {
      return false;
    }

    if (filterTab === 'disrupted') {
      if (flight.status === 'ON_TIME') return false;
    } else if (filterTab === 'ontime') {
      if (flight.status !== 'ON_TIME') return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        flight.flightNumber.toLowerCase().includes(q) ||
        flight.origin.code.toLowerCase().includes(q) ||
        flight.destination.code.toLowerCase().includes(q) ||
        flight.airline.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Table Header Controls */}
      <div className="p-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-slate-200">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({flights.length})
          </button>
          <button
            onClick={() => setFilterTab('disrupted')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              filterTab === 'disrupted'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
            Disrupted ({flights.filter((f) => f.status !== 'ON_TIME').length})
          </button>
          <button
            onClick={() => setFilterTab('ontime')}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
              filterTab === 'ontime'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            On Schedule ({flights.filter((f) => f.status === 'ON_TIME').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search flight or airport..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Flight Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50">
              <th className="py-2.5 px-4">Flight</th>
              <th className="py-2.5 px-4">Route</th>
              <th className="py-2.5 px-4">Times</th>
              <th className="py-2.5 px-4">Aircraft</th>
              <th className="py-2.5 px-4 text-right">Load</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-right">Rev / Exposure</th>
              <th className="py-2.5 px-4 text-right">Connections</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFlights.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  No flights match criteria.
                </td>
              </tr>
            ) : (
              filteredFlights.map((flight) => {
                const isSelected = selectedFlightId === flight.id;
                const isDisrupted = flight.status !== 'ON_TIME';

                return (
                  <tr
                    key={flight.id}
                    onClick={() => onSelectFlight(flight.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-sky-50/80 hover:bg-sky-100/60'
                        : isDisrupted
                        ? 'bg-rose-50/30 hover:bg-rose-50/60'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Flight & Airline */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            flight.status === 'CANCELLED'
                              ? 'bg-rose-500'
                              : flight.status === 'DELAYED'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <div>
                          <div className="font-semibold text-slate-900 font-mono">
                            {flight.flightNumber}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {flight.airline}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Route with Tooltip */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <Tooltip
                        content={`${flight.origin.name} (Gate ${flight.origin.gate || 'TBD'}) to ${flight.destination.name} (Gate ${flight.destination.gate || 'TBD'})`}
                      >
                        <div className="flex items-center gap-1.5 text-slate-800 font-mono font-medium">
                          <span>{flight.origin.code}</span>
                          <span className="text-slate-400">→</span>
                          <span>{flight.destination.code}</span>
                        </div>
                      </Tooltip>
                      <div className="text-[11px] text-slate-400">
                        Gate {flight.origin.gate || 'TBD'} · {flight.destination.gate || 'TBD'}
                      </div>
                    </td>

                    {/* Times */}
                    <td className="py-2.5 px-4 whitespace-nowrap font-mono tabular-nums">
                      <div className="text-slate-700">
                        {flight.scheduledDeparture} – {flight.scheduledArrival}
                      </div>
                      {flight.status === 'CANCELLED' ? (
                        <div className="text-[11px] text-rose-600 font-medium">
                          Cancelled
                        </div>
                      ) : flight.status === 'DELAYED' ? (
                        <div className="text-[11px] text-amber-700 font-medium">
                          Est: {flight.estimatedDeparture} (+{flight.delayMinutes}m)
                        </div>
                      ) : (
                        <div className="text-[11px] text-emerald-600 font-medium">
                          On Time
                        </div>
                      )}
                    </td>

                    {/* Aircraft */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <Tooltip content={`Tail Number: ${flight.tailNumber}`}>
                        <div className="text-slate-700 font-mono text-[11px]">
                          {flight.aircraftType}
                        </div>
                      </Tooltip>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {flight.tailNumber}
                      </div>
                    </td>

                    {/* Load */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-right font-mono tabular-nums">
                      <div className="text-slate-800">
                        {flight.passengerCount} <span className="text-slate-400">/</span> {flight.capacity}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {Math.round((flight.passengerCount / flight.capacity) * 100)}%
                      </div>
                    </td>

                    {/* Status with Tooltip */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {flight.status === 'CANCELLED' ? (
                        <Tooltip content={flight.weatherCondition || 'Flight Cancelled by Operations'}>
                          <div className="font-semibold text-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>CANCELLED</span>
                          </div>
                        </Tooltip>
                      ) : flight.status === 'DELAYED' ? (
                        <Tooltip content={flight.weatherCondition || 'Weather / ATC Hold'}>
                          <div className="font-semibold text-amber-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>DELAYED (+{flight.delayMinutes}m)</span>
                          </div>
                        </Tooltip>
                      ) : (
                        <div className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ON TIME</span>
                        </div>
                      )}
                    </td>

                    {/* Rev / Exposure with Tooltip */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-right font-mono tabular-nums">
                      <Tooltip
                        content={`Manifest Booked Rev: $${(flight.totalBookedRevenue || flight.passengerCount * 1100).toLocaleString()} (Avg fare: $${flight.averageTicketPrice || 1100}). Operational Exposure: $${(flight.estimatedDisruptionCost || (flight.status === 'CANCELLED' ? 86400 : 42000)).toLocaleString()} (Duty of care vouchers, crew overtime, delay handling).`}
                      >
                        <div>
                          <div className="text-slate-800 font-semibold text-xs">
                            ${((flight.totalBookedRevenue || flight.passengerCount * 1100) / 1000).toFixed(0)}k rev
                          </div>
                          {flight.status !== 'ON_TIME' ? (
                            <div className="text-[11px] text-rose-600 font-bold">
                              -${((flight.estimatedDisruptionCost || (flight.status === 'CANCELLED' ? 86400 : 42000)) / 1000).toFixed(1)}k cost
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-400 font-medium">
                              $0 exposure
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    </td>

                    {/* Connections */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-right font-mono tabular-nums">
                      {flight.connectionCount > 0 ? (
                        <span
                          className={
                            flight.status !== 'ON_TIME'
                              ? 'text-rose-600 font-bold'
                              : 'text-slate-600'
                          }
                        >
                          {flight.status !== 'ON_TIME'
                            ? `${Math.min(flight.connectionCount, 42)} at risk`
                            : `${flight.connectionCount} onward`}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFlight(flight.id);
                        }}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ml-auto cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white font-semibold'
                            : isDisrupted
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{isDisrupted ? 'Resolve' : 'View'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
