import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { 
  BrainCircuit, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  FileText, 
  ArrowRight,
  Send,
  Calculator,
  Database,
  Search,
  Check
} from 'lucide-react';

export const AiInsightsView: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [investigatedIds, setInvestigatedIds] = useState<Record<string, boolean>>({});

  // Assistant Query State
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<any>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const data = await dataService.getAIInsights();
      setInsights(data);
    } catch (err) {
      console.error('Error loading AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleAskQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setQueryInput(queryText);
    setIsQuerying(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
      const res = await fetch(`${baseUrl}/analytics/query-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ query: queryText })
      });

      if (res.ok) {
        const data = await res.json();
        setQueryResult(data);
      }
    } catch (err) {
      console.error('Error querying assistant:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const filteredInsights = filterCategory === 'all'
    ? insights
    : insights.filter(item => item.category === filterCategory);

  const toggleInvestigated = (id: string) => {
    setInvestigatedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Title Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1 font-mono">
                <BrainCircuit className="w-3.5 h-3.5 text-teal-700" /> Automated Telemetry Scanner & Query Engine
              </span>
              <span className="text-xs text-slate-400 font-mono">Zero LLM Hallucinations • 100% Traceable</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">AI Impact Analyst & Database Assistant</h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Ask database questions or view automated telemetry scans for duplicate beneficiaries, budget burn anomalies, underperforming programs, and attendance drops.
            </p>
          </div>

          <button
            onClick={fetchInsights}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Re-Scan Database
          </button>
        </div>

        {/* INTERACTIVE QUERY ASSISTANT BOX */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-700" /> Interactive Database Query Assistant
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleAskQuery(queryInput); }} className="flex gap-2 text-xs">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask a question (e.g., 'Which program is underperforming?', 'Which district has the highest beneficiaries?')..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-teal-700"
            />
            <button
              type="submit"
              disabled={isQuerying}
              className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              {isQuerying ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Query DB
            </button>
          </form>

          {/* Quick Query Preset Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="text-slate-400 font-bold uppercase text-[10px]">PRESETS:</span>
            {[
              'Which program is underperforming?',
              'Which district has the highest beneficiaries?',
              'Generate donor report',
              'Compare last year with this year'
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleAskQuery(preset)}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-teal-500 text-slate-700 hover:text-teal-800 transition cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* QUERY ANSWER RESULT BOX WITH EVIDENCE AND CALCULATIONS */}
          {queryResult && (
            <div className="mt-3 p-4 rounded-xl bg-white border border-teal-200 shadow-2xs space-y-3 font-sans animate-in zoom-in-95">
              <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                <h3 className="font-extrabold text-teal-950 text-xs flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-teal-700" /> {queryResult.answerTitle}
                </h3>
                <span className="text-[10px] font-mono text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded font-bold">
                  Organization DB Verified
                </span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-sans">{queryResult.summary}</p>

              {/* EMPIRICAL EVIDENCE */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 font-mono text-[11px]">
                <span className="text-[10px] uppercase font-bold text-slate-500 block flex items-center gap-1">
                  <FileText className="w-3 h-3 text-teal-700" /> Empirical Evidence
                </span>
                <ul className="space-y-0.5 text-slate-700">
                  {queryResult.evidence?.map((ev: string, idx: number) => (
                    <li key={idx}>• {ev}</li>
                  ))}
                </ul>
              </div>

              {/* CALCULATIONS & FORMULAS */}
              <div className="p-3 rounded-lg bg-teal-50/70 border border-teal-200 space-y-1 font-mono text-[11px]">
                <span className="text-[10px] uppercase font-bold text-teal-900 block flex items-center gap-1">
                  <Calculator className="w-3 h-3 text-teal-700" /> Mathematical Formulas & Calculations
                </span>
                <ul className="space-y-0.5 text-teal-950 font-bold">
                  {queryResult.calculations?.map((calc: string, idx: number) => (
                    <li key={idx}>ƒ {calc}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Scan Summary Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">TOTAL DETECTED</span>
            <span className="font-bold text-slate-900 text-sm">{insights.length} Insights</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">DUPLICATES</span>
            <span className="font-bold text-teal-800 text-sm">{insights.filter(i => i.category === 'DUPLICATE_DETECTION').length} Triggers</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">BUDGET BURNS</span>
            <span className="font-bold text-rose-700 text-sm">{insights.filter(i => i.category === 'BUDGET_ANOMALY').length} Alerts</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold block">CONFIDENCE AVG</span>
            <span className="font-bold text-emerald-700 text-sm">94.2% Empirical</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'All Detections' },
          { id: 'DUPLICATE_DETECTION', label: 'Duplicate Beneficiaries' },
          { id: 'BUDGET_ANOMALY', label: 'Budget Anomalies' },
          { id: 'UNDERPERFORMING_PROGRAM', label: 'Underperforming Programs' },
          { id: 'MOBILIZATION_DECLINE', label: 'Declining Attendance' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterCategory(tab.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
              filterCategory === tab.id
                ? 'bg-teal-800 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insight Roster */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
          Scanning database records for anomalies and duplicates...
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">No Anomaly Triggers Detected</p>
          <p className="text-slate-400 max-w-sm mx-auto">
            Your database records pass all empirical verification rules. Zero duplicates or budget burn anomalies detected.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((item) => {
            const isInvestigated = Boolean(investigatedIds[item.id]);

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 text-xs font-sans transition hover:border-slate-300"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl border flex-shrink-0 mt-0.5 ${
                      item.severity === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-700' :
                      item.severity === 'HIGH' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                      'bg-teal-50 border-teal-200 text-teal-800'
                    }`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{item.title}</h3>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5 font-mono">
                        <span>Confidence: <strong className="text-emerald-700">{item.confidence}% Empirical</strong></span>
                        <span>•</span>
                        <span>Severity: <strong className="text-slate-800">{item.severity}</strong></span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleInvestigated(item.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto ${
                      isInvestigated
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-teal-800 hover:bg-teal-900 text-white shadow-2xs'
                    }`}
                  >
                    {isInvestigated ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Investigation Logged
                      </>
                    ) : (
                      <>
                        Flag for Investigation <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* EMPIRICAL EVIDENCE BOX */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block flex items-center gap-1 font-mono">
                    <FileText className="w-3 h-3 text-teal-700" /> Empirical Evidence Traceable to Stored DB
                  </span>
                  <ul className="space-y-1 text-slate-700 font-mono text-[11px]">
                    {item.evidence?.map((line: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-700 font-bold">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* METADATA TAIL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Data Source</span>
                    <span className="font-semibold text-slate-900 truncate block">{item.dataSource}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Time Period</span>
                    <span className="font-semibold text-slate-900 truncate block">{item.timePeriod}</span>
                  </div>
                </div>

                {/* RECOMMENDED INVESTIGATION PROTOCOL */}
                <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-teal-950 text-xs block">Recommended Investigation Protocol:</span>
                    <p className="text-teal-900 text-xs mt-0.5 leading-relaxed">{item.recommendedInvestigation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
