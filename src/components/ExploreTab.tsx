import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { PATHWAY_GUIDES, CAREERS, COURSES } from '../data/mockData';
import { StudentProfile, rankItems, extractTagsFromText } from '../utils/matching';

interface ExploreTabProps {
  profile: StudentProfile;
  onUpdateProfile: (updater: (prev: StudentProfile) => StudentProfile) => void;
  onSelectStage: (stage: 'c10' | 'c12') => void;
  onOpenDetail: (id: string) => void;
  onAskAi: (prompt: string) => void;
}

const COMMON_INTERESTS = [
  'Coding & Technology',
  'Healthcare & Medicine',
  'Business & Startups',
  'Creative Art & Design',
  'Hands-on Machine Building',
  'Agriculture & Nature',
  'Law & Public Service',
  'Math & Logical Puzzles',
];

const COMMON_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Economics',
  'Accountancy',
  'History',
  'English / Languages',
];

export const ExploreTab: React.FC<ExploreTabProps> = ({
  profile,
  onUpdateProfile,
  onSelectStage,
  onOpenDetail,
  onAskAi,
}) => {
  const [expandedPathwayIndex, setExpandedPathwayIndex] = useState<number | null>(0);
  const currentStage = profile.stage || 'c10';

  const pathways = PATHWAY_GUIDES[currentStage] || PATHWAY_GUIDES.c10;

  // Toggle interest
  const toggleInterest = (interest: string) => {
    onUpdateProfile((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  // Toggle subject
  const toggleSubject = (subject: string) => {
    onUpdateProfile((prev) => {
      const exists = prev.subjects.includes(subject);
      return {
        ...prev,
        subjects: exists
          ? prev.subjects.filter((s) => s !== subject)
          : [...prev.subjects, subject],
      };
    });
  };

  // Calculate top 3 recommended options for current profile
  const allItems = [...CAREERS, ...COURSES].filter((item) =>
    item.st.includes(currentStage)
  );
  const ranked = rankItems(allItems, profile).slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-[#14231d] text-stone-100 p-4 space-y-6">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800/80 via-emerald-900/60 to-[#101c17] p-5 border border-emerald-700/40 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-1 max-w-[85%]">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Study & Career Compass
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Start with your curiosity.
            </h1>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Discover streams, diplomas, degrees, and careers tailored to what you genuinely enjoy.
            </p>
          </div>
        </div>

        {/* Stage Selector (Class 10 vs 12) */}
        <div className="mt-4 pt-3 border-t border-emerald-700/30">
          <label className="text-[11px] text-emerald-200 font-medium block mb-2">
            Where are you in your studies right now?
          </label>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Education Stage">
            <button
              onClick={() => onSelectStage('c10')}
              className={`p-3 rounded-2xl text-left border transition-all tap-bounce ${
                profile.stage === 'c10'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-semibold'
                  : 'bg-emerald-950/60 text-emerald-200 border-emerald-900/60 hover:bg-emerald-900/40'
              }`}
              aria-pressed={profile.stage === 'c10'}
            >
              <div className="text-xs font-bold">After Class 10</div>
              <div className="text-[10px] opacity-80">Streams, ITI, Polytechnic</div>
            </button>

            <button
              onClick={() => onSelectStage('c12')}
              className={`p-3 rounded-2xl text-left border transition-all tap-bounce ${
                profile.stage === 'c12'
                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-semibold'
                  : 'bg-emerald-950/60 text-emerald-200 border-emerald-900/60 hover:bg-emerald-900/40'
              }`}
              aria-pressed={profile.stage === 'c12'}
            >
              <div className="text-xs font-bold">After Class 12</div>
              <div className="text-[10px] opacity-80">Degrees, Entrance, Jobs</div>
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Curiosity Chips */}
      <section className="bg-[#192c24] border border-emerald-900/50 rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              What sounds interesting to you?
            </h2>
            <p className="text-[11px] text-stone-400">
              Tap any to see matching careers and study streams update instantly.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {COMMON_INTERESTS.map((interest) => {
            const isSelected = profile.interests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all tap-bounce ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-400 font-semibold shadow-sm'
                    : 'bg-emerald-950/40 text-stone-300 border-emerald-900/60 hover:bg-emerald-900/40'
                }`}
                aria-pressed={isSelected}
              >
                {isSelected ? '✓ ' : '+ '}
                {interest}
              </button>
            );
          })}
        </div>

        {/* Favorite Subjects */}
        <div className="mt-4 pt-3 border-t border-emerald-900/40">
          <label className="text-[11px] text-stone-300 font-medium block mb-2">
            School subjects you enjoy or want to explore:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SUBJECTS.map((subject) => {
              const isSelected = profile.subjects.includes(subject);
              return (
                <button
                  key={subject}
                  onClick={() => toggleSubject(subject)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white border-teal-400 font-semibold'
                      : 'bg-stone-900/60 text-stone-300 border-stone-800 hover:border-emerald-700/50'
                  }`}
                  aria-pressed={isSelected}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {subject}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personalized Matches Preview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Top Matching Directions
          </h2>
          <span className="text-[11px] text-emerald-300/80">
            {profile.interests.length > 0 ? 'Personalized' : 'Popular options'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {ranked.map((item) => (
            <div
              key={item.id}
              className="bg-[#1b2f27] border border-emerald-800/40 rounded-2xl p-3.5 flex flex-col justify-between hover:border-emerald-600/50 transition-all shadow-sm"
            >
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
                  {item.kind === 'career' ? item.f : item.a}
                </span>
                <h3 className="text-sm font-bold text-white mt-2 leading-snug">{item.n}</h3>
                <p className="text-[11px] text-stone-300 mt-1 line-clamp-2">
                  {item.d || item.s}
                </p>
                <div className="text-[10px] text-emerald-300/90 mt-2 font-medium">
                  {item.matchReason}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-emerald-900/60 flex items-center justify-between">
                <button
                  onClick={() => onOpenDetail(item.id)}
                  className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1"
                >
                  Details <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  onClick={() =>
                    onAskAi(
                      `Tell me about ${item.n} (${item.kind}). What are the entrance requirements, subjects to study, and backup options?`
                    )
                  }
                  className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 hover:bg-emerald-800/50"
                  title="Ask Gemini AI"
                >
                  Ask AI
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pathways Directory (Class 10 or 12) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Available Routes ({currentStage === 'c10' ? 'After Class 10' : 'After Class 12'})
            </h2>
            <p className="text-[11px] text-stone-400">
              Each route is respected and valuable. Choose based on how you learn best.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {pathways.map((pw, idx) => {
            const isExpanded = expandedPathwayIndex === idx;

            return (
              <div
                key={idx}
                className="bg-[#192c24] border border-emerald-900/50 rounded-2xl p-4 transition-all"
              >
                <button
                  onClick={() => setExpandedPathwayIndex(isExpanded ? null : idx)}
                  className="w-full flex items-start justify-between text-left"
                >
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/40">
                      {pw.type} Route
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{pw.title}</h3>
                    <p className="text-xs text-stone-300 mt-0.5">{pw.desc}</p>
                  </div>
                  <div className="text-emerald-400 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-emerald-900/50 text-xs space-y-2 text-stone-300">
                    <div>
                      <span className="text-emerald-300 font-semibold">Who it is suited for: </span>
                      <span>{pw.who}</span>
                    </div>

                    <div>
                      <span className="text-emerald-300 font-semibold">What learning involves: </span>
                      <span>{pw.involves}</span>
                    </div>

                    <div className="bg-[#13221c] p-2.5 rounded-xl border border-emerald-950/80">
                      <span className="text-[11px] font-bold text-amber-300 block mb-1">
                        Critical questions to ask colleges or schools:
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-[11px] text-stone-300">
                        {pw.questions.map((q, qIdx) => (
                          <li key={qIdx}>{q}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() =>
                          onAskAi(
                            `I'm evaluating "${pw.title}". Can you give me a realistic breakdown of pros, cons, career prospects, and what to watch out for?`
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Analyze this path with Gemini AI
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
