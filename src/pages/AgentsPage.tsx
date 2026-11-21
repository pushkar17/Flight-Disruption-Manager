import React from 'react';
import { AgentActivity, ActivePage, Flight } from '../types';
import { AgentActivityStream } from '../components/AgentActivityStream';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { ArrowLeft, Cpu, Zap } from 'lucide-react';

interface AgentsPageProps {
  flight: Flight;
  activities: AgentActivity[];
  workflowStage: any;
  onNavigate: (page: ActivePage) => void;
  onOpenSimulationModal: () => void;
}

export const AgentsPage: React.FC<AgentsPageProps> = ({
  flight,
  activities,
  workflowStage,
  onNavigate,
  onOpenSimulationModal,
}) => {
  return (
    <div className="space-y-5">
      {/* Workflow Stepper */}
      <WorkflowStepper
        activePage="agents"
        onNavigate={onNavigate}
        flightNumber={flight.flightNumber}
        isDisrupted={flight.status !== 'ON_TIME'}
        isApproved={workflowStage === 'APPROVED'}
      />

      {/* Agents Architecture Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Autonomous Agent Collaboration Architecture
              </h2>
              <p className="text-xs text-slate-500">
                5 specialized agents communicating through shared recovery case state
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSimulationModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Simulate Incident Trigger</span>
          </button>
        </div>

        {/* 5 Agent Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-3">
          <div className="bg-slate-50 border border-amber-200 rounded-lg p-2.5">
            <div className="text-xs font-mono font-bold text-amber-800">
              01. Detection Agent
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Monitors telemetry & ACARS; flags misconnect risks.
            </div>
          </div>

          <div className="bg-slate-50 border border-indigo-200 rounded-lg p-2.5">
            <div className="text-xs font-mono font-bold text-indigo-800">
              02. Policy Agent
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Evaluates Rule 240, 14 CFR 259, waiver codes & duty of care.
            </div>
          </div>

          <div className="bg-slate-50 border border-sky-200 rounded-lg p-2.5">
            <div className="text-xs font-mono font-bold text-sky-800">
              03. Rebooking Agent
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Multi-attribute utility optimization & top 3 ranking.
            </div>
          </div>

          <div className="bg-slate-50 border border-emerald-200 rounded-lg p-2.5">
            <div className="text-xs font-mono font-bold text-emerald-800">
              04. Validation Agent
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Verifies MCT, coupon status, SSR carryover & baggage.
            </div>
          </div>

          <div className="bg-slate-50 border border-purple-200 rounded-lg p-2.5">
            <div className="text-xs font-mono font-bold text-purple-800">
              05. Notification Agent
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Generates boarding pass, SMS, email & QR vouchers.
            </div>
          </div>
        </div>
      </div>

      {/* Main Activity Feed */}
      <AgentActivityStream activities={activities} />

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={() => onNavigate('approval')}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Human Approval</span>
        </button>

        <button
          onClick={() => onNavigate('flights')}
          className="px-4 py-2 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <span>Return to Flights Overview →</span>
        </button>
      </div>
    </div>
  );
};
