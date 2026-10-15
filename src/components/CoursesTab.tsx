import React, { useState } from 'react';
import {
  Search,
  Bookmark,
  Scale,
  Sparkles,
  ArrowRight,
  Filter,
  GraduationCap,
} from 'lucide-react';
import { COURSES } from '../data/mockData';
import { StudentProfile, filterItems, rankItems } from '../utils/matching';

interface CoursesTabProps {
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

export const CoursesTab: React.FC<CoursesTabProps> = ({
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
  const [selectedType, setSelectedType] = useState<string>('');

  const types = ['Academic', 'Professional', 'Vocational', 'Work-based'];

  const filtered = filterItems(COURSES, {
    query: searchQuery,
    stage: selectedStage,
    type: selectedType,
  });

  const ranked = rankItems(filtered, profile, feedbackMap);

  return (
    <div className="flex-1 overflow-y-auto bg-[#14231d] text-stone-100 p-4 space-y-4">
      {/* Top Header & Search */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              Courses & Pathways
            </h1>
            <p className="text-xs text-stone-400">
              Browse academic streams, polytechnic diplomas, ITI trades & university degrees.
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, diplomas, streams (e.g. Science, Polytechnic, ITI)..."
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

          {types.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? '' : type)}
              className={`text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap border ${
                selectedType === type
                  ? 'bg-teal-600 text-white font-semibold border-teal-400'
                  : 'bg-stone-900/50 text-stone-300 border-stone-800 hover:border-emerald-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {ranked.map((course) => {
          const isSaved = savedIds.includes(course.id);
          const isComparing = compareIds.includes(course.id);
          const feedback = feedbackMap[course.id];

          // Color border by route type
          const typeColor =
            course.ty === 'Academic'
              ? 'border-l-4 border-l-emerald-500'
              : course.ty === 'Professional'
              ? 'border-l-4 border-l-amber-500'
              : course.ty === 'Vocational'
              ? 'border-l-4 border-l-teal-500'
              : 'border-l-4 border-l-indigo-500';

          return (
            <div
              key={course.id}
              className={`bg-[#192c24] border border-emerald-900/50 rounded-2xl p-4 transition-all hover:border-emerald-600/40 shadow-sm ${typeColor}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 border border-emerald-800/50">
                      {course.ty} Route
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {course.st.map((s) => (s === 'c10' ? 'Class 10' : 'Class 12')).join(' & ')}
                    </span>
                    {feedback === 'i' && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                        Interested
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1.5">{course.n}</h3>
                </div>

                <button
                  onClick={() => onToggleSave(course.id)}
                  className={`p-1.5 rounded-full transition-colors ${
                    isSaved
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title={isSaved ? 'Remove from saved' : 'Save course'}
                  aria-label={isSaved ? 'Unsave' : 'Save'}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
                </button>
              </div>

              <div className="mt-2 text-xs text-stone-300 leading-relaxed">
                <span className="text-emerald-300 font-medium">Curriculum includes: </span>
                {course.s}
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mt-2.5">
                {course.sk.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#13221c] text-stone-300 border border-emerald-950"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-emerald-900/40 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleCompare(course.id)}
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
                        `Tell me all about "${course.n}". What are eligibility criteria, fees range, recognition, and what careers it leads to?`
                      )
                    }
                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/40 hover:bg-emerald-800/50 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Ask AI
                  </button>
                </div>

                <button
                  onClick={() => onOpenDetail(course.id)}
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
            No courses match your filter. Try picking a different stage or stream type.
          </div>
        )}
      </div>
    </div>
  );
};
