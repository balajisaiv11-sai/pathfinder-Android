import React, { useState, useEffect } from 'react';
import { AndroidNavBar, TabKey } from './components/AndroidNavBar';
import { ExploreTab } from './components/ExploreTab';
import { CareersTab } from './components/CareersTab';
import { CoursesTab } from './components/CoursesTab';
import { AiChatTab } from './components/AiChatTab';
import { PlanTab, PlanStep, WorkspaceStrategy } from './components/PlanTab';
import { DetailModal } from './components/DetailModal';
import { CompareModal } from './components/CompareModal';
import { StudentProfile } from './utils/matching';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'pathfinder_android_state_v1';

const DEFAULT_PROFILE: StudentProfile = {
  stage: 'c10',
  subjects: ['Mathematics', 'Computer Science'],
  interests: ['Coding & Technology', 'Creative Art & Design'],
  strengths: ['Problem solving'],
  prefs: ['Hands-on learning'],
  goals: ['High growth tech or design path'],
  avoid: [],
};

const DEFAULT_PLAN: PlanStep[] = [
  {
    id: 's1',
    title: 'Explore differences between Intermediate Science (PCM) and Polytechnic Diploma',
    done: true,
    note: 'Polytechnic allows lateral entry directly into 2nd year B.Tech!',
  },
  {
    id: 's2',
    title: 'Download and review official syllabus for entrance examinations',
    done: false,
    targetDate: '2026-11-01',
  },
  {
    id: 's3',
    title: 'Talk to a senior student or working engineer in software development',
    done: false,
  },
];

