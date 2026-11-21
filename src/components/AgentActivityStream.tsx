import React, { useState } from 'react';
import { AgentActivity } from '../types';
import { Cpu } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface AgentActivityStreamProps {
  activities: AgentActivity[];
}

export const AgentActivityStream: React.FC<AgentActivityStreamProps> = ({ activities }) => {
  const [filterAgent, setFilterAgent] = useState<string>('ALL');

  const filteredActivities = activities.filter((act) => {
    if (filterAgent === 'ALL') return true;
    return act.agent.toLowerCase().includes(filterAgent.toLowerCase());
  });

  const getAgentBadgeStyle = (agent: string) => {
    if (agent.includes('Detection')) return 'text-amber-800 bg-amber-50 border-amber-200';
    if (agent.includes('Policy')) return 'text-indigo-800 bg-indigo-50 border-indigo-200';
    if (agent.includes('Rebooking')) return 'text-sky-800 bg-sky-50 border-sky-200';
    if (agent.includes('Validation')) return 'text-emerald-800 bg-emerald-50 border-emerald-200';
    if (agent.includes('Notification')) return 'text-purple-800 bg-purple-50 border-purple-200';
    return 'text-slate-700 bg-slate-100 border-slate-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700 border border-sky-200">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Agent Activity Timeline
              </h3>
              <span className="text-[11px] font-mono text-sky-700 font-semibold">
                5 AGENTS SYNCHRONIZED
              </span>
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
          {['ALL', 'Detection', 'Policy', 'Rebooking', 'Validation', 'Notification'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterAgent(cat)}
              className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap cursor-pointer ${
                filterAgent === cat
                  ? 'bg-slate-900 text-white font-medium shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Items */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto p-4 space-y-3">
        {filteredActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No agent log entries for selected filter.
          </div>
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded border font-semibold ${getAgentBadgeStyle(
                      act.agent
                    )}`}
                  >
                    {act.agent}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {act.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 shrink-0">
                  <span className="tabular-nums">{act.timestamp}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-sky-700 font-semibold">{act.durationMs}ms</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {act.details}
              </p>

              {/* Metrics */}
              {act.metrics && act.metrics.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-slate-200/60 text-[11px] font-mono text-slate-600">
                  {act.metrics.map((m, midx) => (
                    <div key={midx} className="flex items-center gap-1.5">
                      <span className="text-slate-400">{m.label}:</span>
                      <span className="text-slate-800 font-semibold">{m.value}</span>
                      {midx < act.metrics!.length - 1 && (
                        <span className="text-slate-300 ml-2">/</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
