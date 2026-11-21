import React, { useState } from 'react';
import { PolicyEvaluation } from '../types';
import { ShieldCheck, ChevronDown, ChevronUp, DollarSign, Bed, Utensils, Calendar, RefreshCw } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface PolicyCardProps {
  policy: PolicyEvaluation;
  flightNumber: string;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy, flightNumber }) => {
  const [showClauses, setShowClauses] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs">
      {/* Policy Card Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Policy Agent Decision & Rules
              </h3>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                PROTECTION ACTIVE
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono font-bold text-sky-700">
            {policy.waiverCode}
          </div>
          <div className="text-[11px] text-slate-500">
            Change Fee Waiver
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Concise Plain Language Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Operational Decision
            </span>
            <Tooltip content="Rule 240 / DOT 14 CFR Part 259 / IATA Res 735d compliance summary" iconOnly />
          </div>
          <p className="text-xs text-slate-800 leading-relaxed font-medium">
            {policy.plainLanguageSummary}
          </p>
        </div>

        {/* Financial Protections & Monetary Entitlements Ledger */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-emerald-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
              <DollarSign className="w-4 h-4 text-emerald-700" />
              <span>Policy Financial Protections & Fee Absorptions</span>
            </div>
            <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
              100% AIRLINE COVERED
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <div className="text-[11px] text-slate-500 font-sans">Change Fee</div>
              <div className="font-bold text-emerald-800 mt-0.5">$0.00</div>
              <div className="text-[10px] text-slate-500 font-sans line-through decoration-rose-500">$200.00 waived</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-sans">Fare Difference</div>
              <div className="font-bold text-emerald-800 mt-0.5">$0.00 to pax</div>
              <div className="text-[10px] text-slate-500 font-sans">Up to $1,200 absorbed</div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-sans">Hotel Credit</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {policy.dutyOfCare.hotelVoucherEligible ? `$${policy.dutyOfCare.hotelVoucherAmount}.00` : '$0.00'}
              </div>
              <div className="text-[10px] text-slate-500 font-sans">
                {policy.dutyOfCare.hotelVoucherEligible ? 'Lodging + Shuttle' : 'Daytime flight'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-slate-500 font-sans">Dining Allowance</div>
              <div className="font-bold text-slate-900 mt-0.5">
                ${policy.dutyOfCare.mealVoucherAmount}.00
              </div>
              <div className="text-[10px] text-slate-500 font-sans">Digital dining card</div>
            </div>
          </div>
        </div>

        {/* Compact Entitlements Grid with Tooltips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Permitted Dates */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Travel Dates</span>
              </span>
              <Tooltip content={policy.permittedDateWindow.description} iconOnly />
            </div>
            <div className="text-xs font-mono text-emerald-700 mt-1 font-bold">
              ±3 Days Window
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Fare difference absorbed
            </div>
          </div>

          {/* Partner vs Own Carrier */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>Alliance Scope</span>
              </span>
              <Tooltip content="Carrier scope: Star Alliance & bilateral SPA interline agreements authorized for immediate re-accommodation" iconOnly />
            </div>
            <div className="text-xs font-mono text-indigo-700 mt-1 font-bold">
              {policy.partnerAirlinePermitted ? 'Alliance Partner OK' : 'Own-Metal Only'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {policy.partnerAllianceName || 'Star Alliance Bilateral'}
            </div>
          </div>

          {/* Cabin Protection */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Cabin Protection</span>
              </span>
              <Tooltip content={policy.cabinRule} iconOnly />
            </div>
            <div className="text-xs font-mono text-amber-800 mt-1 font-bold">
              Exact Cabin Protected
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Downgrade compensation active
            </div>
          </div>

          {/* Hotel Entitlement */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <Bed className="w-3.5 h-3.5 text-emerald-600" />
                <span>Hotel Voucher</span>
              </span>
              <Tooltip content="Hotel lodging voucher ($220.00) issued for overnight delays or next-morning flight rebooking" iconOnly />
            </div>
            <div className="text-xs font-mono mt-1 font-bold">
              {policy.dutyOfCare.hotelVoucherEligible ? (
                <span className="text-emerald-700">
                  Approved (${policy.dutyOfCare.hotelVoucherAmount}.00)
                </span>
              ) : (
                <span className="text-slate-400">Not Applicable (Daytime)</span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Includes airport shuttle
            </div>
          </div>

          {/* Meal Entitlement */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-600" />
                <span>Meal Allowance</span>
              </span>
              <Tooltip content="Digital dining card ($45.00) issued for terminal concessions when delay exceeds 2 hours" iconOnly />
            </div>
            <div className="text-xs font-mono mt-1 font-bold">
              {policy.dutyOfCare.mealVoucherEligible ? (
                <span className="text-emerald-700">
                  Active (${policy.dutyOfCare.mealVoucherAmount}.00)
                </span>
              ) : (
                <span className="text-slate-400">Delay &lt; 2h</span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Digital concession card
            </div>
          </div>

          {/* Refund Option */}
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs font-medium text-slate-700">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Full Refund</span>
              </span>
              <Tooltip content="DOT 14 CFR Part 259 statutory refund entitlement with zero penalty if alternative is declined" iconOnly />
            </div>
            <div className="text-xs font-mono text-emerald-700 mt-1 font-bold">
              100% Eligible
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Zero cancellation fee
            </div>
          </div>
        </div>

        {/* Collapsible Applied Policy Clauses */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowClauses(!showClauses)}
            className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between text-xs text-slate-700 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold">Applied Regulatory & Tariff Clauses</span>
              <span className="text-slate-500 font-mono">({policy.appliedClauses.length} active)</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <span>{showClauses ? 'Collapse' : 'Inspect Legal Clauses'}</span>
              {showClauses ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showClauses && (
            <div className="divide-y divide-slate-100 p-3 bg-white text-xs">
              {policy.appliedClauses.map((clause, idx) => (
                <div key={idx} className="py-2.5 first:pt-1 last:pb-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-slate-900">
                      {clause.code}: {clause.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {clause.authority}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {clause.explanation}
                  </p>
                  <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                    → Action: {clause.actionGranted}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
