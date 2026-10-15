import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Share2,
  Bookmark,
  Scale,
  Sparkles,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { calculateProgress } from '../utils/matching';
import { CAREERS, COURSES } from '../data/mockData';

export interface PlanStep {
  id: string;
  title: string;
  done: boolean;
  targetDate?: string;
  note?: string;
}

export interface WorkspaceStrategy {
  firstChoice: string;
  backupChoice: string;
  mentorQuestions: string;
  generalNotes: string;
}

interface PlanTabProps {
  planSteps: PlanStep[];
  strategy: WorkspaceStrategy;
  savedIds: string[];
  compareIds: string[];
  onUpdateSteps: (updater: (prev: PlanStep[]) => PlanStep[]) => void;
  onUpdateStrategy: (updater: (prev: WorkspaceStrategy) => WorkspaceStrategy) => void;
  onOpenDetail: (id: string) => void;
  onOpenCompare: () => void;
  onAskAi: (prompt: string) => void;
}

const DEFAULT_SUGGESTIONS = [
  'Visit a nearby college or polytechnic campus',
  'Check official eligibility and entrance exam syllabus',
  'Talk to a senior studying this stream',
  'Review tuition fees, scholarships & hostel options',
  'Write down 2 solid accredited backup plans',
  'Discuss subject combinations with school teachers',
];

