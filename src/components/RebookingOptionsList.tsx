import React from 'react';
import { RebookingOption } from '../types';
import { Plane, CheckCircle2, Clock, DollarSign, Award, ChevronRight } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface RebookingOptionsListProps {
  options: RebookingOption[];
  selectedOptionId: string;
  onSelectOption: (optionId: string) => void;
  targetCabin?: string;
}

export const RebookingOptionsList: React.FC<RebookingOptionsListProps> = ({
  options,
  selectedOptionId,
  onSelectOption,
  targetCabin = 'Business',
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
            <Plane className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Rebooking Agent: Top 3 Ranked Options
              </h3>
              <Tooltip
                position="bottom"
                align="start"
                content="Ranked dynamically by arrival delta, seat inventory, nonstop routing, cabin guarantee, and airline cost liability"
                iconOnly
              />
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 font-mono">
          Target Cabin: <span className="text-sky-700 font-semibold">{targetCabin}</span>
        </div>
      </div>

      {/* Options List */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {options.slice(0, 3).map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isRank1 = opt.rank === 1;

          return (
            <div
              key={opt.id}
              onClick={() => onSelectOption(opt.id)}
              className={`rounded-xl border transition-all cursor-pointer p-4 relative ${
                isSelected
                  ? 'bg-sky-50/70 border-sky-500 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-6 h-6 rounded-md font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                      isRank1
                        ? 'bg-sky-600 text-white'
                        : opt.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    #{opt.rank}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-slate-900 font-mono">
                        {opt.flightNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-700 font-medium">
                        {opt.airline}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-mono text-sky-700 font-medium">
                        {opt.alliance}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {opt.aircraft} · {opt.stopsDescription}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-sky-800">
                      {opt.rankingScore} <span className="text-slate-400 font-normal">/ 100</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Match Score
                    </div>
                  </div>

                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono font-bold text-emerald-700">
                      $0.00 Pax Cost
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Retail: ${(opt.retailMarketFare || (opt.isPartner ? 3420 : 3150)).toLocaleString()}
                    </div>
                  </div>

                  {/* Radio */}
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'border-sky-600 bg-sky-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>

              {/* Middle Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2.5 border-b border-slate-100 text-xs">
                <div>
                  <div className="text-[11px] text-slate-400">Departure & Arrival</div>
                  <div className="text-slate-800 font-mono font-semibold mt-0.5">
                    {opt.origin} ({opt.departureTime}) → {opt.destination} ({opt.arrivalTime})
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400">Arrival Delta</div>
                  <div className="font-mono font-bold mt-0.5 text-amber-700">
                    +{Math.floor(opt.arrivalDeltaMinutes / 60)}h {opt.arrivalDeltaMinutes % 60}m vs sched
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Airline Recovery Cost</span>
                    <Tooltip
                      content={
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900">Cost & Pricing Breakdown</div>
                          <div className="text-slate-700">Retail Flight Price: ${(opt.retailMarketFare || 3150).toLocaleString()} (Passenger Pays: $0.00)</div>
                          <div className="text-slate-700">Interline Settlement: ${opt.estimatedAirlineCost.interlineProrate}</div>
                          <div className="text-slate-700">Duty of Care Vouchers: ${opt.estimatedAirlineCost.hotelVoucher + opt.estimatedAirlineCost.mealVoucher}</div>
                          <div className="text-emerald-700 font-semibold">Net Airline Cost: ${opt.estimatedAirlineCost.total}</div>
                        </div>
                      }
                      iconOnly
                    />
                  </div>
                  <div className="text-slate-800 font-mono mt-0.5 flex items-center justify-between">
                    <span className="font-bold text-slate-900">${opt.estimatedAirlineCost.total} total</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {opt.estimatedAirlineCost.interlineProrate > 0
                        ? `$${opt.estimatedAirlineCost.interlineProrate} interline`
                        : 'own metal ($0 interline)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ranking Reason & Financial Impact */}
              <div className="pt-2">
                <div className="text-xs bg-slate-50 rounded-lg p-2.5 text-slate-700 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <span className="font-semibold text-slate-900">Why this option: </span>
                    <span>{opt.rankingReason}</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                      Saves ${(opt.estimatedAirlineCost.savingsVsInvoluntaryRefund || 2805).toLocaleString()} vs cash refund
                    </span>
                    <Tooltip
                      content={
                        <div className="space-y-1.5">
                          <div className="font-bold text-slate-900">Operational Pros & Cons</div>
                          <div className="text-emerald-700 font-medium">Pros: {opt.pros.join(', ')}</div>
                          <div className="text-amber-700">Cons: {opt.cons.join(', ')}</div>
                        </div>
                      }
                      iconOnly
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
