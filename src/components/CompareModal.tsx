import React from 'react';
import { X, Scale, Sparkles, Trash2 } from 'lucide-react';
import { CAREERS, COURSES } from '../data/mockData';

interface CompareModalProps {
  compareIds: string[];
  onClose: () => void;
  onRemoveFromCompare: (id: string) => void;
  onAskAi: (prompt: string) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  compareIds,
  onClose,
  onRemoveFromCompare,
  onAskAi,
}) => {
  const allItems = [...CAREERS, ...COURSES];
  const items = compareIds.map((id) => allItems.find((it) => it.id === id)).filter(Boolean) as typeof CAREERS;

  if (items.length < 2) return null;

  const handleAskAiToCompare = () => {
    const names = items.map((it) => `"${it.n}" (${it.kind})`).join(' vs ');
    onClose();
    onAskAi(
      `Please provide a comprehensive, side-by-side comparison between: ${names}.
Analyze:
1. Core differences in study intensity & timeline
2. Return on investment, job demand, and stability
3. Who flourishes best in each route
4. Recommended backup strategies for both.`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Comparison Matrix"
    >
      <div
        className="w-full max-w-3xl bg-[#162720] border-t sm:border border-emerald-900/60 rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col text-stone-100 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-emerald-900/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Side-by-Side Comparison</h2>
              <p className="text-[11px] text-stone-400">Comparing {items.length} options</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-emerald-950/60 transition-colors"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Table Matrix */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-4">
          <table className="w-full text-left text-xs border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-emerald-900/60">
                <th className="p-2 text-emerald-400 font-bold uppercase tracking-wider text-[10px] w-28">
                  Feature
                </th>
                {items.map((item) => (
                  <th key={item.id} className="p-2 font-bold text-white text-xs align-top">
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="text-[10px] text-emerald-300/80 font-mono">
                          {item.kind === 'career' ? item.f : item.a}
                        </div>
                        <div className="text-sm font-bold text-white mt-0.5">{item.n}</div>
                      </div>
                      <button
                        onClick={() => onRemoveFromCompare(item.id)}
                        className="text-stone-400 hover:text-rose-400 p-1"
                        title="Remove"
                        aria-label={`Remove ${item.n} from comparison`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/80">
              <tr>
                <td className="p-2 font-semibold text-stone-400 text-[11px] bg-[#12201a]">
                  Study / Work Focus
                </td>
                {items.map((item) => (
                  <td key={item.id} className="p-2 text-stone-200 leading-relaxed align-top">
                    {item.d || item.s}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-2 font-semibold text-stone-400 text-[11px] bg-[#12201a]">
                  Key Skills
                </td>
                {items.map((item) => (
                  <td key={item.id} className="p-2 align-top">
                    <div className="flex flex-wrap gap-1">
                      {item.sk.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#192c24] text-emerald-300 border border-emerald-900"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-2 font-semibold text-stone-400 text-[11px] bg-[#12201a]">
                  Eligibility Stage
                </td>
                {items.map((item) => (
                  <td key={item.id} className="p-2 text-stone-300 align-top">
                    {item.st.map((s) => (s === 'c10' ? 'After Class 10' : 'After Class 12')).join(' or ')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-2 font-semibold text-stone-400 text-[11px] bg-[#12201a]">
                  Typical Route
                </td>
                {items.map((item) => (
                  <td key={item.id} className="p-2 text-stone-300 text-[11px] leading-relaxed align-top">
                    {item.r || (item.rc ? `Leads to: ${item.rc.join(', ')}` : 'Varies by institution')}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-2 font-semibold text-stone-400 text-[11px] bg-[#12201a]">
                  Verification Priority
                </td>
                {items.map((item) => (
                  <td key={item.id} className="p-2 text-amber-200/90 text-[11px] leading-relaxed align-top">
                    Check AICTE/UGC/NCVT approval, state quota cutoffs & total fee structure with official notices.
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#192c24] border-t border-emerald-900/50 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-stone-400 hidden sm:inline">
            Unbiased comparison designed for decision clarity
          </span>

          <button
            onClick={handleAskAiToCompare}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-md tap-bounce"
          >
            <Sparkles className="w-4 h-4" />
            Ask Gemini AI to Compare Deeply (High Thinking)
          </button>
        </div>
      </div>
    </div>
  );
};
