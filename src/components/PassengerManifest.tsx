import React from 'react';
import { Passenger } from '../types';
import { Users, User, PlaneTakeoff, HeartHandshake } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface PassengerManifestProps {
  passengers: Passenger[];
  selectedPassengerId: string | null;
  onSelectPassenger: (passengerId: string | null) => void;
  flightNumber: string;
}

export const PassengerManifest: React.FC<PassengerManifestProps> = ({
  passengers,
  selectedPassengerId,
  onSelectPassenger,
  flightNumber,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs">
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Passenger Manifest & Connections
          </h3>
          <Tooltip
            position="bottom"
            align="start"
            content={
              <div className="space-y-1">
                <div className="font-bold text-slate-900">Passenger Manifest Details</div>
                <div className="text-slate-600">
                  Select any passenger to inspect their PNR, loyalty tier, onward connecting flights, and personalized rebooking options. Click "All" to manage flight-wide recovery.
                </div>
              </div>
            }
            iconOnly
          />
        </div>

        {/* Batch / Single Toggle */}
        <button
          onClick={() => onSelectPassenger(null)}
          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
            selectedPassengerId === null
              ? 'bg-sky-50 text-sky-800 border-sky-300 font-semibold'
              : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
        >
          All ({passengers.length || '312'} Pax)
        </button>
      </div>

      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {passengers.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            All 312 passengers managed under flight-wide bulk recovery policy.
          </div>
        ) : (
          passengers.map((pax) => {
            const isSelected = selectedPassengerId === pax.id;
            const hasConnectionRisk = pax.onwardConnection?.isAtRisk;

            return (
              <div
                key={pax.id}
                onClick={() => onSelectPassenger(pax.id)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-sky-50/80 border-l-3 border-sky-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        pax.loyaltyTier === 'Executive Platinum'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : pax.loyaltyTier === 'Platinum'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">
                          {pax.firstName} {pax.lastName}
                        </span>
                        <span className="text-[11px] font-mono text-sky-700 font-medium">
                          {pax.pnr}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[11px] text-slate-500">
                          Seat {pax.seat}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className={pax.loyaltyTier === 'Executive Platinum' ? 'text-amber-800 font-medium' : ''}>
                          {pax.loyaltyTier}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-medium text-slate-700">
                          {pax.cabinClass} ({pax.fareClass})
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded text-[11px]">
                          ${(pax.ticketPrice || (pax.cabinClass === 'First' ? 4650 : pax.cabinClass === 'Business' ? 2850 : 680)).toLocaleString()} fare
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>{pax.bagsChecked} bags</span>

                        {/* SSR compact icon with Tooltip */}
                        {pax.specialNeeds && pax.specialNeeds.length > 0 && (
                          <>
                            <span className="text-slate-300">·</span>
                            <Tooltip content={`Special Service Request: ${pax.specialNeeds.join(', ')}`}>
                              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                <HeartHandshake className="w-3 h-3" />
                                <span>SSR ({pax.specialNeeds.length})</span>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </div>

                      {/* Onward Connection Warning with Tooltip */}
                      {pax.onwardConnection && (
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono">
                          <PlaneTakeoff className="w-3 h-3 text-slate-400 shrink-0" />
                          <Tooltip
                            content={`Connecting on ${pax.onwardConnection.airline} ${pax.onwardConnection.flightNumber} to ${pax.onwardConnection.destination} departing at ${pax.onwardConnection.scheduledDeparture}. Connection time: ${pax.onwardConnection.connectionTimeMinutes}m (MCT: ${pax.onwardConnection.minimumConnectionTimeMinutes}m).`}
                          >
                            <span className={hasConnectionRisk ? 'text-rose-700 font-semibold' : 'text-slate-600'}>
                              {pax.onwardConnection.flightNumber} → {pax.onwardConnection.destination}
                            </span>
                          </Tooltip>
                          {hasConnectionRisk && (
                            <span className="text-rose-700 font-bold ml-1 text-[10px] bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                              MISCONNECT RISK
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status & Pricing */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-mono font-semibold ${
                        pax.bookingStatus === 'Rebooked'
                          ? 'text-emerald-700'
                          : pax.bookingStatus === 'Escalated'
                          ? 'text-purple-700'
                          : pax.bookingStatus === 'Refunded'
                          ? 'text-slate-500'
                          : 'text-rose-700'
                      }`}
                    >
                      {pax.bookingStatus === 'Rebooked'
                        ? `REBOOKED (${pax.rebookedFlightNumber || 'UA901'})`
                        : pax.bookingStatus.toUpperCase()}
                    </span>
                    <Tooltip content={`Passenger Ticket: $${(pax.ticketPrice || 2850).toLocaleString()}. Rebooking Cost to Passenger: $0.00. Change Fee ($200) waived. Duty of Care allowance: $265.00.`}>
                      <div className="text-[11px] font-mono text-emerald-700 font-semibold mt-0.5">
                        $0.00 fee · $200 saved
                      </div>
                    </Tooltip>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {pax.phone}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
