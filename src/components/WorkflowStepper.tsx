import React from 'react';
import { ActivePage } from '../types';
import { ChevronRight, Activity } from 'lucide-react';

interface WorkflowStepperProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  flightNumber: string;
  isDisrupted: boolean;
  isApproved: boolean;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  activePage,
  onNavigate,
  flightNumber,
  isDisrupted,
  isApproved,
}) => {
  const steps: { page: ActivePage; number: string; title: string; desc: string }[] = [
    { page: 'flights', number: '01', title: 'View Flight', desc: 'Network telemetry' },
    { page: 'disruption', number: '02', title: 'Detect Disruption', desc: 'Impact & manifest' },
    { page: 'policy', number: '03', title: 'Check Policy', desc: 'Rules & waivers' },
    { page: 'rebooking', number: '04', title: 'Rebooking Options', desc: 'Ranked recovery' },
    { page: 'approval', number: '05', title: 'Human Approval', desc: 'Dispatch & sign-off' },
  ];

  const getStepStatus = (stepPage: ActivePage) => {
    if (activePage === stepPage) return 'current';
    if (isApproved && stepPage !== 'flights') return 'completed';
    
    const pageOrder: ActivePage[] = ['flights', 'disruption', 'policy', 'rebooking', 'approval'];
    const currentIdx = pageOrder.indexOf(activePage);
    const stepIdx = pageOrder.indexOf(stepPage);
    
    if (stepIdx < currentIdx) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 mb-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-sky-700 font-semibold uppercase tracking-wider">
            Active Journey
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-mono text-slate-800 font-semibold">
            Flight {flightNumber}
          </span>
          {isDisrupted && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-mono font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                IRROP Recovery Active
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => onNavigate('agents')}
          className={`text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
            activePage === 'agents'
              ? 'text-sky-700 font-semibold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-sky-600" />
          <span>View 5 Collaborating Agents</span>
        </button>
      </div>

      <nav aria-label="Recovery Progress" className="pt-3 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.page);
            const isCurrent = status === 'current';
            const isCompleted = status === 'completed';

            return (
              <React.Fragment key={step.page}>
                <button
                  onClick={() => onNavigate(step.page)}
                  className={`flex items-start gap-2.5 text-left py-1.5 px-2 rounded-lg transition-colors group cursor-pointer ${
                    isCurrent
                      ? 'bg-sky-50/80 text-slate-900'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isCurrent
                        ? 'bg-sky-600 text-white font-bold'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isCompleted ? '✓' : step.number}
                  </div>

                  <div>
                    <div
                      className={`text-xs font-semibold whitespace-nowrap transition-colors ${
                        isCurrent
                          ? 'text-sky-900'
                          : isCompleted
                          ? 'text-slate-800'
                          : 'text-slate-600 group-hover:text-slate-900'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-[11px] text-slate-400 whitespace-nowrap">
                      {step.desc}
                    </div>
                  </div>
                </button>

                {idx < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
