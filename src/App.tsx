import React, { useState, useEffect } from 'react';
import {
  Flight,
  Passenger,
  DisruptionEvent,
  DisruptionType,
  DisruptionSeverity,
  RecoveryCase,
  AgentActivity,
  RebookingOption,
  SimulatedNotification,
  ActivePage,
} from './types';
import { INITIAL_FLIGHTS, MOCK_DISRUPTIONS } from './data/mockFlights';
import {
  runDisruptionDetectionAgent,
  runPolicyAgent,
  runRebookingAgent,
  runValidationAgent,
  runNotificationAgent,
} from './services/agentEngine';
import { Header } from './components/Header';
import { NotificationModal } from './components/NotificationModal';
import { SimulationControlsModal } from './components/SimulationControlsModal';
import { FlightsPage } from './pages/FlightsPage';
import { DisruptionPage } from './pages/DisruptionPage';
import { PolicyPage } from './pages/PolicyPage';
import { RebookingPage } from './pages/RebookingPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { AgentsPage } from './pages/AgentsPage';

export default function App() {
  // Page Routing State
  const [activePage, setActivePage] = useState<ActivePage>('flights');

  // Flight & Disruption State
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [selectedFlightId, setSelectedFlightId] = useState<string>('FL-UA882');
  const [selectedHub, setSelectedHub] = useState<string>('ALL');

  // Active Recovery Case State
  const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null);
  const [currentCase, setCurrentCase] = useState<RecoveryCase | null>(null);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('OPT-UA901');

  // Modals
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  // Active selected flight
  const selectedFlight = flights.find((f) => f.id === selectedFlightId) || flights[0];

  // Active selected passenger (if specific passenger is selected)
  const selectedPassenger = selectedPassengerId
    ? selectedFlight.passengers.find((p) => p.id === selectedPassengerId)
    : undefined;

  // Run the multi-agent pipeline when selected flight or selected passenger changes
  const executeRecoveryPipeline = (
    flight: Flight,
    disruptionEvent?: DisruptionEvent,
    passenger?: Passenger
  ) => {
    // 1. Detection Agent
    const activeDisr =
      disruptionEvent ||
      (flight.activeDisruptionId ? MOCK_DISRUPTIONS[flight.activeDisruptionId] : null) || {
        id: `DISR-${flight.flightNumber.replace(/\s+/g, '')}-AUTO`,
        flightId: flight.id,
        type: flight.status === 'CANCELLED' ? 'CANCELLATION' : 'LONG_DELAY',
        severity: flight.status === 'CANCELLED' ? 'CRITICAL' : 'HIGH',
        triggerTimestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
        rootCause: flight.weatherCondition || 'Unscheduled Operational Disruption',
        description: `Operational event flagged for ${flight.flightNumber}. Automatic recovery workflow initiated.`,
        affectedPassengerCount: flight.passengerCount,
        connectionRiskCount: flight.connectionCount,
        crewDutyExceeded: flight.crewDutyRemainingMinutes < 60,
        estimatedDelayMinutes: flight.delayMinutes || 240,
      };

    const detRes = runDisruptionDetectionAgent(flight, activeDisr);

    // 2. Policy Agent
    const polRes = runPolicyAgent(flight, activeDisr, passenger);

    // 3. Rebooking Agent
    const rebRes = runRebookingAgent(flight, activeDisr, passenger);

    // 4. Validation Agent on Top Ranked Option
    const topOption = rebRes.options[0];
    const valRes = topOption
      ? runValidationAgent(topOption, passenger)
      : { activities: [], isValid: true, notes: [] };

    // Combine all agent activities
    const allActivities: AgentActivity[] = [
      ...detRes.activities,
      ...polRes.activities,
      ...rebRes.activities,
      ...valRes.activities,
    ];

    setAgentActivities(allActivities);

    const initialCase: RecoveryCase = {
      id: `CASE-${activeDisr.id}`,
      flightId: flight.id,
      disruption: activeDisr,
      policyResult: polRes.policyResult,
      rebookingOptions: rebRes.options,
      selectedOptionId: topOption?.id || '',
      status: 'AWAITING_APPROVAL',
      selectedPassengerId: passenger?.id,
    };

    setCurrentCase(initialCase);
    setSelectedOptionId(topOption?.id || '');
  };

  // Run on mount or when selected flight changes
  useEffect(() => {
    if (selectedFlight) {
      executeRecoveryPipeline(selectedFlight, undefined, selectedPassenger);
    }
  }, [selectedFlightId, selectedPassengerId]);

  // Handle manual option selection change by human operator
  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    if (currentCase) {
      const chosenOpt = currentCase.rebookingOptions.find((o) => o.id === optionId);
      if (chosenOpt) {
        const valRes = runValidationAgent(chosenOpt, selectedPassenger);
        setAgentActivities((prev) => [...valRes.activities, ...prev]);
        setCurrentCase({
          ...currentCase,
          selectedOptionId: optionId,
        });
      }
    }
  };

  // Step 5: Human Approval
  const handleApproveRebooking = (notes: string) => {
    if (!currentCase || !selectedFlight) return;

    const chosenOption = currentCase.rebookingOptions.find(
      (o) => o.id === selectedOptionId
    );
    if (!chosenOption) return;

    // Run Notification Agent
    const targetPassenger = selectedPassenger || selectedFlight.passengers[0] || {
      id: 'PAX-BULK',
      pnr: 'BULK99',
      firstName: 'Primary',
      lastName: 'Passenger',
      email: 'traveler@care.airline.com',
      phone: '+1 800 555 0199',
      cabinClass: 'Business',
      fareClass: 'J',
      loyaltyTier: 'Executive Platinum',
      loyaltyNumber: 'UA-99823101',
      seat: '4A',
      bagsChecked: 2,
      bookingStatus: 'Disrupted',
    };

    const notifRes = runNotificationAgent(
      selectedFlight,
      targetPassenger,
      chosenOption,
      currentCase.policyResult
    );

    setAgentActivities((prev) => [...notifRes.activities, ...prev]);

    // Update flight passengers state
    const updatedFlights = flights.map((fl) => {
      if (fl.id === selectedFlight.id) {
        return {
          ...fl,
          passengers: fl.passengers.map((p) => {
            if (!selectedPassengerId || p.id === selectedPassengerId) {
              return {
                ...p,
                bookingStatus: 'Rebooked' as const,
                currentAssignedOptionId: chosenOption.id,
                rebookedFlightNumber: chosenOption.flightNumber,
              };
            }
            return p;
          }),
        };
      }
      return fl;
    });

    setFlights(updatedFlights);

    const updatedCase: RecoveryCase = {
      ...currentCase,
      status: 'APPROVED',
      approvedBy: 'OCC-DISPATCHER-7814',
      approvalTimestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      agentReviewNote: notes,
      simulatedNotification: notifRes.notification,
    };

    setCurrentCase(updatedCase);
    setIsNotificationModalOpen(true);
  };

  // Handle Case Escalation
  const handleEscalateCase = (reason: string) => {
    if (!currentCase || !selectedFlight) return;

    const escalationActivity: AgentActivity = {
      id: `ACT-ESC-${Date.now()}`,
      agent: 'Validation Agent',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      status: 'action_required',
      title: 'Case Escalated to Duty Manager / Specialty Desk',
      details: `Dispatcher requested manual escalation: "${reason}". Partner interline billing exception flagged.`,
      metrics: [
        { label: 'Action', value: 'Escalated' },
        { label: 'Desk', value: 'Duty Manager' },
        { label: 'Case Status', value: 'Pending Review' },
      ],
      durationMs: 80,
    };

    setAgentActivities((prev) => [escalationActivity, ...prev]);

    const updatedFlights = flights.map((fl) => {
      if (fl.id === selectedFlight.id) {
        return {
          ...fl,
          passengers: fl.passengers.map((p) => {
            if (!selectedPassengerId || p.id === selectedPassengerId) {
              return {
                ...p,
                bookingStatus: 'Escalated' as const,
              };
            }
            return p;
          }),
        };
      }
      return fl;
    });

    setFlights(updatedFlights);

    setCurrentCase({
      ...currentCase,
      status: 'ESCALATED',
      agentReviewNote: reason,
    });
  };

  // Handle Involuntary Full Refund
  const handleIssueRefund = () => {
    if (!currentCase || !selectedFlight) return;

    const refundActivity: AgentActivity = {
      id: `ACT-REF-${Date.now()}`,
      agent: 'Policy Agent',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      status: 'completed',
      title: 'Full Involuntary Refund Processed',
      details: 'DOT 14 CFR Part 259 statutory full cash refund triggered. 100% of original ticket value refunded without cancellation penalty.',
      metrics: [
        { label: 'Refund Amount', value: '100% Cash / Original Card' },
        { label: 'Penalty Waived', value: '$0.00' },
        { label: 'Coupons Status', value: 'VOID_INVOL_REFUND' },
      ],
      durationMs: 110,
    };

    setAgentActivities((prev) => [refundActivity, ...prev]);

    const updatedFlights = flights.map((fl) => {
      if (fl.id === selectedFlight.id) {
        return {
          ...fl,
          passengers: fl.passengers.map((p) => {
            if (!selectedPassengerId || p.id === selectedPassengerId) {
              return {
                ...p,
                bookingStatus: 'Refunded' as const,
              };
            }
            return p;
          }),
        };
      }
      return fl;
    });

    setFlights(updatedFlights);

    setCurrentCase({
      ...currentCase,
      status: 'REFUNDED',
    });
  };

  // Trigger New Simulated Disruption
  const handleTriggerDisruption = (
    flightId: string,
    type: DisruptionType,
    severity: DisruptionSeverity,
    rootCause: string,
    description: string,
    estimatedDelayMinutes: number
  ) => {
    const updatedFlights = flights.map((f) => {
      if (f.id === flightId) {
        return {
          ...f,
          status: (type === 'CANCELLATION' ? 'CANCELLED' : 'DELAYED') as any,
          delayMinutes: estimatedDelayMinutes,
          estimatedDeparture:
            type === 'CANCELLATION'
              ? 'Cancelled'
              : `+${Math.floor(estimatedDelayMinutes / 60)}h ${estimatedDelayMinutes % 60}m`,
          estimatedArrival: type === 'CANCELLATION' ? 'Cancelled' : 'Delayed Next Day',
          weatherCondition: rootCause,
        };
      }
      return f;
    });

    setFlights(updatedFlights);
    setSelectedFlightId(flightId);

    const newDisruption: DisruptionEvent = {
      id: `DISR-${flightId}-${Date.now().toString().slice(-4)}`,
      flightId,
      type,
      severity,
      triggerTimestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) + ' UTC',
      rootCause,
      description,
      affectedPassengerCount:
        type === 'AIRCRAFT_CHANGE' ? 68 : selectedFlight?.passengerCount || 312,
      connectionRiskCount: Math.round((selectedFlight?.connectionCount || 80) * 0.6),
      crewDutyExceeded: type === 'CANCELLATION' || estimatedDelayMinutes >= 300,
      estimatedDelayMinutes,
      atcOrNoticeCode: `NOTAM-SIM-${type.slice(0, 3)}`,
    };

    const targetFlight = updatedFlights.find((f) => f.id === flightId) || selectedFlight;
    executeRecoveryPipeline(targetFlight, newDisruption, selectedPassenger);
    setActivePage('disruption');
  };

  // Reset to initial baseline
  const handleResetData = () => {
    setFlights(INITIAL_FLIGHTS);
    setSelectedFlightId('FL-UA882');
    setSelectedPassengerId(null);
    executeRecoveryPipeline(INITIAL_FLIGHTS[0]);
    setActivePage('flights');
  };

  // Autonomous Agentic Fast-Track: Takes user straight to Step 5 (Human Approval) for Platinum Passenger
  const handleAgenticFastTrack = () => {
    const targetFlight = flights.find((f) => f.id === 'FL-UA882') || selectedFlight;
    setSelectedFlightId(targetFlight.id);

    // Locate Executive Platinum / Platinum passenger (e.g. Elena Vance)
    const platinumPax = targetFlight.passengers.find(
      (p) => p.loyaltyTier === 'Executive Platinum' || p.loyaltyTier === 'Platinum'
    ) || targetFlight.passengers[0];

    if (platinumPax) {
      setSelectedPassengerId(platinumPax.id);
      executeRecoveryPipeline(targetFlight, undefined, platinumPax);
    } else {
      executeRecoveryPipeline(targetFlight);
    }

    // Jump straight to the last step: Human-in-the-Loop Approval
    setActivePage('approval');
  };

  const activeDisruptionCount = flights.filter((f) => f.status !== 'ON_TIME').length;
  const totalMonitoredFlights = flights.length;
  const totalAffectedPax = flights
    .filter((f) => f.status !== 'ON_TIME')
    .reduce((sum, f) => sum + f.passengerCount, 0);

  const activeOption = currentCase?.rebookingOptions.find(
    (o) => o.id === selectedOptionId
  ) || currentCase?.rebookingOptions[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar with Page Navigation Links */}
      <Header
        activePage={activePage}
        onNavigate={setActivePage}
        activeDisruptionCount={activeDisruptionCount}
        totalMonitoredFlights={totalMonitoredFlights}
        totalAffectedPax={totalAffectedPax}
        onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
        onResetData={handleResetData}
        onAgenticFastTrack={handleAgenticFastTrack}
      />

      {/* Main Page Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PAGE 1: Flights Overview */}
        {activePage === 'flights' && (
          <FlightsPage
            flights={flights}
            selectedFlightId={selectedFlightId}
            onSelectFlight={(id) => {
              setSelectedFlightId(id);
              setSelectedPassengerId(null);
              setActivePage('disruption');
            }}
            selectedHub={selectedHub}
            onSelectHub={setSelectedHub}
            onNavigate={setActivePage}
            onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
            onAgenticFastTrack={handleAgenticFastTrack}
          />
        )}

        {/* PAGE 2: Disruption Detection & Passenger Manifest */}
        {activePage === 'disruption' && currentCase && (
          <DisruptionPage
            flight={selectedFlight}
            disruption={currentCase.disruption}
            workflowStage={currentCase.status}
            selectedPassengerId={selectedPassengerId}
            onSelectPassenger={setSelectedPassengerId}
            onNavigate={setActivePage}
            onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
          />
        )}

        {/* PAGE 3: Policy Agent Evaluation */}
        {activePage === 'policy' && currentCase && (
          <PolicyPage
            flight={selectedFlight}
            policy={currentCase.policyResult}
            selectedPassenger={selectedPassenger}
            workflowStage={currentCase.status}
            onNavigate={setActivePage}
          />
        )}

        {/* PAGE 4: Rebooking Options */}
        {activePage === 'rebooking' && currentCase && (
          <RebookingPage
            flight={selectedFlight}
            options={currentCase.rebookingOptions}
            selectedOptionId={selectedOptionId}
            onSelectOption={handleSelectOption}
            selectedPassenger={selectedPassenger}
            workflowStage={currentCase.status}
            onNavigate={setActivePage}
          />
        )}

        {/* PAGE 5: Human Operations Approval */}
        {activePage === 'approval' && currentCase && (
          <ApprovalPage
            flight={selectedFlight}
            selectedOption={activeOption}
            selectedPassenger={selectedPassenger}
            policy={currentCase.policyResult}
            simulatedNotification={currentCase.simulatedNotification}
            workflowStage={currentCase.status}
            onApproveRebooking={handleApproveRebooking}
            onEscalateCase={handleEscalateCase}
            onIssueRefund={handleIssueRefund}
            onViewNotificationModal={() => setIsNotificationModalOpen(true)}
            onNavigate={setActivePage}
            totalPassengersImpacted={currentCase.disruption.affectedPassengerCount}
          />
        )}

        {/* PAGE 6: Collaborating Agent Activity Stream */}
        {activePage === 'agents' && (
          <AgentsPage
            flight={selectedFlight}
            activities={agentActivities}
            workflowStage={currentCase?.status}
            onNavigate={setActivePage}
            onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
          />
        )}
      </main>

      {/* Simulation Modal (accessible globally from header and pages) */}
      <SimulationControlsModal
        flights={flights}
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        onTriggerDisruption={handleTriggerDisruption}
      />

      {/* Passenger Notification & Boarding Pass Modal */}
      {isNotificationModalOpen && currentCase?.simulatedNotification && (
        <NotificationModal
          notification={currentCase.simulatedNotification}
          passenger={selectedPassenger}
          rebookingOption={activeOption}
          onClose={() => setIsNotificationModalOpen(false)}
        />
      )}
    </div>
  );
}
