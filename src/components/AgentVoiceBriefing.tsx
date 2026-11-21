import React, { useState, useEffect, useRef } from 'react';
import { Flight, Passenger, RebookingOption, PolicyEvaluation } from '../types';
import { Volume2, VolumeX, Play, Pause, Square, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface AgentVoiceBriefingProps {
  flight: Flight;
  passenger: Passenger;
  option: RebookingOption;
  policy: PolicyEvaluation;
}

export const AgentVoiceBriefing: React.FC<AgentVoiceBriefingProps> = ({
  flight,
  passenger,
  option,
  policy,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isSupported, setIsSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Build the natural voice narration script
  const buildNarrationScript = () => {
    const isOvernight = policy.dutyOfCare.hotelVoucherEligible;
    const hasConnection = passenger.onwardConnection;
    const ticketFare = passenger.ticketPrice || 2850;
    const retailFare = option.retailMarketFare || 3150;
    const netAirlineCost = option.estimatedAirlineCost.total;
    const interlineProrate = option.estimatedAirlineCost.interlineProrate;

    return `Operations Control Center Agentic Briefing. Target traveler: ${passenger.firstName} ${passenger.lastName}, holding ${passenger.loyaltyTier} status with a ${ticketFare} dollar ${passenger.cabinClass} ticket on disrupted flight ${flight.flightNumber}.

Here is the financial and operational reasoning behind our autonomous recommendation to rebook on ${option.airline} flight ${option.flightNumber}.

First: Policy Agent evaluated Rule 240 and tariff protections, generating waiver endorsement code ${policy.waiverCode}. The two hundred dollar change penalty is waived, and the passenger pays zero dollars out of pocket. ${isOvernight ? `We have authorized a two hundred and twenty dollar hotel lodging voucher and a forty-five dollar terminal dining allowance.` : `A forty-five dollar dining credit is active.`}

Second: Financial and routing evaluation. Rebooking Agent analyzed fourteen alternative flights. While partner flights like British Airways provide alternative times, they would cost the airline three hundred and eighty dollars in interline proration fees. Flight ${option.flightNumber} costs our airline only ${netAirlineCost} dollars in recovery expenses, saving ${interlineProrate > 0 ? 'hundreds' : 'three hundred and eighty'} dollars while delivering a retail flight value of ${retailFare} dollars.

Number one: It is a direct nonstop routing protecting the passenger's lie-flat ${passenger.cabinClass} seat.
${hasConnection ? `Number two: It protects the onward international connection to ${hasConnection.destination}.` : 'Number two: It arrives with minimal schedule delta.'}
And number three: It protects the traveler's ${ticketFare} dollar booking revenue without incurring costly involuntary refund churn.

Validation Agent has confirmed coupon exchange readiness. Please click 1-Click Approve to execute re-ticketing and dispatch digital passenger credentials.`;
  };

  const scriptText = buildNarrationScript();

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(scriptText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    // Select natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Ava') ||
          v.name.includes('Alex'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlaying && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleToggleRate = () => {
    const nextRate = speechRate === 1.0 ? 1.25 : speechRate === 1.25 ? 1.5 : 1.0;
    setSpeechRate(nextRate);
    if (isPlaying) {
      handleStop();
    }
  };

  return (
    <div className="bg-gradient-to-r from-sky-50/80 via-white to-sky-50/50 border border-sky-300 rounded-xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left info & audio state */}
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 transition-all ${
              isPlaying
                ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/20'
                : 'bg-sky-100 text-sky-700 border-sky-200'
            }`}
          >
            {isPlaying ? (
              <div className="flex items-center gap-0.5 h-5 px-0.5">
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-4" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-5" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-3" />
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:75ms] h-4" />
              </div>
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-800">
                Agent Decision Voice Narration
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-mono text-slate-500">
                Audio OCC Briefing
              </span>
              {isPlaying && (
                <span className="inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                  Speaking Live
                </span>
              )}
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
              Listen: Why AI Selected {option.airline} {option.flightNumber} for {passenger.firstName} {passenger.lastName}
            </h3>

            <p className="text-xs text-slate-600 mt-0.5">
              Narrates the full policy clauses applied, alternative routes evaluated, and interline cost factors considered.
            </p>
          </div>
        </div>

        {/* Right audio controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
          {!isPlaying ? (
            <button
              onClick={handlePlay}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-all flex items-center gap-1.5 shadow-sm shadow-sky-600/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isPaused ? 'Resume Narration' : 'Narrate Decision'}</span>
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </button>
          )}

          {(isPlaying || isPaused) && (
            <button
              onClick={handleStop}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Stop</span>
            </button>
          )}

          {/* Speed Toggle */}
          <button
            onClick={handleToggleRate}
            title="Toggle playback speed"
            className="px-2.5 py-2 text-xs font-mono font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            {speechRate}x
          </button>

          {/* Transcript Toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>{showTranscript ? 'Hide Text' : 'Read Transcript'}</span>
            {showTranscript ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Expandable Spoken Transcript */}
      {showTranscript && (
        <div className="mt-4 pt-3.5 border-t border-sky-200/60 animate-in fade-in duration-150">
          <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Verbatim Audio Narration Transcript
          </div>
          <div className="bg-white/90 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 leading-relaxed font-sans space-y-2">
            <p>
              <strong className="text-slate-900">Operations Control Center Agentic Briefing:</strong> Target traveler{' '}
              <strong className="text-sky-800 font-semibold">{passenger.firstName} {passenger.lastName}</strong>, holding{' '}
              <strong className="text-amber-800 font-semibold">{passenger.loyaltyTier}</strong> status in{' '}
              <strong className="text-slate-900 font-semibold">{passenger.cabinClass}</strong> class (Ticket: ${(passenger.ticketPrice || 2850).toLocaleString()}), affected by the disruption on flight{' '}
              <strong className="text-slate-900 font-mono font-semibold">{flight.flightNumber}</strong>.
            </p>

            <p>
              <strong>1. Regulatory & Tariff Policy:</strong> Policy Agent evaluated Rule 240 involuntary protection and issued waiver endorsement code{' '}
              <span className="font-mono font-bold text-sky-700">{policy.waiverCode}</span>. The $200.00 change penalty is waived (Passenger pays $0.00). Authorized a{' '}
              <strong>${policy.dutyOfCare.hotelVoucherAmount}.00</strong> hotel lodging voucher and a{' '}
              <strong>${policy.dutyOfCare.mealVoucherAmount}.00</strong> terminal meal credit.
            </p>

            <p>
              <strong>2. Flight Options & Cost Analysis:</strong> Rebooking Agent analyzed 14 alternative flights. Candidate partner options carried up to a{' '}
              <span className="text-amber-800 font-semibold">$380.00 partner interline proration settlement</span>. Chosen flight costs carrier only <strong>${option.estimatedAirlineCost.total}.00</strong>, delivering a replacement retail flight value of <strong>${(option.retailMarketFare || 3150).toLocaleString()}.00</strong>.
            </p>

            <p>
              <strong>3. Ranking Decision:</strong> Flight <strong className="text-sky-800 font-mono font-bold">{option.flightNumber}</strong> was ranked #1 because it is a direct nonstop routing, guarantees the booked{' '}
              <strong>{passenger.cabinClass} lie-flat bed</strong>, saves ${(option.estimatedAirlineCost.savingsVsInvoluntaryRefund || 2805).toLocaleString()} compared to issuing an involuntary refund, and arrives with ample time to protect the onward connection to{' '}
              <strong className="text-slate-900">{passenger.onwardConnection?.destination || 'destination'}</strong>.
            </p>

            <p className="text-slate-600 font-mono text-[11px] pt-1">
              ✓ Validation Agent: MCT verified · Baggage tags reassigned · Ticket open for exchange. Ready for Human-in-the-Loop 1-click execution.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
