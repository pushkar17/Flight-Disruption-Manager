import React, { useState } from 'react';
import { SimulatedNotification, RebookingOption, Passenger } from '../types';
import { X, Smartphone, Mail, QrCode, CheckCircle2, Bed, Utensils, Plane } from 'lucide-react';

interface NotificationModalProps {
  notification: SimulatedNotification | null;
  passenger: Passenger | undefined;
  rebookingOption: RebookingOption | undefined;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notification,
  passenger,
  rebookingOption,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'SMS' | 'EMAIL' | 'PASS'>('PASS');

  if (!notification || !rebookingOption) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dispatched Passenger Credentials
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Sent to {notification.recipientName} ({notification.recipientContact})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 text-xs font-medium">
          <button
            onClick={() => setActiveTab('PASS')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'PASS'
                ? 'border-b-2 border-sky-600 text-sky-800 font-bold bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Boarding Pass & Vouchers</span>
          </button>
          <button
            onClick={() => setActiveTab('SMS')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'SMS'
                ? 'border-b-2 border-sky-600 text-sky-800 font-bold bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>SMS Message</span>
          </button>
          <button
            onClick={() => setActiveTab('EMAIL')}
            className={`flex-1 py-2.5 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'EMAIL'
                ? 'border-b-2 border-sky-600 text-sky-800 font-bold bg-white'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Email Confirmation</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto bg-slate-50/30">
          {/* DIGITAL BOARDING PASS TAB */}
          {activeTab === 'PASS' && (
            <div className="space-y-4">
              {/* Boarding Pass Card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm max-w-lg mx-auto">
                <div className="bg-sky-600 px-4 py-2 text-white flex items-center justify-between font-mono text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <Plane className="w-4 h-4" />
                    <span>{rebookingOption.airline.toUpperCase()} BOARDING PASS</span>
                  </div>
                  <span>{rebookingOption.flightNumber}</span>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-[11px] text-slate-400 font-mono">PASSENGER NAME</div>
                      <div className="text-base font-bold text-slate-900 uppercase">
                        {notification.recipientName}
                      </div>
                      <div className="text-xs text-sky-700 font-mono font-semibold">
                        {passenger ? passenger.loyaltyTier : 'Priority Customer'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-mono">PNR / E-TICKET</div>
                      <div className="text-sm font-mono font-bold text-slate-900">
                        {passenger ? passenger.pnr : 'K9Q4LX'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {notification.voucherCodes?.eTicket || 'ETKT-016-881920'}
                      </div>
                    </div>
                  </div>

                  {/* Route & Times */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-b border-slate-100 font-mono text-center">
                    <div className="text-left">
                      <div className="text-2xl font-bold text-slate-900">{rebookingOption.origin}</div>
                      <div className="text-xs text-slate-500">{rebookingOption.departureTime}</div>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-[11px] text-slate-400">{rebookingOption.stopsDescription}</div>
                      <div className="w-full border-t border-dashed border-slate-300 my-1" />
                      <div className="text-[10px] text-sky-700 font-semibold">Involuntary Exchange</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{rebookingOption.destination}</div>
                      <div className="text-xs text-slate-500">{rebookingOption.arrivalTime}</div>
                    </div>
                  </div>

                  {/* Seat and Cabin */}
                  <div className="flex items-center justify-between pt-3 text-xs font-mono">
                    <div>
                      <span className="text-slate-400">CABIN: </span>
                      <span className="text-slate-800 font-bold">
                        {passenger ? passenger.cabinClass : 'Business'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">SEAT: </span>
                      <span className="text-sky-700 font-bold">
                        {passenger ? passenger.seat : '4A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400">GATE: </span>
                      <span className="text-slate-800 font-bold">G98</span>
                    </div>
                  </div>
                </div>

                {/* Barcode Mock */}
                <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-mono text-[10px] text-slate-400 tracking-widest">
                    ||||| | |||||| || | |||||||| || ||||| ||||||| | |||||
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    SCANNABLE AT GATE
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
                    ${(notification.billingReceipt?.originalFare || passenger?.ticketPrice || 2850).toLocaleString()}.00 USD
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

              {/* Digital Vouchers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                {notification.voucherCodes?.meal && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Dining Card Credit</div>
                      <div className="text-base font-bold text-amber-700 font-mono">$45.00</div>
                      <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                        Code: <span className="font-bold text-slate-900">{notification.voucherCodes.meal}</span>
                      </div>
                    </div>
                  </div>
                )}

                {notification.voucherCodes?.hotel && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                      <Bed className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">Hotel Lodging Voucher</div>
                      <div className="text-xs font-semibold text-emerald-800 mt-0.5">Marriott Airport Gateway</div>
                      <div className="text-[11px] font-mono text-slate-600 mt-0.5">
                        Voucher: <span className="font-bold text-slate-900">{notification.voucherCodes.hotel}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SMS TAB */}
          {activeTab === 'SMS' && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs text-slate-700 space-y-2 max-w-lg mx-auto">
              <div className="text-[11px] text-slate-400 border-b border-slate-100 pb-2">
                Delivered via SMS Gateway to {notification.recipientContact}
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-slate-800 leading-relaxed border border-slate-100">
                [AIRLINE ALERT] Flight disruption update: Your itinerary has been protected on {rebookingOption.airline} flight {rebookingOption.flightNumber} ({rebookingOption.origin} to {rebookingOption.destination}) departing {rebookingOption.departureTime}. Seat {passenger?.seat || '4A'}. Boarding pass and dining credit voucher: https://airl.co/r/{passenger?.pnr || 'K9Q4LX'}
              </div>
            </div>
          )}

          {/* EMAIL TAB */}
          {activeTab === 'EMAIL' && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-3 max-w-lg mx-auto">
              <div className="border-b border-slate-100 pb-2 space-y-0.5">
                <div className="text-slate-500">
                  <span>From:</span> Operations Care &lt;noreply@airline-irrops.com&gt;
                </div>
                <div className="text-slate-800 font-bold">
                  {notification.subject}
                </div>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {notification.body}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