const DEFAULT_STRATEGY: WorkspaceStrategy = {
  firstChoice: 'Polytechnic Diploma in Computer Science / IT',
  backupChoice: 'Intermediate 10+2 PCM with Computer Science elective',
  mentorQuestions: '1. What are the lab practical hours?\n2. What is the fee assistance available?',
  generalNotes: 'Aim for recognized government or AICTE accredited polytechnic colleges.',
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('explore');
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) return parsed.profile;
      }
    } catch {}
    return DEFAULT_PROFILE;
  });

  const [planSteps, setPlanSteps] = useState<PlanStep[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.planSteps) return parsed.planSteps;
      }
    } catch {}
    return DEFAULT_PLAN;
  });

  const [strategy, setStrategy] = useState<WorkspaceStrategy>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.strategy) return parsed.strategy;
      }
    } catch {}
    return DEFAULT_STRATEGY;
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.savedIds) return parsed.savedIds;
      }
    } catch {}
    return ['k1', 'c4'];
  });

  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [feedbackMap, setFeedbackMap] = useState<Record<string, 'i' | 'u' | 'n'>>({});
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [initialPromptForAi, setInitialPromptForAi] = useState<string>('');

  // LocalStorage sync
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          profile,
          planSteps,
          strategy,
          savedIds,
        })
      );
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [profile, planSteps, strategy, savedIds]);

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 3) {
        alert('You can compare up to 3 options at a time.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleSetFeedback = (id: string, fb: 'i' | 'u' | 'n') => {
    setFeedbackMap((prev) => ({
      ...prev,
      [id]: prev[id] === fb ? (undefined as any) : fb,
    }));
  };

  const handleAskAi = (prompt: string) => {
    setInitialPromptForAi(prompt);
    setCurrentTab('ai_chat');
  };

  const handleAddPlanItem = (title: string, note?: string) => {
    setPlanSteps((prev) => [
      ...prev,
      {
        id: 'step-' + Date.now(),
        title,
        note,
        done: false,
      },
    ]);
  };

  // Active steps count for tab badge
  const uncompletedStepsCount = planSteps.filter((s) => !s.done).length;

  return (
    <div className="min-h-screen bg-[#0e1713] flex items-center justify-center sm:p-2 selection:bg-emerald-500 selection:text-white">
      {/* Container: If phone frame enabled, renders in mobile device mockup; otherwise responsive full viewport */}
      <div
        className={`w-full transition-all duration-300 flex flex-col overflow-hidden bg-[#14231d] ${
          isPhoneFrame
            ? 'max-w-[420px] h-[92vh] max-h-[880px] rounded-[44px] border-[10px] border-stone-800 shadow-2xl relative ring-1 ring-emerald-950'
            : 'max-w-4xl h-screen sm:h-[96vh] sm:rounded-3xl sm:border sm:border-emerald-900/50 shadow-xl'
        }`}
      >
        {/* Android Punch-hole Camera (in Phone frame mode) */}
        {isPhoneFrame && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-stone-900 z-40 border border-stone-700/50 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-stone-950" />
          </div>
        )}



        {/* Tab View Container */}
        <main className="flex-1 overflow-hidden flex flex-col relative" role="region" aria-label="Main content">
          {currentTab === 'explore' && (
            <ExploreTab
              profile={profile}
              onUpdateProfile={setProfile}
              onSelectStage={(stage) => setProfile((p) => ({ ...p, stage }))}
              onOpenDetail={(id) => setActiveDetailId(id)}
              onAskAi={handleAskAi}
            />
          )}

          {currentTab === 'careers' && (
            <CareersTab
              profile={profile}
              savedIds={savedIds}
              compareIds={compareIds}
              feedbackMap={feedbackMap}
              onToggleSave={handleToggleSave}
              onToggleCompare={handleToggleCompare}
              onOpenDetail={(id) => setActiveDetailId(id)}
              onOpenCompare={() => setIsCompareOpen(true)}
              onAskAi={handleAskAi}
            />
          )}

          {currentTab === 'courses' && (
            <CoursesTab
              profile={profile}
              savedIds={savedIds}
              compareIds={compareIds}
              feedbackMap={feedbackMap}
              onToggleSave={handleToggleSave}
              onToggleCompare={handleToggleCompare}
              onOpenDetail={(id) => setActiveDetailId(id)}
              onOpenCompare={() => setIsCompareOpen(true)}
              onAskAi={handleAskAi}
            />
          )}

          {currentTab === 'ai_chat' && (
            <AiChatTab
              profile={profile}
              onAddPlanItem={handleAddPlanItem}
              initialPrompt={initialPromptForAi}
              onClearInitialPrompt={() => setInitialPromptForAi('')}
            />
          )}

          {currentTab === 'plan' && (
            <PlanTab
              planSteps={planSteps}
              strategy={strategy}
              savedIds={savedIds}
              compareIds={compareIds}
              onUpdateSteps={setPlanSteps}
              onUpdateStrategy={setStrategy}
              onOpenDetail={(id) => setActiveDetailId(id)}
              onOpenCompare={() => setIsCompareOpen(true)}
              onAskAi={handleAskAi}
            />
          )}

          {/* Android Floating Action Button (FAB) for Instant AI Assistance */}
          {currentTab !== 'ai_chat' && (
            <button
              onClick={() => handleAskAi('What path or career best suits someone who is curious, motivated, but undecided?')}
              className="absolute bottom-4 right-4 z-20 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-xl tap-bounce border border-emerald-400/30"
              aria-label="Ask Gemini AI"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
              <span>Ask Gemini AI</span>
            </button>
          )}
        </main>

        {/* Android Bottom Navigation Bar */}
        <AndroidNavBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          savedCount={savedIds.length}
          activePlanCount={uncompletedStepsCount}
        />

        {/* Android Gesture Pill Navigation Bar */}
        <div className="w-full h-4 bg-[#162720] flex items-center justify-center shrink-0">
          <div className="w-32 h-1 bg-stone-500/60 rounded-full" />
        </div>
      </div>

      {/* Detail Bottom Sheet Modal */}
      <DetailModal
        itemId={activeDetailId}
        onClose={() => setActiveDetailId(null)}
        isSaved={activeDetailId ? savedIds.includes(activeDetailId) : false}
        isComparing={activeDetailId ? compareIds.includes(activeDetailId) : false}
        feedback={activeDetailId ? feedbackMap[activeDetailId] : undefined}
        onToggleSave={handleToggleSave}
        onToggleCompare={handleToggleCompare}
        onSetFeedback={handleSetFeedback}
        onAskAi={handleAskAi}
      />

      {/* Side-by-Side Comparison Modal */}
      {isCompareOpen && (
        <CompareModal
          compareIds={compareIds}
          onClose={() => setIsCompareOpen(false)}
          onRemoveFromCompare={(id) =>
            setCompareIds((prev) => prev.filter((i) => i !== id))
          }
          onAskAi={handleAskAi}
        />
      )}
    </div>
  );
}