export const PlanTab: React.FC<PlanTabProps> = ({
  planSteps,
  strategy,
  savedIds,
  compareIds,
  onUpdateSteps,
  onUpdateStrategy,
  onOpenDetail,
  onOpenCompare,
  onAskAi,
}) => {
  const [newStepText, setNewStepText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const { total, completed, percent } = calculateProgress(planSteps);

  const handleToggleStep = (id: string) => {
    onUpdateSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, done: !step.done } : step))
    );
  };

  const handleDeleteStep = (id: string) => {
    onUpdateSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const handleAddCustomStep = (e: React.FormEvent) => {
    e.preventDefault();
    const text = newStepText.trim();
    if (!text) return;

    onUpdateSteps((prev) => [
      ...prev,
      {
        id: 'step-' + Date.now(),
        title: text,
        done: false,
      },
    ]);
    setNewStepText('');
  };

  const handleAddSuggestedStep = (text: string) => {
    onUpdateSteps((prev) => [
      ...prev,
      {
        id: 'step-' + Date.now(),
        title: text,
        done: false,
      },
    ]);
  };

  const handleCopySummary = () => {
    const summaryText = `📋 MY PATHFINDER CAREER & STUDY PLAN
--------------------------------------
Progress: ${completed}/${total} steps completed (${percent}%)

🎯 Primary Choice: ${strategy.firstChoice || 'Not set yet'}
🛡️ Backup Option: ${strategy.backupChoice || 'Not set yet'}

Action Steps:
${planSteps.map((s) => `[${s.done ? 'x' : ' '}] ${s.title}${s.targetDate ? ` (by ${s.targetDate})` : ''}`).join('\n')}

Questions to ask mentors/parents:
${strategy.mentorQuestions || 'None recorded yet'}
`;
    navigator.clipboard?.writeText(summaryText);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const allItems = [...CAREERS, ...COURSES];
  const savedItems = allItems.filter((it) => savedIds.includes(it.id));

  return (
    <div className="flex-1 overflow-y-auto bg-[#14231d] text-stone-100 p-4 space-y-5">
      {/* Top Header & Export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            My Action Plan & Notebook
          </h1>
          <p className="text-xs text-stone-400">
            Keep track of your next moves at your own pace.
          </p>
        </div>

        <button
          onClick={handleCopySummary}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-800/80 hover:bg-emerald-700/80 text-emerald-200 text-xs font-semibold border border-emerald-600/40 shadow-sm transition-all tap-bounce"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Export</span>
            </>
          )}
        </button>
      </div>

      {/* Progress Card */}
      <section className="bg-gradient-to-br from-[#192c24] to-[#12221b] border border-emerald-900/60 rounded-3xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
              Preparation Progress
            </span>
            <div className="text-base font-bold text-white mt-0.5">
              {total > 0 ? `${completed} of ${total} steps completed` : 'Start your first step'}
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{percent}%</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-emerald-950">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </section>

      {/* Checklist of Steps */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center justify-between">
          <span>Action Checklist</span>
          <span className="text-[11px] text-stone-400 font-normal">Check off when done</span>
        </h2>

        {/* Add Step Form */}
        <form onSubmit={handleAddCustomStep} className="flex gap-2">
          <input
            type="text"
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            placeholder="Add a step (e.g. Download JEE / CUET syllabus)..."
            className="flex-1 bg-[#182c24] border border-emerald-900/60 focus:border-emerald-500 rounded-2xl px-3.5 py-2 text-xs text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newStepText.trim()}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </form>

        {/* Steps List */}
        <div className="space-y-2">
          {planSteps.map((step) => (
            <div
              key={step.id}
              className={`p-3 rounded-2xl border transition-all ${
                step.done
                  ? 'bg-[#15241e]/60 border-emerald-950 text-stone-400'
                  : 'bg-[#192c24] border-emerald-900/50 text-stone-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={() => handleToggleStep(step.id)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-stone-900 border-stone-700 cursor-pointer"
                  aria-label={`Mark "${step.title}" as completed`}
                />

                <div className="flex-1 space-y-1">
                  <div
                    className={`text-xs font-medium leading-snug ${
                      step.done ? 'line-through text-stone-400' : 'text-stone-100'
                    }`}
                  >
                    {step.title}
                  </div>

                  {step.note && (
                    <div className="text-[11px] text-stone-300 bg-[#12201a] p-2 rounded-xl mt-1 border border-emerald-950">
                      {step.note}
                    </div>
                  )}

                  {/* Target date input toggle */}
                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-1 text-[10px] text-stone-400">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <input
                        type="date"
                        value={step.targetDate || ''}
                        onChange={(e) => {
                          const dateVal = e.target.value;
                          onUpdateSteps((prev) =>
                            prev.map((s) => (s.id === step.id ? { ...s, targetDate: dateVal } : s))
                          );
                        }}
                        className="bg-transparent border-0 text-[10px] text-emerald-300 p-0 focus:outline-none"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteStep(step.id)}
                  className="p-1 text-stone-400 hover:text-rose-400 transition-colors"
                  title="Remove step"
                  aria-label="Remove step"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {planSteps.length === 0 && (
            <div className="p-4 rounded-2xl bg-[#182c24] text-center text-xs text-stone-400">
              No steps yet. Add one above or choose from recommended steps below.
            </div>
          )}
        </div>

        {/* Suggested Steps Pills */}
        <div className="pt-2">
          <label className="text-[11px] text-stone-300 font-medium block mb-1.5">
            Suggested milestone steps:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_SUGGESTIONS.map((sugg, i) => (
              <button
                key={i}
                onClick={() => handleAddSuggestedStep(sugg)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 transition-colors tap-bounce"
              >
                + {sugg}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Decision Matrix: Primary vs Backup */}
      <section className="bg-[#192c24] border border-emerald-900/50 rounded-3xl p-4 shadow-sm space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          Primary & Backup Option Strategy
        </h2>
        <p className="text-[11px] text-stone-400 leading-relaxed">
          Having a reliable backup option is not admitting defeat—it gives you psychological freedom to aim high without fear.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#14231d] p-3 rounded-2xl border border-emerald-950">
            <label className="text-xs font-bold text-emerald-300 block mb-1">
              🎯 First Choice Pathway
            </label>
            <input
              type="text"
              value={strategy.firstChoice}
              onChange={(e) =>
                onUpdateStrategy((prev) => ({ ...prev, firstChoice: e.target.value }))
              }
              placeholder="e.g. B.Tech Computer Science via JEE/State CET"
              className="w-full bg-[#192c24] border border-emerald-900/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-[#14231d] p-3 rounded-2xl border border-emerald-950">
            <label className="text-xs font-bold text-amber-300 block mb-1">
              🛡️ Accredited Backup Option
            </label>
            <input
              type="text"
              value={strategy.backupChoice}
              onChange={(e) =>
                onUpdateStrategy((prev) => ({ ...prev, backupChoice: e.target.value }))
              }
              placeholder="e.g. BCA + Cloud Certs OR Polytechnic Diploma"
              className="w-full bg-[#192c24] border border-emerald-900/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Questions for Mentors */}
        <div>
          <label className="text-xs font-bold text-stone-200 block mb-1">
            Questions for your teachers, parents or career counselor:
          </label>
          <textarea
            value={strategy.mentorQuestions}
            onChange={(e) =>
              onUpdateStrategy((prev) => ({ ...prev, mentorQuestions: e.target.value }))
            }
            rows={3}
            placeholder="Write questions here, e.g. What is the fee budget? Does our family need me to start earning within 3 years? Can I take a drop year?..."
            className="w-full bg-[#14231d] border border-emerald-900/60 rounded-2xl p-3 text-xs text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-emerald-500 leading-relaxed"
          />
        </div>
      </section>

      {/* Saved Bookmarks Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-amber-400" />
            Saved Pathways ({savedItems.length})
          </h2>

          {compareIds.length >= 2 && (
            <button
              onClick={onOpenCompare}
              className="text-xs text-amber-300 hover:underline flex items-center gap-1"
            >
              <Scale className="w-3.5 h-3.5" /> Compare Matrix
            </button>
          )}
        </div>

        {savedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {savedItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#192c24] border border-emerald-900/50 rounded-2xl p-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-white">{item.n}</div>
                  <div className="text-[10px] text-stone-400">
                    {item.kind === 'career' ? item.f : `${item.a} · ${item.ty}`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenDetail(item.id)}
                    className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#182c24] text-center text-xs text-stone-400">
            You haven't bookmarked any careers or courses yet. Tap the bookmark icon on any card to save it here.
          </div>
        )}
      </section>
    </div>
  );
};
