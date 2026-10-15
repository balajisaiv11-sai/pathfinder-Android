import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Scale,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { CAREERS } from '../data/mockData';
import { StudentProfile, filterItems, rankItems } from '../utils/matching';

interface CareersTabProps {
  profile: StudentProfile;
  savedIds: string[];
  compareIds: string[];
  feedbackMap: Record<string, 'i' | 'u' | 'n'>;
  onToggleSave: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onOpenCompare: () => void;
  onAskAi: (prompt: string) => void;
}

export const CareersTab: React.FC<CareersTabProps> = ({
  profile,
  savedIds,
  compareIds,
  feedbackMap,
  onToggleSave,
  onToggleCompare,
  onOpenDetail,
  onOpenCompare,
  onAskAi,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>(profile.stage || '');
  const [selectedField, setSelectedField] = useState<string>('');

  const allFields = Array.from(new Set(CAREERS.map((c) => c.f || '')));

  // Filter items
  const filtered = filterItems(CAREERS, {
    query: searchQuery,
    stage: selectedStage,
    area: selectedField,
  });

  // Rank with profile
  const ranked = rankItems(filtered, profile, feedbackMap);

  return (
    <div className="flex-1 overflow-y-auto bg-[#14231d] text-stone-100 p-4 space-y-4">
      {/* Top Header & Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Explore Careers</h1>
            <p className="text-xs text-stone-400">
              Discover real work profiles, study requirements & day-to-day realities.
            </p>
          </div>

          {compareIds.length >= 2 && (
            <button
              onClick={onOpenCompare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 text-stone-950 text-xs font-bold shadow-md hover:bg-amber-400 tap-bounce"
            >
              <Scale className="w-3.5 h-3.5" />
              Compare ({compareIds.length})
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search careers by name, skill, or keyword..."
            className="w-full bg-[#182c24] border border-emerald-900/60 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-stone-100 placeholder:text-stone-400 focus:outline-none shadow-inner"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <button
            onClick={() => setSelectedStage('')}
            className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border ${
              !selectedStage
                ? 'bg-emerald-600 text-white font-semibold border-emerald-400'
                : 'bg-emerald-950/40 text-stone-300 border-emerald-900/60 hover:bg-emerald-900/40'
            }`}
          >
            All Stages
          </button>
          <button
            onClick={() => setSelectedStage('c10')}
            className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border ${
              selectedStage === 'c10'
                ? 'bg-emerald-600 text-white font-semibold border-emerald-400'
                : 'bg-emerald-950/40 text-stone-300 border-emerald-900/60 hover:bg-emerald-900/40'
            }`}
          >
            After Class 10
          </button>
          <button
            onClick={() => setSelectedStage('c12')}
            className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border ${
              selectedStage === 'c12'
                ? 'bg-emerald-600 text-white font-semibold border-emerald-400'
                : 'bg-emerald-950/40 text-stone-300 border-emerald-900/60 hover:bg-emerald-900/40'
            }`}
          >
            After Class 12
          </button>

          {allFields.map((field) => (
            <button
              key={field}
              onClick={() => setSelectedField(selectedField === field ? '' : field)}
              className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border ${
                selectedField === field
                  ? 'bg-teal-600 text-white font-semibold border-teal-400'
                  : 'bg-stone-900/50 text-stone-300 border-stone-800 hover:border-emerald-800'
              }`}
            >
              {field.split('&')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Careers Cards List */}
      <div className="space-y-3">
        {ranked.map((career) => {
          const isSaved = savedIds.includes(career.id);
          const isComparing = compareIds.includes(career.id);
          const feedback = feedbackMap[career.id];

          return (
            <div
              key={career.id}
              className="bg-[#192c24] border border-emerald-900/50 rounded-2xl p-4 transition-all hover:border-emerald-600/40 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/50">
                      {career.f}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {career.st.map((s) => (s === 'c10' ? 'Class 10' : 'Class 12')).join(' & ')}
                    </span>
                    {feedback === 'i' && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        Interested
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{career.n}</h3>
                </div>

                {/* Bookmark Toggle */}
                <button
                  onClick={() => onToggleSave(career.id)}
                  className={`p-1.5 rounded-full transition-colors ${
                    isSaved
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title={isSaved ? 'Remove from saved' : 'Save career'}
                  aria-label={isSaved ? 'Unsave' : 'Save'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                {career.d}
              </p>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1 mt-2.5">
                {career.sk.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#13221c] text-stone-300 border border-emerald-950"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Route Summary */}
              {career.r && (
                <div className="mt-2 text-[11px] text-stone-400 bg-[#14231d] p-2 rounded-xl border border-emerald-950/60">
                  <span className="text-emerald-300 font-semibold">Typical Pathway: </span>
                  {career.r}
                </div>
              )}

              {/* Actions Row */}
              <div className="mt-3 pt-2.5 border-t border-emerald-900/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleCompare(career.id)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                      isComparing
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                        : 'bg-emerald-950/40 text-stone-300 border-emerald-900/60 hover:bg-emerald-900/40'
                    }`}
                  >
                    <Scale className="w-3 h-3" />
                    {isComparing ? 'Comparing' : 'Compare'}
                  </button>

                  <button
                    onClick={() =>
                      onAskAi(
                        `Explain career opportunities and day-to-day life for a "${career.n}". What are the required entrance exams and practical steps?`
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 hover:bg-emerald-800/50 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Ask AI
                  </button>
                </div>

                <button
                  onClick={() => onOpenDetail(career.id)}
                  className="text-xs text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1"
                >
                  Details <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}

        {ranked.length === 0 && (
          <div className="p-6 rounded-2xl bg-[#192c24] text-center text-xs text-stone-400">
            No careers match your search criteria. Try removing filters or searching a different keyword.
          </div>
        )}
      </div>
    </div>
  );
};
