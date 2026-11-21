import {
  Flight,
  Passenger,
  DisruptionEvent,
  PolicyEvaluation,
  PolicyClause,
  RebookingOption,
  AgentActivity,
  RecoveryCase,
  SimulatedNotification,
} from '../types';

/**
 * Disruption Detection Agent
 * Evaluates telemetry, ATC data, and operational impacts
 */
export function runDisruptionDetectionAgent(
  flight: Flight,
  disruption: DisruptionEvent
): {
  activities: AgentActivity[];
  updatedDisruption: DisruptionEvent;
} {
  const activities: AgentActivity[] = [];

  const dutyOfCareCost = disruption.affectedPassengerCount * (disruption.estimatedDelayMinutes >= 360 ? 265 : 45);
  const statutoryRisk = (disruption.type === 'CANCELLATION' || disruption.estimatedDelayMinutes >= 240) ? Math.round(disruption.affectedPassengerCount * 450) : 0;
  const delayOperationalCost = Math.round(Math.min(disruption.estimatedDelayMinutes, 720) * 140);
  const totalExposure = dutyOfCareCost + statutoryRisk + delayOperationalCost;

  const updatedDisruption: DisruptionEvent = {
    ...disruption,
    financialExposure: disruption.financialExposure || {
      dutyOfCareCost,
      statutoryCompensationRisk: statutoryRisk,
      delayOperationalCost,
      totalExposure,
    },
  };

  activities.push({
    id: `ACT-DET-01-${Date.now()}`,
    agent: 'Disruption Detection Agent',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    status: 'completed',
    title: `Telemetry Trigger: ${disruption.type.replace('_', ' ')} Detected`,
    details: `Signal received from OCC Flight Ops & ACARS. Root cause identified: "${disruption.rootCause}". Severity classified as ${disruption.severity}. Estimated financial exposure: $${totalExposure.toLocaleString()}.`,
    metrics: [
      { label: 'Event Code', value: disruption.atcOrNoticeCode || 'IRROP-GEN' },
      { label: 'Pax on Board', value: `${flight.passengerCount} / ${flight.capacity}` },
      { label: 'Connections at Risk', value: `${disruption.connectionRiskCount} passengers` },
      { label: 'Financial Exposure', value: `$${totalExposure.toLocaleString()}` },
    ],
    durationMs: 140,
  });

  return {
    activities,
    updatedDisruption,
  };
}

/**
 * Policy Agent
 * Evaluates mock airline rules, tariffs, IATA Res 735d, DOT CFR 259, and EU261
 */
