import React, { useState } from 'react';
import { Flight, RebookingOption, Passenger, SimulatedNotification, PolicyEvaluation, ActivePage } from '../types';
import { ApprovalPanel } from '../components/ApprovalPanel';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { AgentVoiceBriefing } from '../components/AgentVoiceBriefing';
import { ArrowLeft, CheckCircle2, ShieldCheck, Plane, Utensils, Bed } from 'lucide-react';

interface ApprovalPageProps {
  flight: Flight;
  selectedOption: RebookingOption | undefined;
  selectedPassenger: Passenger | undefined;
  policy?: PolicyEvaluation;
  simulatedNotification: SimulatedNotification | undefined;
  workflowStage: any;
  onApproveRebooking: (notes: string) => void;
  onEscalateCase: (reason: string) => void;
  onIssueRefund: () => void;
  onViewNotificationModal: () => void;
  onNavigate: (page: ActivePage) => void;
  totalPassengersImpacted: number;
}

export const ApprovalPage: React.FC<ApprovalPageProps> = ({
  flight,
  selectedOption,
  selectedPassenger,
  policy,
  simulatedNotification,
  workflowStage,
  onApproveRebooking,
  onEscalateCase,
  onIssueRefund,
  onViewNotificationModal,
  onNavigate,
  totalPassengersImpacted,
}) => {
  const [activeCredentialTab, setActiveCredentialTab] = useState<'pass' | 'sms' | 'email'>('pass');
  const isApproved = workflowStage === 'APPROVED';

  return (
    <div className="space-y-5">
      {/* Workflow Stepper */}
      <WorkflowStepper
        activePage="approval"
        onNavigate={onNavigate}
        flightNumber={flight.flightNumber}
        isDisrupted={flight.status !== 'ON_TIME'}
        isApproved={isApproved}
      />

      {/* Validation Verification Callout */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono text-emerald-800 font-semibold uppercase">
              Validation Agent Check: PASSED
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              MCT verified · Baggage manifest transferred · SSR preserved · Open ticket coupons ready for exchange
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigate('agents')}
          className="text-xs font-mono text-sky-700 hover:text-sky-800 underline self-start sm:self-auto cursor-pointer"
        >
          Inspect Agent Logs
        </button>
      </div>

      {/* Autonomous Agent Decision Briefing Card */}
      {selectedPassenger && selectedOption && (
        <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50/50 border border-sky-300 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-sky-600 text-white tracking-wider">
                  Autonomous Multi-Agent Synthesis
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Target: {selectedPassenger.firstName} {selectedPassenger.lastName} ({selectedPassenger.loyaltyTier})
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Ready for 1-Click Rebooking: {selectedOption.airline} {selectedOption.flightNumber} ({selectedOption.stopsDescription})
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Autonomous agents detected the disruption on {flight.flightNumber}, evaluated tariff Rule 240, locked a guaranteed {selectedPassenger.cabinClass} flat-bed seat on {selectedOption.flightNumber}, and pre-validated the onward international connection to {selectedPassenger.onwardConnection?.destination || 'destination'}.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                  Original Ticket: <strong className="text-slate-900">${(selectedPassenger.ticketPrice || 2850).toLocaleString()}</strong>
                </span>
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700">
                  New Retail Fare: <strong className="text-slate-900">${(selectedOption.retailMarketFare || 3150).toLocaleString()}</strong>
                </span>
                <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-bold">
                  Pax Fee: $0.00 (Waived)
                </span>
                <span className="bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-sky-800 font-bold">
                  Airline Cost: ${selectedOption.estimatedAirlineCost.total}
                </span>
              </div>
            </div>

            {!isApproved && (
              <div className="shrink-0 flex flex-col items-start lg:items-end gap-1.5">
                <button
                  onClick={() => onApproveRebooking(`1-Click Agentic Approval for ${selectedPassenger.loyaltyTier} flyer ${selectedPassenger.firstName} ${selectedPassenger.lastName}`)}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-all shadow-md shadow-sky-600/20 flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-4 h-4 fill-current text-white" />
                  <span>⚡ 1-Click Approve Rebooking</span>
                </button>
                <span className="text-[11px] font-mono text-slate-400">
                  Human-in-the-Loop Commit
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voice Narration Audio Controller */}
      {selectedPassenger && selectedOption && policy && (
        <AgentVoiceBriefing
          flight={flight}
          passenger={selectedPassenger}
          option={selectedOption}
          policy={policy}
        />
      )}

      {/* Approval Panel */}
      <ApprovalPanel
        selectedOption={selectedOption}
        selectedPassenger={selectedPassenger}
        flight={flight}
        onApproveRebooking={onApproveRebooking}
        onEscalateCase={onEscalateCase}
        onIssueRefund={onIssueRefund}
        onViewNotification={onViewNotificationModal}
        isApproved={isApproved}
        isEscalated={workflowStage === 'ESCALATED'}
        isRefunded={workflowStage === 'REFUNDED'}
        totalPassengersImpacted={totalPassengersImpacted}
      />

      {/* Embedded Credentials when Approved */}
      {isApproved && simulatedNotification && selectedOption && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Dispatched Credentials & Boarding Pass
              </h3>
            </div>

            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setActiveCredentialTab('pass')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  activeCredentialTab === 'pass'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Boarding Pass
              </button>
              <button
                onClick={() => setActiveCredentialTab('sms')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  activeCredentialTab === 'sms'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                SMS
              </button>
              <button
                onClick={() => setActiveCredentialTab('email')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  activeCredentialTab === 'email'
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Email
              </button>
            </div>
          </div>

          <div className="p-5">
            {activeCredentialTab === 'pass' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden max-w-lg mx-auto shadow-sm">
                  <div className="bg-sky-600 px-4 py-2 text-white flex items-center justify-between font-mono text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <Plane className="w-4 h-4" />
                      <span>{selectedOption.airline.toUpperCase()} BOARDING PASS</span>
                    </div>
                    <span>{selectedOption.flightNumber}</span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <div className="text-[11px] text-slate-400 font-mono">PASSENGER</div>
                        <div className="text-base font-bold text-slate-900 uppercase">
                          {simulatedNotification.recipientName}
                        </div>
                        <div className="text-xs text-sky-700 font-mono font-semibold">
                          {selectedPassenger ? selectedPassenger.loyaltyTier : 'Priority Customer'}
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-[11px] text-slate-400">PNR / E-TICKET</div>
                        <div className="text-sm font-bold text-slate-900">
                          {selectedPassenger ? selectedPassenger.pnr : 'K9Q4LX'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {simulatedNotification.voucherCodes?.eTicket || 'ETKT-016-881920'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 font-mono text-center">
                      <div className="text-left">
                        <div className="text-2xl font-bold text-slate-900">{selectedOption.origin}</div>
                        <div className="text-xs text-slate-500">{selectedOption.departureTime}</div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-[11px] text-slate-400">{selectedOption.stopsDescription}</div>
                        <div className="w-full border-t border-dashed border-slate-300 my-1" />
                        <div className="text-[10px] text-sky-700 font-semibold">Involuntary Exchange</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">{selectedOption.destination}</div>
                        <div className="text-xs text-slate-500">{selectedOption.arrivalTime}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 text-xs font-mono">
                      <div>
                        <span className="text-slate-400">CABIN: </span>
                        <span className="text-slate-800 font-bold">
                          {selectedPassenger ? selectedPassenger.cabinClass : 'Business'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">SEAT: </span>
                        <span className="text-sky-700 font-bold">
                          {selectedPassenger ? selectedPassenger.seat : '4A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">STATUS: </span>
                        <span className="text-emerald-700 font-bold">CONFIRMED</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Electronic Ticket Reissue & Exchange Receipt */}
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-xs font-mono max-w-lg mx-auto shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-600 font-sans font-semibold">
                    <span>Electronic Ticket Reissue Receipt</span>
                    <span className="text-emerald-700 font-mono font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      $0.00 TOTAL DUE
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 pt-2 text-[11px]">
                    <div className="text-slate-500 font-sans">Original Fare Exchanged:</div>
                    <div className="text-right font-bold text-slate-900">
                      ${(simulatedNotification.billingReceipt?.originalFare || selectedPassenger?.ticketPrice || 2850).toLocaleString()}.00 USD
                    </div>
                    <div className="text-slate-500 font-sans">Rebooking & Change Penalty:</div>
                    <div className="text-right font-bold text-emerald-700">$0.00 (Waived)</div>
                    <div className="text-slate-500 font-sans">Fare Difference Charged:</div>
                    <div className="text-right font-bold text-emerald-700">$0.00 (Airline Covered)</div>
                    <div className="font-bold text-slate-900 pt-1.5 border-t border-slate-100 font-sans">
                      Total Collected from Passenger:
                    </div>
                    <div className="text-right font-bold text-emerald-700 pt-1.5 border-t border-slate-100 text-xs">
                      $0.00 USD
                    </div>
                  </div>
                </div>

                {/* Vouchers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {simulatedNotification.voucherCodes?.meal && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 shadow-xs">
                      <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Dining Card Credit</div>
                        <div className="text-base font-bold text-amber-700 font-mono">$45.00</div>
                        <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                          Code: <span className="font-bold text-slate-900">{simulatedNotification.voucherCodes.meal}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {simulatedNotification.voucherCodes?.hotel && (
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-2.5 shadow-xs">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                        <Bed className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Hotel Voucher</div>
                        <div className="text-xs font-semibold text-emerald-800 mt-0.5">Marriott Airport Gateway</div>
                        <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                          Voucher: <span className="font-bold text-slate-900">{simulatedNotification.voucherCodes.hotel}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeCredentialTab === 'sms' && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-2 max-w-lg mx-auto">
                <div className="text-[11px] text-slate-400 border-b border-slate-100 pb-2">
                  Delivered via SMS Gateway to {simulatedNotification.recipientContact}
                </div>
                <div className="bg-slate-50 rounded-lg p-3 text-slate-800 leading-relaxed border border-slate-100">
                  [AIRLINE ALERT] Flight update: You have been rebooked on {selectedOption.airline} flight {selectedOption.flightNumber} departing {selectedOption.origin} at {selectedOption.departureTime}. Seat {selectedPassenger?.seat || '4A'}. Boarding pass and dining card: https://airl.co/r/{selectedPassenger?.pnr || 'K9Q4LX'}
                </div>
              </div>
            )}

            {activeCredentialTab === 'email' && (
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-3 max-w-lg mx-auto">
                <div className="border-b border-slate-100 pb-2 space-y-0.5">
                  <div className="text-slate-500">
                    <span>Subject:</span> <span className="text-slate-800 font-bold">{simulatedNotification.subject}</span>
                  </div>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {simulatedNotification.body}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={() => onNavigate('rebooking')}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>← Back to Step 4: Rebooking</span>
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
