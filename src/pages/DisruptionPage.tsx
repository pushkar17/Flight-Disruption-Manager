import React from 'react';
import { Flight, DisruptionEvent, Passenger, ActivePage } from '../types';
import { DisruptionBanner } from '../components/DisruptionBanner';
import { PassengerManifest } from '../components/PassengerManifest';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { ArrowRight, ArrowLeft, Zap } from 'lucide-react';

interface DisruptionPageProps {
  flight: Flight;
  disruption: DisruptionEvent;
  workflowStage: any;
  selectedPassengerId: string | null;
  onSelectPassenger: (id: string | null) => void;
  onNavigate: (page: ActivePage) => void;
  onOpenSimulationModal: () => void;
}

export const DisruptionPage: React.FC<DisruptionPageProps> = ({
  flight,
  disruption,
  workflowStage,
  selectedPassengerId,
  onSelectPassenger,
  onNavigate,
  onOpenSimulationModal,
}) => {
  return (
    <div className="space-y-5">
      {/* Workflow Stepper */}
      <WorkflowStepper
        activePage="disruption"
        onNavigate={onNavigate}
        flightNumber={flight.flightNumber}
        isDisrupted={flight.status !== 'ON_TIME'}
        isApproved={workflowStage === 'APPROVED'}
      />

      {/* Disruption Alert Banner */}
      <DisruptionBanner
        flight={flight}
        disruption={disruption}
        workflowStage={workflowStage}
      />

      {/* Passenger Manifest Panel */}
      <PassengerManifest
        passengers={flight.passengers}
        selectedPassengerId={selectedPassengerId}
        onSelectPassenger={onSelectPassenger}
        flightNumber={flight.flightNumber}
      />

      {/* Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <button
          onClick={() => onNavigate('flights')}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Flights</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSimulationModal}
            className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 text-sky-600" />
            <span>Simulate Incident</span>
          </button>

          <button
            onClick={() => onNavigate('policy')}
            className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <span>Proceed to Step 3: Check Policy</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