export function runPolicyAgent(
  flight: Flight,
  disruption: DisruptionEvent,
  passenger?: Passenger
): {
  activities: AgentActivity[];
  policyResult: PolicyEvaluation;
} {
  const activities: AgentActivity[] = [];
  const isCancellation = disruption.type === 'CANCELLATION';
  const isLongDelay = disruption.type === 'LONG_DELAY' || disruption.estimatedDelayMinutes >= 180;
  const isGaugeChange = disruption.type === 'AIRCRAFT_CHANGE';

  const partnerPermitted = isCancellation || disruption.estimatedDelayMinutes >= 240 || isGaugeChange;
  const hotelEligible = isCancellation || disruption.estimatedDelayMinutes >= 360;
  const mealEligible = isCancellation || disruption.estimatedDelayMinutes >= 120;
  const waiverCode = `WV-IRROP-2026-${flight.origin.code}-${flight.flightNumber.replace(/\s+/g, '')}`;

  const clauses: PolicyClause[] = [
    {
      code: 'Rule 240 / Section 8.4',
      title: 'Involuntary Schedule Disruption & Re-routing',
      authority: 'Airline Rule 240',
      explanation: 'Carrier must re-accommodate passenger on next available flight at no additional cost. If delay exceeds 4 hours, interline partner carriers may be ticketed under multilateral proration.',
      actionGranted: 'Waives all rebooking fees, fare class inventory restrictions, and change penalties.',
    },
    {
      code: '14 CFR Part 259',
      title: 'DOT Involuntary Refund & Service Protection',
      authority: 'DOT 14-CFR-259',
      explanation: 'Passengers subject to a cancellation or significant delay (>180 min domestic, >360 min intl) are entitled to prompt cash refund if alternative rebooking is declined.',
      actionGranted: 'Guaranteed 100% full refund eligibility without cancellation fee upon passenger request.',
    },
  ];

  if (hotelEligible) {
    clauses.push({
      code: 'Duty of Care DOC-04',
      title: 'Overnight Accommodation & Ground Transit',
      authority: 'Airline Rule 240',
      explanation: 'When flight cancellation or delay extends through overnight hours (22:00-06:00), airline must supply approved hotel accommodation and ground transportation vouchers.',
      actionGranted: 'Approved $220.00 hotel lodging credit + airport shuttle transfer voucher.',
    });
  }

  if (mealEligible) {
    clauses.push({
      code: 'Duty of Care DOC-02',
      title: 'Food & Beverage Subsistence Allowance',
      authority: 'Airline Rule 240',
      explanation: 'Delays exceeding 2 hours entitle confirmed ticket holders to digital meal vouchers commensurate with waiting time.',
      actionGranted: '$45.00 food & beverage digital card issued for terminal concessions.',
    });
  }

  if (partnerPermitted) {
    clauses.push({
      code: 'IATA Res 735d / Star-Sky-One Alliance Schedule',
      title: 'Alliance & Interline Passenger Re-accommodation',
      authority: 'IATA Res 735d',
      explanation: 'Involuntary schedule disruption authorizes ticketing over approved alliance partners under standard Special Proration Agreements (SPA) without passenger fare surcharges.',
      actionGranted: 'Permits immediate rebooking on British Airways, Virgin Atlantic, and Lufthansa flights.',
    });
  }

  const plainLanguageSummary = isCancellation
    ? `Flight ${flight.flightNumber} cancellation qualifies for immediate involuntary protection under Rule 240. All change and cancellation fees are waived under code ${waiverCode}. Passengers may be rebooked within ±3 days of scheduled departure on ${flight.airline} or approved alliance partners. Hotel vouchers ($220) and terminal meal credits ($45) are authorized.`
    : `Flight ${flight.flightNumber} delay of ${disruption.estimatedDelayMinutes}m triggers Duty of Care protections. Passengers may accept rebooking on earlier or alternative flights with change fee waiver ${waiverCode}. Terminal meal vouchers ($45) are active. ${hotelEligible ? 'Overnight hotel accommodation is authorized.' : 'Hotel not required as expected arrival is daytime.'}`;

  const passengerFare = passenger?.ticketPrice || (passenger?.cabinClass === 'Business' ? 2850 : passenger?.cabinClass === 'First' ? 4650 : 720);

  const policyResult: PolicyEvaluation = {
    eligibleForRebooking: true,
    permittedDateWindow: {
      start: 'Current Date - 1 day',
      end: 'Current Date + 3 days',
      description: 'Travel permitted ±3 days from original travel date with all fare differences absorbed.',
    },
    partnerAirlinePermitted: partnerPermitted,
    partnerAllianceName: 'Star Alliance & Bilateral Partners',
    cabinRule: passenger
      ? `Cabin protection: ${passenger.cabinClass}. Involuntary downgrade prohibited; if downgrade mandatory, standard $500 voucher compensation applies.`
      : 'Maintain ticketed cabin class (First / Business / Premium / Economy). Top-tier loyalty flyers eligible for operational upgrade if original cabin full.',
    changeFeeWaived: true,
    waiverCode,
    refundEligible: true,
    dutyOfCare: {
      hotelVoucherEligible: hotelEligible,
      hotelVoucherAmount: 220,
      mealVoucherEligible: mealEligible,
      mealVoucherAmount: 45,
      groundTransportEligible: hotelEligible,
      loungeAccessEligible: passenger ? (passenger.loyaltyTier === 'Executive Platinum' || passenger.loyaltyTier === 'Platinum') : true,
    },
    financialProtections: {
      standardChangeFeeWaived: 200,
      maxAbsorbedFareDifference: 1200,
      involuntaryRefundValue: passengerFare,
      hotelAllowance: hotelEligible ? 220 : 0,
      mealAllowance: mealEligible ? 45 : 0,
      groundTransportAllowance: hotelEligible ? 50 : 0,
      downgradeCompensation: 500,
    },
    appliedClauses: clauses,
    plainLanguageSummary,
  };

  activities.push({
    id: `ACT-POL-02-${Date.now()}`,
    agent: 'Policy Agent',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    status: 'completed',
    title: 'Policy Evaluation Complete: Involuntary Protection Granted',
    details: `Applied ${clauses.length} tariff & legal clauses. Waiver code ${waiverCode} waives $200 change fee & absorbs fare differences. Involuntary refund liability: $${passengerFare.toLocaleString()}.`,
    metrics: [
      { label: 'Waiver Code', value: waiverCode },
      { label: 'Fee Waived', value: '$200.00' },
      { label: 'Hotel Credit', value: hotelEligible ? '$220.00' : 'Not required' },
      { label: 'Refund Value', value: `$${passengerFare.toLocaleString()}` },
    ],
    durationMs: 185,
  });

  return {
    activities,
    policyResult,
  };
}

/**
 * Rebooking Agent
 * Evaluates candidate flights, scores utility, and ranks top 3 recovery options
 */
