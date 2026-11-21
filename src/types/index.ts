export type ActivePage = 'flights' | 'disruption' | 'policy' | 'rebooking' | 'approval' | 'agents';

export type FlightStatus = 'ON_TIME' | 'DELAYED' | 'CANCELLED' | 'DIVERTED' | 'GROUND_STOP';

export type DisruptionType = 
  | 'CANCELLATION' 
  | 'LONG_DELAY' 
  | 'MISSED_CONNECTION' 
  | 'AIRCRAFT_CHANGE' 
  | 'AIRPORT_CLOSURE';

export type DisruptionSeverity = 'MODERATE' | 'HIGH' | 'CRITICAL';

export type LoyaltyTier = 'Executive Platinum' | 'Platinum' | 'Gold' | 'Member';

export type CabinClass = 'First' | 'Business' | 'Premium Economy' | 'Economy';

export interface Airport {
  code: string;
  name: string;
  city: string;
  terminal?: string;
  gate?: string;
  timezone: string;
}

export interface OnwardConnection {
  flightNumber: string;
  airline: string;
  destination: string;
  scheduledDeparture: string;
  connectionTimeMinutes: number;
  minimumConnectionTimeMinutes: number;
  isAtRisk: boolean;
}

export interface Passenger {
  id: string;
  pnr: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cabinClass: CabinClass;
  fareClass: string;
  loyaltyTier: LoyaltyTier;
  loyaltyNumber: string;
  seat: string;
  bagsChecked: number;
  ticketPrice?: number;
  changeFeeWaivedAmount?: number;
  fareDifferenceAbsorbed?: number;
  onwardConnection?: OnwardConnection;
  specialNeeds?: string[]; // e.g. ['WCHR', 'VGML', 'UMNR']
  bookingStatus: 'Confirmed' | 'Disrupted' | 'Rebooked' | 'Escalated' | 'Refunded';
  currentAssignedOptionId?: string;
  rebookedFlightNumber?: string;
}

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  aircraftType: string;
  tailNumber: string;
  origin: Airport;
  destination: Airport;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  status: FlightStatus;
  delayMinutes: number;
  passengerCount: number;
  capacity: number;
  connectionCount: number;
  crewDutyRemainingMinutes: number;
  totalBookedRevenue?: number;
  averageTicketPrice?: number;
  estimatedDisruptionCost?: number;
  weatherCondition?: string;
  activeDisruptionId?: string;
  passengers: Passenger[];
}

export interface DisruptionEvent {
  id: string;
  flightId: string;
  type: DisruptionType;
  severity: DisruptionSeverity;
  triggerTimestamp: string;
  rootCause: string;
  description: string;
  affectedPassengerCount: number;
  connectionRiskCount: number;
  crewDutyExceeded: boolean;
  estimatedDelayMinutes: number;
  atcOrNoticeCode?: string;
  financialExposure?: {
    dutyOfCareCost: number;
    statutoryCompensationRisk: number;
    delayOperationalCost: number;
    totalExposure: number;
  };
}

export interface PolicyClause {
  code: string;
  title: string;
  authority: 'Airline Rule 240' | 'EU261/2004' | 'DOT 14-CFR-259' | 'IATA Res 735d' | 'Alliance Agreement';
  explanation: string;
  actionGranted: string;
}

export interface PolicyEvaluation {
  eligibleForRebooking: boolean;
  permittedDateWindow: {
    start: string;
    end: string;
    description: string;
  };
  partnerAirlinePermitted: boolean;
  partnerAllianceName?: string;
  cabinRule: string;
  changeFeeWaived: boolean;
  waiverCode: string;
  refundEligible: boolean;
  dutyOfCare: {
    hotelVoucherEligible: boolean;
    hotelVoucherAmount: number;
    mealVoucherEligible: boolean;
    mealVoucherAmount: number;
    groundTransportEligible: boolean;
    loungeAccessEligible: boolean;
  };
  financialProtections?: {
    standardChangeFeeWaived: number;
    maxAbsorbedFareDifference: number;
    involuntaryRefundValue: number;
    hotelAllowance: number;
    mealAllowance: number;
    groundTransportAllowance: number;
    downgradeCompensation: number;
  };
  appliedClauses: PolicyClause[];
  plainLanguageSummary: string;
}

export interface RebookingOption {
  id: string;
  rank: number;
  flightNumber: string;
  airline: string;
  alliance: 'Operating Carrier' | 'Star Alliance Partner' | 'Oneworld Partner' | 'SkyTeam Partner' | 'Offline Carrier';
  isPartner: boolean;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  stopsDescription: string;
  aircraft: string;
  retailMarketFare?: number;
  passengerCost?: number;
  availableSeats: {
    first: number;
    business: number;
    premiumEconomy: number;
    economy: number;
  };
  arrivalDeltaMinutes: number; // positive = later, negative = earlier
  rankingScore: number; // 0-100
  rankingReason: string;
  pros: string[];
  cons: string[];
  estimatedAirlineCost: {
    interlineProrate: number;
    hotelVoucher: number;
    mealVoucher: number;
    groundTransfer?: number;
    total: number;
    savingsVsInvoluntaryRefund?: number;
  };
  validationStatus: 'VALIDATED' | 'REQUIRES_SUPERVISOR_OVERRIDE' | 'TIGHT_CONNECTION';
  validationNote?: string;
}

export type AgentRole = 
  | 'Disruption Detection Agent' 
  | 'Policy Agent' 
  | 'Rebooking Agent' 
  | 'Validation Agent' 
  | 'Notification Agent';

export interface AgentActivity {
  id: string;
  agent: AgentRole;
  timestamp: string;
  status: 'thinking' | 'completed' | 'warning' | 'action_required';
  title: string;
  details: string;
  metrics?: { label: string; value: string }[];
  durationMs: number;
}

export interface SimulatedNotification {
  channel: 'SMS' | 'EMAIL' | 'APP_PUSH' | 'MULTICHANNEL';
  recipientName: string;
  recipientContact: string;
  subject: string;
  body: string;
  timestamp: string;
  billingReceipt?: {
    originalFare: number;
    exchangeFee: number;
    fareDifferenceCharged: number;
    totalChargedToPax: number;
  };
  voucherCodes?: {
    hotel?: string;
    meal?: string;
    eTicket?: string;
  };
  rebookedFlightSummary: string;
}

export interface RecoveryCase {
  id: string;
  flightId: string;
  disruption: DisruptionEvent;
  policyResult: PolicyEvaluation;
  rebookingOptions: RebookingOption[];
  selectedOptionId: string;
  status: 'DETECTED' | 'EVALUATING_POLICY' | 'OPTIONS_RANKED' | 'AWAITING_APPROVAL' | 'APPROVED' | 'ESCALATED' | 'REFUNDED';
  selectedPassengerId?: string; // If working on specific passenger or entire flight
  agentReviewNote?: string;
  approvedBy?: string;
  approvalTimestamp?: string;
  simulatedNotification?: SimulatedNotification;
}
