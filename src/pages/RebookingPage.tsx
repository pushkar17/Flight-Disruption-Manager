import React from 'react';
import { Flight, RebookingOption, Passenger, ActivePage } from '../types';
import { RebookingOptionsList } from '../components/RebookingOptionsList';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface RebookingPageProps {
  flight: Flight;
  options: RebookingOption[];
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  selectedPassenger: Passenger | undefined;
  workflowStage: any;
  onNavigate: (page: ActivePage) => void;
}

export const RebookingPage: React.FC<RebookingPageProps> = ({
  flight,
  options,
  selectedOptionId,
  onSelectOption,
  selectedPassenger,
  workflowStage,
  onNavigate,
}) => {
  const chosenOption = options.find((o) => o.id === selectedOptionId) || options[0];

  return (
    <div className="space-y-5">
      {/* Workflow Stepper */}
      <WorkflowStepper
        activePage="rebooking"
        onNavigate={onNavigate}
        flightNumber={flight.flightNumber}
        isDisrupted={flight.status !== 'ON_TIME'}
        isApproved={workflowStage === 'APPROVED'}
      />

      {/* Selected Option Callout */}
      {chosenOption && (
        <div className="bg-sky-50/70 border border-sky-300 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-bold font-mono text-sm flex items-center justify-center shrink-0">
              #{chosenOption.rank}
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-sky-900 font-bold">
                  SELECTED: {chosenOption.flightNumber} ({chosenOption.airline})
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-slate-700">{chosenOption.stopsDescription}</span>
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Departs {chosenOption.departureTime} · Arrives {chosenOption.arrivalTime} (+{Math.floor(chosenOption.arrivalDeltaMinutes / 60)}h {chosenOption.arrivalDeltaMinutes % 60}m)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-right">
            <div>
              <div className="text-xs font-mono font-bold text-sky-800">
                Score: {chosenOption.rankingScore}/100
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Carrier Cost: <strong className="text-slate-800">${chosenOption.estimatedAirlineCost.total}</strong> · Pax Cost: <strong className="text-emerald-700">$0.00</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranked Options List */}
      <RebookingOptionsList
        options={options}
        selectedOptionId={selectedOptionId}
        onSelectOption={onSelectOption}
        targetCabin={selectedPassenger?.cabinClass || 'Business'}
      />

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <button
          onClick={() => onNavigate('policy')}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Policy</span>
        </button>

        <button
          onClick={() => onNavigate('approval')}
          className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Proceed to Step 5: Human Approval</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
