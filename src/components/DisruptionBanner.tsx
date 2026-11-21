import React from 'react';
import { DisruptionEvent, Flight } from '../types';
import { AlertOctagon, AlertTriangle, Users, ArrowUpRight, Clock, ShieldCheck, DollarSign } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface DisruptionBannerProps {
  flight: Flight;
  disruption: DisruptionEvent;
  workflowStage: 'DETECTED' | 'EVALUATING_POLICY' | 'OPTIONS_RANKED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'ESCALATED' | 'REFUNDED';
}

export const DisruptionBanner: React.FC<DisruptionBannerProps> = ({
  flight,
  disruption,
  workflowStage,
}) => {
  const isCritical = disruption.severity === 'CRITICAL';
  const totalCost = disruption.financialExposure?.totalExposure || flight.estimatedDisruptionCost || (isCritical ? 251880 : 52400);
  const dutyOfCare = disruption.financialExposure?.dutyOfCareCost || Math.round(disruption.affectedPassengerCount * (disruption.estimatedDelayMinutes >= 360 ? 265 : 45));

  const stages = [
    { key: 'DETECTED', label: '1. Detection' },
    { key: 'EVALUATING_POLICY', label: '2. Policy' },
    { key: 'OPTIONS_RANKED', label: '3. Rebooking' },
    { key: 'AWAITING_APPROVAL', label: '4. Human Approval' },
    { key: 'APPROVED', label: '5. Dispatched' },
  ];

  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'DETECTED': return 0;
      case 'EVALUATING_POLICY': return 1;
      case 'OPTIONS_RANKED': return 2;
      case 'AWAITING_APPROVAL': return 3;
      case 'APPROVED': return 4;
      case 'ESCALATED': return 3;
      case 'REFUNDED': return 4;
      default: return 0;
    }
  };

  const currentIdx = getStageIndex(workflowStage);

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
        isCritical
          ? 'bg-rose-50/60 border-rose-200'
          : 'bg-amber-50/60 border-amber-200'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
              isCritical
                ? 'bg-rose-100 border-rose-300 text-rose-700'
                : 'bg-amber-100 border-amber-300 text-amber-700'
            }`}
          >
            {isCritical ? (
              <AlertOctagon className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span
                className={`font-semibold uppercase ${
                  isCritical ? 'text-rose-700' : 'text-amber-700'
                }`}
              >
                {disruption.severity} · {disruption.type.replace('_', ' ')}
              </span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600">{disruption.atcOrNoticeCode || 'NOTAM-OPS'}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-500">{disruption.triggerTimestamp}</span>
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-base font-bold text-slate-900">
                {flight.flightNumber} ({flight.origin.code} → {flight.destination.code}): {disruption.rootCause}
              </h2>
              {/* Tooltip for verbose telemetry text instead of cluttering page */}
              <Tooltip
                iconOnly
                content={
                  <div className="space-y-1">
                    <div className="font-bold text-slate-900">ACARS & Incident Log</div>
                    <div className="text-slate-700">{disruption.description}</div>
                  </div>
                }
              />
            </div>
          </div>
        </div>

        {/* Status Tag */}
        <div className="shrink-0 flex items-center lg:flex-col lg:items-end gap-1.5">
          <div
            className={`px-2.5 py-0.5 text-xs font-mono font-semibold rounded border ${
              workflowStage === 'APPROVED'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : workflowStage === 'ESCALATED'
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}
          >
            STATUS: {workflowStage.replace('_', ' ')}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Case: {disruption.id}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Impacted Pax</span>
            </span>
            <Tooltip content="Total confirmed passengers requiring recovery protection" iconOnly />
          </div>
          <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-1">
            {disruption.affectedPassengerCount}{' '}
            <span className="text-xs font-normal text-slate-400">
              / {flight.passengerCount}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              <span>Misconnect Risk</span>
            </span>
            <Tooltip content="Passengers whose onward connecting flights violate Minimum Connection Time (MCT)" iconOnly />
          </div>
          <div className="text-lg font-mono font-bold text-rose-600 tabular-nums mt-1">
            {disruption.connectionRiskCount}{' '}
            <span className="text-xs font-normal text-slate-400">critical</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Delay Duration</span>
            </span>
            <Tooltip content="Estimated operational delay or cancellation rescheduling window" iconOnly />
          </div>
          <div className="text-lg font-mono font-bold text-amber-700 tabular-nums mt-1">
            {disruption.estimatedDelayMinutes >= 720
              ? 'Overnight'
              : `+${disruption.estimatedDelayMinutes}m`}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Crew Duty Limit</span>
            </span>
            <Tooltip content="FAA/EASA Part 117 flight crew maximum duty limits countdown" iconOnly />
          </div>
          <div className="text-sm font-mono font-bold mt-1.5">
            {disruption.crewDutyExceeded ? (
              <span className="text-rose-600">Timeout Reached</span>
            ) : (
              <span className="text-emerald-700">{flight.crewDutyRemainingMinutes}m Reserve</span>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3 col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-rose-600" />
              <span>IRROPS Exposure</span>
            </span>
            <Tooltip
              content={`Financial Liability Breakdown: Duty of Care hotel & meal vouchers: $${dutyOfCare.toLocaleString()}. Delay operating penalty: $${(disruption.financialExposure?.delayOperationalCost || 28800).toLocaleString()}. Total flight exposure: $${totalCost.toLocaleString()}.`}
              iconOnly
            />
          </div>
          <div className="text-lg font-mono font-bold text-rose-700 tabular-nums mt-1">
            ${(totalCost / 1000).toFixed(1)}k
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Hotel + Meals + Delay Ops
          </div>
        </div>
      </div>

      {/* Recovery Pipeline */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between overflow-x-auto gap-2">
        {stages.map((stg, i) => {
          const isDone = i < currentIdx || workflowStage === 'APPROVED';
          const isCurrent = i === currentIdx && workflowStage !== 'APPROVED';
          return (
            <div
              key={stg.key}
              className={`flex items-center gap-1.5 text-xs font-mono whitespace-nowrap px-2 py-0.5 rounded ${
                isCurrent
                  ? 'bg-sky-100 text-sky-800 font-semibold'
                  : isDone
                  ? 'text-emerald-700 font-medium'
                  : 'text-slate-400'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent
                    ? 'bg-sky-600 animate-pulse'
                    : isDone
                    ? 'bg-emerald-600'
                    : 'bg-slate-300'
                }`}
              />
              <span>{stg.label}</span>
              {i < stages.length - 1 && (
                <span className="text-slate-300 ml-1">→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
