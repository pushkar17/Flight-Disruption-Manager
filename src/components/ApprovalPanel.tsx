import React, { useState } from 'react';
import { RebookingOption, Passenger, Flight } from '../types';
import { CheckCircle2, UserCheck, AlertOctagon } from 'lucide-react';

interface ApprovalPanelProps {
  selectedOption: RebookingOption | undefined;
  selectedPassenger: Passenger | undefined;
  flight: Flight;
  onApproveRebooking: (notes: string) => void;
  onEscalateCase: (reason: string) => void;
  onIssueRefund: () => void;
  onViewNotification?: () => void;
  isApproved: boolean;
  isEscalated: boolean;
  isRefunded: boolean;
  totalPassengersImpacted: number;
}

export const ApprovalPanel: React.FC<ApprovalPanelProps> = ({
  selectedOption,
  selectedPassenger,
  flight,
  onApproveRebooking,
  onEscalateCase,
  onIssueRefund,
  onViewNotification,
  isApproved,
  isEscalated,
  isRefunded,
  totalPassengersImpacted,
}) => {
  const [dispatcherNotes, setDispatcherNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('Requires Supervisor Override for Partner Alliance Interline Proration');

  if (!selectedOption) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-400">
        Please select a rebooking option above to review and approve.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Human Operations Review & Approval
              </h3>
              <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                SIGN-OFF MANDATORY
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Dispatcher: <span className="text-slate-800 font-semibold">OCC-7814</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Approved State Banner */}
        {isApproved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-emerald-900">
                  Rebooking Approved & E-Tickets Re-Issued
                </div>
                <div className="text-xs text-emerald-800 mt-0.5">
                  Confirmed on {selectedOption.airline} {selectedOption.flightNumber}. PNR updated. Passenger notified.
                </div>
              </div>
            </div>

            {onViewNotification && (
              <button
                onClick={onViewNotification}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
              >
                View Boarding Pass & Vouchers
              </button>
            )}
          </div>
        )}

        {/* Escalated State Banner */}
        {isEscalated && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-purple-900 flex items-start gap-2.5">
            <AlertOctagon className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-purple-900">
                Case Escalated to Duty Manager
              </div>
              <div className="text-[11px] text-purple-800 mt-0.5">
                Flagged for manual supervisor exception handling.
              </div>
            </div>
          </div>
        )}

        {/* Execution Summary & Financial Reconciliation */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2.5 border-b border-slate-200/80">
            <div>
              <div className="text-slate-500 text-[11px]">Target Passenger(s)</div>
              <div className="text-slate-900 font-semibold mt-0.5">
                {selectedPassenger
                  ? `${selectedPassenger.firstName} ${selectedPassenger.lastName} (PNR: ${selectedPassenger.pnr}) · ${selectedPassenger.cabinClass}`
                  : `Bulk: ${totalPassengersImpacted} passengers on ${flight.flightNumber}`}
              </div>
            </div>

            <div>
              <div className="text-slate-500 text-[11px]">Proposed Route</div>
              <div className="text-sky-800 font-mono font-bold mt-0.5">
                {selectedOption.airline} {selectedOption.flightNumber} ({selectedOption.stopsDescription})
              </div>
              <div className="text-slate-600 text-[11px] font-mono">
                Dep: {selectedOption.departureTime} · Arr: {selectedOption.arrivalTime}
              </div>
            </div>
          </div>

          {/* Pricing Reconciliation Row */}
          <div>
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Financial Settlement Ledger</span>
              <span className="text-emerald-700 font-semibold font-mono">Passenger Out-of-Pocket: $0.00</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-slate-400 text-[10px]">Original Ticket</div>
                <div className="font-bold text-slate-800">
                  ${(selectedPassenger?.ticketPrice || 2850).toLocaleString()}.00
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-slate-400 text-[10px]">New Retail Value</div>
                <div className="font-bold text-slate-800">
                  ${(selectedOption.retailMarketFare || 3150).toLocaleString()}.00
                </div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-slate-400 text-[10px]">Change Penalty</div>
                <div className="font-bold text-emerald-700">$0.00 (Waived)</div>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <div className="text-slate-400 text-[10px]">Carrier Net Cost</div>
                <div className="font-bold text-slate-900">${selectedOption.estimatedAirlineCost.total}.00</div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Notes Field */}
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Dispatcher Notes & Waiver Endorsement
          </label>
          <input
            type="text"
            value={dispatcherNotes}
            onChange={(e) => setDispatcherNotes(e.target.value)}
            placeholder="e.g. Involuntary rebooking approved under Rule 240. Seat assignments confirmed."
            disabled={isApproved || isEscalated || isRefunded}
            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-sky-500 transition-colors disabled:opacity-60"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEscalateCase(escalationReason)}
              disabled={isApproved || isEscalated || isRefunded}
              className="px-3 py-1.5 text-xs font-medium text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Escalate to Duty Manager
            </button>

            <button
              onClick={onIssueRefund}
              disabled={isApproved || isEscalated || isRefunded}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              Issue Full Refund
            </button>
          </div>

          <button
            onClick={() => onApproveRebooking(dispatcherNotes)}
            disabled={isApproved || isEscalated || isRefunded}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 fill-current text-white" />
            <span>
              {isApproved
                ? 'Rebooking Approved & Executed'
                : `Approve Rebooking on ${selectedOption.flightNumber}`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