export function runRebookingAgent(
  flight: Flight,
  disruption: DisruptionEvent,
  passenger?: Passenger
): {
  activities: AgentActivity[];
  options: RebookingOption[];
} {
  const activities: AgentActivity[] = [];
  const requestedCabin = passenger ? passenger.cabinClass : 'Business';

  // Candidate alternative flights tailored to origin & destination
  let rawCandidates: RebookingOption[] = [];

  if (flight.origin.code === 'SFO' && flight.destination.code === 'LHR') {
    rawCandidates = [
      {
        id: 'OPT-UA901',
        rank: 1,
        flightNumber: 'UA 901',
        airline: 'United Airlines',
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: 'SFO',
        destination: 'LHR',
        departureTime: '22:15 Today',
        arrivalTime: '16:40 +1',
        durationMinutes: 625,
        stops: 0,
        stopsDescription: 'Nonstop (Direct)',
        aircraft: 'Boeing 777-200ER',
        availableSeats: {
          first: 0,
          business: 4,
          premiumEconomy: 8,
          economy: 26,
        },
        arrivalDeltaMinutes: 155, // arrives only 2.5 hrs later than original
        rankingScore: 94,
        rankingReason: 'Optimal arrival time (+2h 35m), same operating carrier, direct nonstop flight, protects booked Business cabin.',
        pros: [
          'Direct nonstop routing avoiding connection risks',
          'Same airline (no interline proration cost to carrier)',
          'Arrives London Heathrow afternoon next day',
          'Lie-flat Polaris Business seats available',
        ],
        cons: [
          'Only 4 Business class seats remaining; requires immediate hold',
        ],
        estimatedAirlineCost: {
          interlineProrate: 0,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 45,
        },
        validationStatus: 'VALIDATED',
        validationNote: 'MCT and baggage handling verified at SFO Terminal G.',
      },
      {
        id: 'OPT-BA286',
        rank: 2,
        flightNumber: 'BA 286',
        airline: 'British Airways',
        alliance: 'Oneworld Partner',
        isPartner: true,
        origin: 'SFO',
        destination: 'LHR',
        departureTime: '21:00 Today',
        arrivalTime: '15:15 +1',
        durationMinutes: 615,
        stops: 0,
        stopsDescription: 'Nonstop (Direct Partner)',
        aircraft: 'Airbus A350-1000',
        availableSeats: {
          first: 2,
          business: 6,
          premiumEconomy: 12,
          economy: 42,
        },
        arrivalDeltaMinutes: 70, // arrives just 1h 10m later
        rankingScore: 89,
        rankingReason: 'Fastest arrival time (+1h 10m) via partner metal, Club Suite cabin available, high passenger satisfaction rating.',
        pros: [
          'Closest arrival to original schedule (only +70 min delta)',
          'Ample seat inventory across all classes',
          'New Club Suite with sliding privacy door',
        ],
        cons: [
          'Partner interline agreement carries $380 interline proration settlement cost',
          'Requires terminal change at SFO (Intl G to Intl A)',
        ],
        estimatedAirlineCost: {
          interlineProrate: 380,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 425,
        },
        validationStatus: 'VALIDATED',
        validationNote: 'Baggage interline transfer protocol active between UA and BA.',
      },
      {
        id: 'OPT-UA1804-UA920',
        rank: 3,
        flightNumber: 'UA 1804 / UA 920',
        airline: 'United Airlines',
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: 'SFO',
        destination: 'LHR',
        departureTime: '23:30 Today',
        arrivalTime: '19:25 +1',
        durationMinutes: 715,
        stops: 1,
        stopsDescription: '1 Stop via EWR (Newark)',
        aircraft: 'Boeing 787-9',
        availableSeats: {
          first: 0,
          business: 11,
          premiumEconomy: 14,
          economy: 55,
        },
        arrivalDeltaMinutes: 320,
        rankingScore: 78,
        rankingReason: 'High seat availability for large group recovery, internal airline routing with zero external interline expense.',
        pros: [
          'Zero interline cost to airline',
          'High capacity (11 Business, 55 Economy seats open)',
          'Redundant backup connections from EWR to LHR if needed',
        ],
        cons: [
          '1-stop connection adds 2 hours 45 minutes travel time',
          'EWR connection window is 85 minutes (adequate but tight)',
        ],
        estimatedAirlineCost: {
          interlineProrate: 0,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 45,
        },
        validationStatus: 'TIGHT_CONNECTION',
        validationNote: 'Connection at EWR meets MCT (45m required, 85m provided).',
      },
    ];
  } else if (flight.origin.code === 'JFK' && flight.destination.code === 'CDG') {
    rawCandidates = [
      {
        id: 'OPT-AF007',
        rank: 1,
        flightNumber: 'AF 007',
        airline: 'Air France',
        alliance: 'SkyTeam Partner',
        isPartner: true,
        origin: 'JFK',
        destination: 'CDG',
        departureTime: '23:00 Today',
        arrivalTime: '12:20 +1',
        durationMinutes: 440,
        stops: 0,
        stopsDescription: 'Nonstop (Direct Partner)',
        aircraft: 'Boeing 777-300ER',
        availableSeats: {
          first: 1,
          business: 5,
          premiumEconomy: 9,
          economy: 34,
        },
        arrivalDeltaMinutes: 275,
        rankingScore: 92,
        rankingReason: 'Seamless SkyTeam joint venture routing, protects onwards Air France European connections in CDG Terminal 2E.',
        pros: [
          'Direct SkyTeam joint venture seamless luggage transfer',
          'Automatically protects missed connecting flights out of Paris CDG',
          'Air France Business class flat beds',
        ],
        cons: [
          'Requires terminal transfer at JFK (T4 to T1)',
        ],
        estimatedAirlineCost: {
          interlineProrate: 210,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 255,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-DL264',
        rank: 2,
        flightNumber: 'DL 264',
        airline: 'Delta Air Lines',
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: 'JFK',
        destination: 'CDG',
        departureTime: '23:45 Today',
        arrivalTime: '13:10 +1',
        durationMinutes: 445,
        stops: 0,
        stopsDescription: 'Nonstop (Own Carrier)',
        aircraft: 'Airbus A330-900neo',
        availableSeats: {
          first: 0,
          business: 2,
          premiumEconomy: 4,
          economy: 18,
        },
        arrivalDeltaMinutes: 325,
        rankingScore: 86,
        rankingReason: 'Same operating carrier keeps passenger within Delta One suite ecosystem; zero interline expense.',
        pros: [
          'Departs from same JFK Terminal 4',
          'Delta One suite product',
          'No partner interline fee',
        ],
        cons: [
          'Only 2 Delta One suites available',
        ],
        estimatedAirlineCost: {
          interlineProrate: 0,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 45,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-DL402-CDG',
        rank: 3,
        flightNumber: 'DL 402',
        airline: 'Delta Air Lines',
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: 'JFK',
        destination: 'AMS',
        departureTime: '22:30 Today',
        arrivalTime: '11:55 +1',
        durationMinutes: 445,
        stops: 1,
        stopsDescription: '1 Stop via Amsterdam (AMS) to CDG',
        aircraft: 'Boeing 767-400ER',
        availableSeats: {
          first: 0,
          business: 8,
          premiumEconomy: 12,
          economy: 48,
        },
        arrivalDeltaMinutes: 380,
        rankingScore: 75,
        rankingReason: 'High volume rebooking route through partner hub Amsterdam with KLM feeder to Paris.',
        pros: [
          'High seat capacity across economy and premium',
          'Reliable hub transfer with frequent hourly AMS-CDG shuttle flights',
        ],
        cons: [
          'Additional stop adds travel fatigue',
          'Arrival 6.3 hours later than originally scheduled',
        ],
        estimatedAirlineCost: {
          interlineProrate: 95,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 140,
        },
        validationStatus: 'VALIDATED',
      },
    ];
  } else if (flight.origin.code === 'LAX' && flight.destination.code === 'HND') {
    rawCandidates = [
      {
        id: 'OPT-JL061',
        rank: 1,
        flightNumber: 'JL 061',
        airline: 'Japan Airlines',
        alliance: 'Oneworld Partner',
        isPartner: true,
        origin: 'LAX',
        destination: 'HND',
        departureTime: '13:05 Today',
        arrivalTime: '17:00 +1',
        durationMinutes: 655,
        stops: 0,
        stopsDescription: 'Nonstop (Direct Partner)',
        aircraft: 'Boeing 777-300ER',
        availableSeats: {
          first: 2,
          business: 6,
          premiumEconomy: 10,
          economy: 38,
        },
        arrivalDeltaMinutes: 95,
        rankingScore: 95,
        rankingReason: 'Oneworld joint venture partner nonstop, arrives just 1h 35m later, guarantees First/Business class and protects onward Japan domestic connections.',
        pros: [
          'Arrives within 95 minutes of original schedule',
          'First and Business suites available',
          'Direct baggage interline transfer at LAX Terminal B',
        ],
        cons: [
          'Requires terminal transfer from T4 to Tom Bradley Intl',
        ],
        estimatedAirlineCost: {
          interlineProrate: 280,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 325,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-AA169',
        rank: 2,
        flightNumber: 'AA 169',
        airline: 'American Airlines',
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: 'LAX',
        destination: 'NRT',
        departureTime: '12:30 Today',
        arrivalTime: '16:15 +1',
        durationMinutes: 645,
        stops: 0,
        stopsDescription: 'Nonstop (Tokyo Narita Option)',
        aircraft: 'Boeing 787-9',
        availableSeats: {
          first: 0,
          business: 4,
          premiumEconomy: 14,
          economy: 52,
        },
        arrivalDeltaMinutes: 50,
        rankingScore: 88,
        rankingReason: 'Same carrier keeps passenger in ecosystem; arrives Tokyo Narita with complimentary ground limousine bus voucher to Haneda/Tokyo.',
        pros: [
          'Own aircraft, zero interline cost',
          'Wide economy and premium availability',
          'Departs from same Terminal 4',
        ],
        cons: [
          'Arrives Tokyo Narita (NRT) instead of Haneda (HND)',
        ],
        estimatedAirlineCost: {
          interlineProrate: 0,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 45,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-NH105',
        rank: 3,
        flightNumber: 'NH 105',
        airline: 'All Nippon Airways',
        alliance: 'Star Alliance Partner',
        isPartner: true,
        origin: 'LAX',
        destination: 'HND',
        departureTime: '00:50 +1',
        arrivalTime: '05:00 +2',
        durationMinutes: 670,
        stops: 0,
        stopsDescription: 'Nonstop (Late Night Red-Eye)',
        aircraft: 'Boeing 777-300ER',
        availableSeats: {
          first: 1,
          business: 5,
          premiumEconomy: 8,
          economy: 30,
        },
        arrivalDeltaMinutes: 815,
        rankingScore: 74,
        rankingReason: 'Overnight red-eye alternative with The Room Business class suites.',
        pros: [
          'Lie-flat private door suite product',
          'Arrives early morning ready for business day in Tokyo',
        ],
        cons: [
          'Long wait at LAX, hotel day room voucher required',
        ],
        estimatedAirlineCost: {
          interlineProrate: 320,
          hotelVoucher: 150,
          mealVoucher: 45,
          total: 515,
        },
        validationStatus: 'VALIDATED',
      },
    ];
  } else if (flight.origin.code === 'SFO' && flight.destination.code === 'FRA') {
    rawCandidates = [
      {
        id: 'OPT-LH457',
        rank: 1,
        flightNumber: 'LH 457',
        airline: 'Lufthansa',
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: 'SFO',
        destination: 'FRA',
        departureTime: '17:30 Today',
        arrivalTime: '13:15 +1',
        durationMinutes: 645,
        stops: 0,
        stopsDescription: 'Nonstop (Direct Lufthansa Flight)',
        aircraft: 'Boeing 747-8',
        availableSeats: {
          first: 2,
          business: 8,
          premiumEconomy: 14,
          economy: 42,
        },
        arrivalDeltaMinutes: 155,
        rankingScore: 94,
        rankingReason: 'Same operating carrier next scheduled service, keeps passenger in booked First/Business cabin with zero interline fee.',
        pros: [
          'Direct nonstop flight on Lufthansa Boeing 747-8',
          'Ample First and Business class seats available',
          'Departs from same SFO Terminal G gate',
        ],
        cons: [
          'Departure delayed by 2.5 hours',
        ],
        estimatedAirlineCost: {
          interlineProrate: 0,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 45,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-UA926',
        rank: 2,
        flightNumber: 'UA 926',
        airline: 'United Airlines',
        alliance: 'Star Alliance Partner',
        isPartner: true,
        origin: 'SFO',
        destination: 'FRA',
        departureTime: '19:00 Today',
        arrivalTime: '15:10 +1',
        durationMinutes: 610,
        stops: 0,
        stopsDescription: 'Nonstop (Star Alliance Partner)',
        aircraft: 'Boeing 777-200ER',
        availableSeats: {
          first: 0,
          business: 5,
          premiumEconomy: 9,
          economy: 28,
        },
        arrivalDeltaMinutes: 270,
        rankingScore: 89,
        rankingReason: 'Star Alliance transatlantic joint venture routing, seamless luggage through-check, Polaris Business suites.',
        pros: [
          'Star Alliance joint venture revenue sharing (low proration penalty)',
          'Polaris Business class flat-bed available',
        ],
        cons: [
          'Arrives late afternoon next day',
        ],
        estimatedAirlineCost: {
          interlineProrate: 180,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 225,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-LX039',
        rank: 3,
        flightNumber: 'LX 039 / LH 1195',
        airline: 'SWISS / Lufthansa',
        alliance: 'Star Alliance Partner',
        isPartner: true,
        origin: 'SFO',
        destination: 'FRA',
        departureTime: '19:45 Today',
        arrivalTime: '17:20 +1',
        durationMinutes: 695,
        stops: 1,
        stopsDescription: '1 Stop via ZRH (Zurich)',
        aircraft: 'Boeing 777-300ER',
        availableSeats: {
          first: 1,
          business: 4,
          premiumEconomy: 6,
          economy: 22,
        },
        arrivalDeltaMinutes: 400,
        rankingScore: 78,
        rankingReason: 'Star Alliance group backup routing through Zurich hub with quick 50 min feeder to Frankfurt.',
        pros: [
          'High quality SWISS Business class service',
          'Reliable European transit through Zurich',
        ],
        cons: [
          'Adds intermediate stop in Zurich',
          'Arrives 6.6 hours later than original schedule',
        ],
        estimatedAirlineCost: {
          interlineProrate: 120,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 165,
        },
        validationStatus: 'VALIDATED',
      },
    ];
  } else if (flight.origin.code === 'SFO' && flight.destination.code === 'SIN') {
    rawCandidates = [
      {
        id: 'OPT-SQ033',
        rank: 1,
        flightNumber: 'SQ 033',
        airline: 'Singapore Airlines',
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: 'SFO',
        destination: 'SIN',
        departureTime: '21:30 Today',
        arrivalTime: '05:30 +2',
        durationMinutes: 1020,
        stops: 0,
        stopsDescription: 'Nonstop (Direct Singapore Airlines)',
        aircraft: 'Airbus A350-900ULR',
        availableSeats: {
          first: 0,
          business: 6,
          premiumEconomy: 14,
          economy: 0,
        },
        arrivalDeltaMinutes: 620,
        rankingScore: 94,
        rankingReason: 'Same operating carrier evening departure, ultra-long haul direct routing, lie-flat Business product.',
        pros: [
          'Nonstop routing avoiding connections',
          'World-class Singapore Airlines service',
          'Zero interline cost to carrier',
        ],
        cons: [
          'Departure is 10 hours later in the evening',
        ],
        estimatedAirlineCost: {
          interlineProrate: 0,
          hotelVoucher: 150,
          mealVoucher: 45,
          total: 195,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-UA001',
        rank: 2,
        flightNumber: 'UA 001',
        airline: 'United Airlines',
        alliance: 'Star Alliance Partner',
        isPartner: true,
        origin: 'SFO',
        destination: 'SIN',
        departureTime: '23:10 Today',
        arrivalTime: '06:55 +2',
        durationMinutes: 1005,
        stops: 0,
        stopsDescription: 'Nonstop (Star Alliance Partner)',
        aircraft: 'Boeing 787-9',
        availableSeats: {
          first: 0,
          business: 4,
          premiumEconomy: 10,
          economy: 45,
        },
        arrivalDeltaMinutes: 705,
        rankingScore: 87,
        rankingReason: 'Direct Star Alliance partner nonstop departing SFO Terminal G, Polaris Business suites.',
        pros: [
          'Direct nonstop flight',
          'Star Alliance baggage check',
        ],
        cons: [
          'Departs late night',
          'Interline fee applies',
        ],
        estimatedAirlineCost: {
          interlineProrate: 240,
          hotelVoucher: 150,
          mealVoucher: 45,
          total: 435,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-NH007-SQ',
        rank: 3,
        flightNumber: 'NH 007 / SQ 637',
        airline: 'ANA / Singapore Airlines',
        alliance: 'Star Alliance Partner',
        isPartner: true,
        origin: 'SFO',
        destination: 'SIN',
        departureTime: '12:00 Today',
        arrivalTime: '23:45 +1',
        durationMinutes: 1065,
        stops: 1,
        stopsDescription: '1 Stop via NRT (Tokyo)',
        aircraft: 'Boeing 777-300ER',
        availableSeats: {
          first: 1,
          business: 3,
          premiumEconomy: 6,
          economy: 20,
        },
        arrivalDeltaMinutes: 275,
        rankingScore: 81,
        rankingReason: 'Earliest arrival option via Tokyo Narita connection.',
        pros: [
          'Arrives same day night (only 4.5 hours delta)',
          'High quality Star Alliance Japanese transit',
        ],
        cons: [
          '1 intermediate stop required in Tokyo',
        ],
        estimatedAirlineCost: {
          interlineProrate: 290,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 335,
        },
        validationStatus: 'VALIDATED',
      },
    ];
  } else {
    // Generic high-quality alternatives for other routes
    rawCandidates = [
      {
        id: 'OPT-GEN-01',
        rank: 1,
        flightNumber: `${flight.airline.slice(0, 2).toUpperCase()} 942`,
        airline: flight.airline,
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: flight.origin.code,
        destination: flight.destination.code,
        departureTime: 'Next Day 08:30',
        arrivalTime: 'Next Day 18:45',
        durationMinutes: 615,
        stops: 0,
        stopsDescription: 'Nonstop (Direct Morning Flight)',
        aircraft: flight.aircraftType,
        availableSeats: {
          first: 2,
          business: 7,
          premiumEconomy: 15,
          economy: 64,
        },
        arrivalDeltaMinutes: 480,
        rankingScore: 91,
        rankingReason: 'Next direct service on operating carrier, high seat availability, keeps passenger in booked cabin.',
        pros: [
          'Direct nonstop flight on same carrier',
          'Ample seat availability in all cabins',
          'Includes hotel and meal allowance vouchers',
        ],
        cons: [
          'Requires overnight hotel stay in departure city',
        ],
        estimatedAirlineCost: {
          interlineProrate: 0,
          hotelVoucher: 220,
          mealVoucher: 45,
          total: 265,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-GEN-02',
        rank: 2,
        flightNumber: 'STAR 812',
        airline: 'Alliance Partner Airlines',
        alliance: 'Star Alliance Partner',
        isPartner: true,
        origin: flight.origin.code,
        destination: flight.destination.code,
        departureTime: 'Today 23:45',
        arrivalTime: 'Next Day 14:15',
        durationMinutes: 570,
        stops: 0,
        stopsDescription: 'Nonstop (Late Night Red-Eye)',
        aircraft: 'Airbus A350-900',
        availableSeats: {
          first: 0,
          business: 3,
          premiumEconomy: 5,
          economy: 22,
        },
        arrivalDeltaMinutes: 240,
        rankingScore: 87,
        rankingReason: 'Fastest overall arrival (+4 hours), avoids hotel stay expenses by flying overnight.',
        pros: [
          'Flies tonight, saving hotel accommodation costs',
          'Nonstop routing to destination',
        ],
        cons: [
          'Interline fee applies',
          'Late night departure requires prompt passenger gate transfer',
        ],
        estimatedAirlineCost: {
          interlineProrate: 320,
          hotelVoucher: 0,
          mealVoucher: 45,
          total: 365,
        },
        validationStatus: 'VALIDATED',
      },
      {
        id: 'OPT-GEN-03',
        rank: 3,
        flightNumber: `${flight.airline.slice(0, 2).toUpperCase()} 144 / 88`,
        airline: flight.airline,
        alliance: 'Operating Carrier',
        isPartner: false,
        origin: flight.origin.code,
        destination: flight.destination.code,
        departureTime: 'Next Day 06:15',
        arrivalTime: 'Next Day 17:30',
        durationMinutes: 675,
        stops: 1,
        stopsDescription: '1 Stop via Domestic Hub',
        aircraft: 'Boeing 787-8',
        availableSeats: {
          first: 1,
          business: 4,
          premiumEconomy: 10,
          economy: 52,
        },
        arrivalDeltaMinutes: 410,
        rankingScore: 79,
        rankingReason: 'Early morning departure with wide economy seat availability.',
        pros: [
          'Departs early morning with high on-time reliability',
          'Good availability for leisure and economy passengers',
        ],
        cons: [
          '1 intermediate stop connection required',
          'Requires morning transit',
        ],
        estimatedAirlineCost: {
          interlineProrate: 0,
          hotelVoucher: 220,
          mealVoucher: 45,
          total: 265,
        },
        validationStatus: 'VALIDATED',
      },
    ];
  }

  // Ensure all options have financial data
  const targetPaxPrice = passenger?.ticketPrice || (passenger?.cabinClass === 'Business' ? 2850 : passenger?.cabinClass === 'First' ? 4650 : 720);

  rawCandidates = rawCandidates.map((opt) => {
    let score = opt.rankingScore;
    const reasons: string[] = [];

    // Cabin check
    const hasCabin =
      requestedCabin === 'First'
        ? opt.availableSeats.first > 0
        : requestedCabin === 'Business'
        ? opt.availableSeats.business > 0
        : requestedCabin === 'Premium Economy'
        ? opt.availableSeats.premiumEconomy > 0
        : opt.availableSeats.economy > 0;

    if (!hasCabin) {
      score -= 20;
      reasons.push(`Cabin mismatch (${requestedCabin} sold out)`);
    } else {
      reasons.push(`Guarantees booked ${requestedCabin} cabin`);
    }

    if (passenger) {
      // Loyalty priority
      if (passenger.loyaltyTier === 'Executive Platinum' && opt.stops === 0) {
        score += 5;
        reasons.push('Prioritized nonstop for Executive Platinum flyer');
      }

      // Connecting flight protection
      if (passenger.onwardConnection) {
        if (opt.arrivalDeltaMinutes < 180) {
          score += 10;
          reasons.push(`Protects onward flight to ${passenger.onwardConnection.destination}`);
        } else {
          score -= 10;
          reasons.push(`Requires rebooking secondary onward connection`);
        }
      }
    }

    const retailPrice = opt.retailMarketFare || (requestedCabin === 'First' ? 4850 : requestedCabin === 'Business' ? (opt.isPartner ? 3420 : 3150) : requestedCabin === 'Premium Economy' ? 1450 : 780);
    const savings = Math.max(0, targetPaxPrice - opt.estimatedAirlineCost.total);

    return {
      ...opt,
      retailMarketFare: retailPrice,
      passengerCost: 0,
      estimatedAirlineCost: {
        ...opt.estimatedAirlineCost,
        savingsVsInvoluntaryRefund: savings,
      },
      rankingScore: Math.min(99, Math.max(40, score)),
      rankingReason: reasons.length > 0 ? reasons.join(' · ') : opt.rankingReason,
    };
  });

  // Sort by revised score
  rawCandidates.sort((a, b) => b.rankingScore - a.rankingScore);
  rawCandidates.forEach((opt, idx) => {
    opt.rank = idx + 1;
  });

  activities.push({
    id: `ACT-REB-03-${Date.now()}`,
    agent: 'Rebooking Agent',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    status: 'completed',
    title: 'Evaluated 14 Flight Combinations: Top 3 Options Ranked',
    details: `Multi-attribute optimization applied factoring arrival delta, seat inventory, nonstop routing, ${requestedCabin} cabin protection, and airline cost liability ($${rawCandidates[0]?.estimatedAirlineCost.total}).`,
    metrics: [
      { label: 'Rank 1 Option', value: `${rawCandidates[0]?.flightNumber} (${rawCandidates[0]?.rankingScore}/100)` },
      { label: 'Delta to Sched', value: `+${rawCandidates[0]?.arrivalDeltaMinutes}m` },
      { label: 'Airline Net Cost', value: `$${rawCandidates[0]?.estimatedAirlineCost.total}` },
      { label: 'Passenger Cost', value: '$0.00 (Waived)' },
    ],
    durationMs: 310,
  });

  return {
    activities,
    options: rawCandidates,
  };
}

/**
 * Validation Agent
 * Checks minimum connection time (MCT), ticket coupon status, SSRs
 */
export function runValidationAgent(
  option: RebookingOption,
  passenger?: Passenger
): {
  activities: AgentActivity[];
  isValid: boolean;
  notes: string[];
} {
  const activities: AgentActivity[] = [];
  const notes: string[] = [];

  notes.push('Ticket coupon status verified: COUPON 1 OPEN for involuntary exchange.');
  notes.push(`Baggage transfer: ${passenger?.bagsChecked || 1} checked bags assigned new IATA barcode manifest.`);

  if (passenger?.specialNeeds && passenger.specialNeeds.length > 0) {
    notes.push(`Special Service Request (SSR) preserved: ${passenger.specialNeeds.join(', ')} transferred to ${option.flightNumber}.`);
  }

  if (option.stops > 0) {
    notes.push('MCT Check: Intermediate hub connection meets 60 min international standard.');
  }

  activities.push({
    id: `ACT-VAL-04-${Date.now()}`,
    agent: 'Validation Agent',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    status: 'completed',
    title: `Pre-Ticketing Validation: Passed for ${option.flightNumber}`,
    details: `MCT confirmed. SSR assistance mapped. E-ticket coupon validated under endorsement ${option.validationStatus}. Ready for human dispatcher approval.`,
    metrics: [
      { label: 'MCT Check', value: 'Compliant' },
      { label: 'SSR Carryover', value: passenger?.specialNeeds?.length ? 'Transferred' : 'None' },
      { label: 'E-Ticket Status', value: 'Ready for Reissue' },
    ],
    durationMs: 120,
  });

  return {
    activities,
    isValid: true,
    notes,
  };
}

/**
 * Notification Agent
 * Builds personalized passenger notification payload
 */
export function runNotificationAgent(
  flight: Flight,
  passenger: Passenger,
  option: RebookingOption,
  policy: PolicyEvaluation
): {
  activities: AgentActivity[];
  notification: SimulatedNotification;
} {
  const activities: AgentActivity[] = [];

  const hotelCode = policy.dutyOfCare.hotelVoucherEligible
    ? `HTL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    : undefined;
  const mealCode = policy.dutyOfCare.mealVoucherEligible
    ? `MEAL-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    : undefined;
  const ticketCode = `ETKT-016-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  const body = `Dear ${passenger.firstName} ${passenger.lastName},

Due to an irregular operations disruption on flight ${flight.flightNumber}, you have been rebooked on ${option.airline} flight ${option.flightNumber} departing ${option.origin} at ${option.departureTime} and arriving ${option.destination} at ${option.arrivalTime}.

Your seat assignment: Confirmed in ${passenger.cabinClass}.
E-Ticket: ${ticketCode}
PNR Locator: ${passenger.pnr}

Electronic Invoice / Receipt:
• Original Ticket Fare: $${(passenger.ticketPrice || 2850).toLocaleString()}.00 USD (Exchanged)
• Involuntary Reissue Fee: $0.00 USD (Waived under ${policy.waiverCode})
• Additional Collection: $0.00 USD

Duty of Care Entitlements:
${mealCode ? `• Terminal Dining Card: $${policy.dutyOfCare.mealVoucherAmount}.00 (Code: ${mealCode})` : ''}
${hotelCode ? `• Hotel Lodging Voucher: Marriott Airport Gateway (Voucher: ${hotelCode})` : ''}
${passenger.bagsChecked > 0 ? `• Baggage: ${passenger.bagsChecked} bags automatically rerouted to ${option.flightNumber}.` : ''}

To view live gate info and download your updated boarding pass, open the mobile app or visit our hub service desk.`;

  const notification: SimulatedNotification = {
    channel: 'MULTICHANNEL',
    recipientName: `${passenger.firstName} ${passenger.lastName}`,
    recipientContact: `${passenger.phone} / ${passenger.email}`,
    subject: `Important Update: Your New Itinerary for ${flight.flightNumber} -> ${option.flightNumber}`,
    body,
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    billingReceipt: {
      originalFare: passenger.ticketPrice || 2850,
      exchangeFee: 0,
      fareDifferenceCharged: 0,
      totalChargedToPax: 0,
    },
    voucherCodes: {
      hotel: hotelCode,
      meal: mealCode,
      eTicket: ticketCode,
    },
    rebookedFlightSummary: `${option.flightNumber} (${option.origin} -> ${option.destination}) departing ${option.departureTime}`,
  };

  activities.push({
    id: `ACT-NOT-05-${Date.now()}`,
    agent: 'Notification Agent',
    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    status: 'completed',
    title: `Simulated Multi-Channel Notification Dispatched`,
    details: `SMS broadcast sent to ${passenger.phone}. HTML e-ticket dispatched to ${passenger.email}. Push notification issued to airline native mobile app with barcode credentials.`,
    metrics: [
      { label: 'Channels', value: 'SMS + Email + App Push' },
      { label: 'E-Ticket Ref', value: ticketCode },
      { label: 'Meal Credit', value: mealCode || 'N/A' },
      { label: 'Hotel Voucher', value: hotelCode || 'N/A' },
    ],
    durationMs: 95,
  });

  return {
    activities,
    notification,
  };
}
