import React from 'react';
import {
  X,
  Sparkles,
  Bookmark,
  Scale,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { CAREERS, COURSES } from '../data/mockData';

interface DetailModalProps {
  itemId: string | null;
  onClose: () => void;
  isSaved: boolean;
  isComparing: boolean;
  feedback?: 'i' | 'u' | 'n';
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onSetFeedback: (id: string, fb: 'i' | 'u' | 'n') => void;
  onAskAi: (prompt: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  itemId,
  onClose,
  isSaved,
  isComparing,
  feedback,
  onToggleSave,
  onToggleCompare,
  onSetFeedback,
  onAskAi,
}) => {
  if (!itemId) return null;

  const item = [...CAREERS, ...COURSES].find((it) => it.id === itemId);
  if (!item) return null;

  const isCareer = item.kind === 'career';

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.n} Details`}
    >
      {/* Android Bottom Sheet Container */}
      <div
        className="w-full max-w-xl bg-[#162720] border-t sm:border border-emerald-900/60 rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col text-stone-100 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Android drag pill */}
        <div className="w-full flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-stone-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="p-4 border-b border-emerald-900/50 flex items-start justify-between gap-3 shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                {isCareer ? item.f : `${item.a} · ${item.ty}`}
              </span>
              <span className="text-[11px] text-stone-400">
                {item.st.map((s) => (s === 'c10' ? 'After Class 10' : 'After Class 12')).join(' & ')}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1.5">{item.n}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-emerald-950/60 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs leading-relaxed">
          {/* Main Summary */}
          <div>
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
              {isCareer ? 'What the work involves' : 'What students study'}
            </h3>
            <p className="text-stone-200 bg-[#12201a] p-3 rounded-2xl border border-emerald-950">
              {item.d || item.s}
            </p>
          </div>

          {/* Key Skills */}
          <div>
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
              Key Skills Developed & Used
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {item.sk.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-[#192c24] text-emerald-200 border border-emerald-900/80 font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Pathways / Routes */}
          {item.r && (
            <div>
              <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
                Typical Study & Entry Routes
              </h3>
              <p className="text-stone-300 bg-[#12201a] p-3 rounded-2xl border border-emerald-950">
                {item.r}
              </p>
            </div>
          )}

          {/* Verification Checklist */}
          <div className="bg-[#12201a] p-3.5 rounded-2xl border border-amber-900/40 space-y-2">
            <h3 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              What to officially verify before enrolling
            </h3>
            <ul className="list-disc list-inside space-y-1 text-stone-300 text-[11px]">
              <li>Institutional accreditation (AICTE / UGC / NCVT / State Technical Board).</li>
              <li>Current entrance exam cutoffs, application dates & seat reservations.</li>
              <li>Hands-on laboratory time, workshop facilities and mandatory internship support.</li>
              <li>Actual fee structure, hostel charges and state/central government scholarships.</li>
            </ul>
          </div>

          {/* Student Sentiment / Feedback */}
          <div>
            <h3 className="text-xs font-bold text-stone-300 block mb-1.5">
              How does this direction feel to you?
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onSetFeedback(item.id, 'i')}
                className={`py-2 px-1 rounded-xl text-center text-xs border transition-all ${
                  feedback === 'i'
                    ? 'bg-emerald-600 text-white border-emerald-400 font-bold shadow-sm'
                    : 'bg-[#12201a] text-stone-300 border-emerald-950 hover:bg-[#192c24]'
                }`}
              >
                👍 Interested
              </button>
              <button
                onClick={() => onSetFeedback(item.id, 'u')}
                className={`py-2 px-1 rounded-xl text-center text-xs border transition-all ${
                  feedback === 'u'
                    ? 'bg-amber-600 text-white border-amber-400 font-bold shadow-sm'
                    : 'bg-[#12201a] text-stone-300 border-emerald-950 hover:bg-[#192c24]'
                }`}
              >
                🤔 Unsure
              </button>
              <button
                onClick={() => onSetFeedback(item.id, 'n')}
                className={`py-2 px-1 rounded-xl text-center text-xs border transition-all ${
                  feedback === 'n'
                    ? 'bg-rose-700 text-white border-rose-400 font-bold shadow-sm'
                    : 'bg-[#12201a] text-stone-300 border-emerald-950 hover:bg-[#192c24]'
                }`}
              >
                👎 Not for me
              </button>
            </div>
            <p className="text-[10px] text-stone-400 mt-1">
              Selecting "Not for me" demotes this in your recommendations. You can change this anytime.
            </p>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-3 bg-[#192c24] border-t border-emerald-900/50 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(item.id)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1 transition-all ${
                isSaved
                  ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold'
                  : 'bg-emerald-950/60 text-stone-200 border-emerald-800 hover:bg-emerald-900/50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-stone-950' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={() => onToggleCompare(item.id)}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium flex items-center gap-1 transition-all ${
                isComparing
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-emerald-950/60 text-stone-200 border-emerald-800 hover:bg-emerald-900/50'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              {isComparing ? 'Comparing' : 'Compare'}
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onAskAi(
                `Can you provide an in-depth counseling analysis of "${item.n}"? Include entrance requirements, curriculum depth, career longevity, and recommended backup pathways.`
              );
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs shadow-md tap-bounce"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Ask Gemini AI
          </button>
        </div>
      </div>
    </div>
  );
};
