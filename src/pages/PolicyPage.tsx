import React from 'react';
import { Flight, PolicyEvaluation, Passenger, ActivePage } from '../types';
import { PolicyCard } from '../components/PolicyCard';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { ArrowRight, ArrowLeft, User } from 'lucide-react';

interface PolicyPageProps {
  flight: Flight;
  policy: PolicyEvaluation;
  selectedPassenger: Passenger | undefined;
  workflowStage: any;
  onNavigate: (page: ActivePage) => void;
}

export const PolicyPage: React.FC<PolicyPageProps> = ({
  flight,
  policy,
  selectedPassenger,
  workflowStage,
  onNavigate,
}) => {
  return (
    <div className="space-y-5">
      {/* Workflow Stepper */}
      <WorkflowStepper
        activePage="policy"
        onNavigate={onNavigate}
        flightNumber={flight.flightNumber}
        isDisrupted={flight.status !== 'ON_TIME'}
        isApproved={workflowStage === 'APPROVED'}
      />

      {/* Target Traveler Context */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            <User className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono text-indigo-700 font-semibold uppercase">
              Policy Agent Evaluation Scope
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              {selectedPassenger
                ? `${selectedPassenger.firstName} ${selectedPassenger.lastName} (PNR: ${selectedPassenger.pnr}) · ${selectedPassenger.loyaltyTier} · ${selectedPassenger.cabinClass} (Fare: $${(selectedPassenger.ticketPrice || 2850).toLocaleString()})`
                : `Flight-Wide Protection: All ${flight.passengerCount} passengers on ${flight.flightNumber} (Total Rev: $${((flight.totalBookedRevenue || 345600) / 1000).toFixed(1)}k)`}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('disruption')}
          className="text-xs font-mono text-sky-700 hover:text-sky-800 underline self-start sm:self-auto cursor-pointer"
        >
          {selectedPassenger ? 'Switch Passenger' : 'Select Specific Passenger'}
        </button>
      </div>

      {/* Policy Card */}
      <PolicyCard policy={policy} flightNumber={flight.flightNumber} />

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <button
          onClick={() => onNavigate('disruption')}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Disruption & Manifest</span>
        </button>

        <button
          onClick={() => onNavigate('rebooking')}
          className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Proceed to Step 4: Rebooking Options</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
