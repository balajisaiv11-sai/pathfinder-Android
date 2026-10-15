/**
 * Core matching and ranking logic for Pathfinder Android
 */

export interface ItemData {
  id: string;
  n: string; // name
  f?: string; // field for career
  a?: string; // area for course
  d?: string; // description for career
  s?: string; // study topics for course
  sk: string[]; // skills
  t: string[]; // interest tags
  st: string[]; // stages e.g. ['c10', 'c12']
  r?: string; // route for career
  rc?: string[]; // related careers for course
  ty?: 'Academic' | 'Professional' | 'Vocational' | 'Work-based';
  kind: 'career' | 'course';
}

export interface StudentProfile {
  stage: 'c10' | 'c12' | '';
  subjects: string[];
  interests: string[];
  strengths: string[];
  prefs: string[];
  goals: string[];
  avoid: string[];
}

export const TAG_LABELS: Record<string, string> = {
  tech: 'Technology & Computing',
  people: 'Helping & Teaching People',
  nature: 'Agriculture & Nature',
  business: 'Business & Finance',
  creative: 'Creative & Design',
  practical: 'Practical & Hands-on Work',
  science: 'Pure Science & Research',
  problem: 'Problem Solving & Logic',
  language: 'Language & Law',
  health: 'Healthcare & Nursing',
};

const KEYWORD_PATTERNS: Record<string, RegExp> = {
  tech: /tech|comput|code|coding|software|robot|app|ai\b|electronic|program|data/i,
  people: /people|help|teach|social|community|care|counsel|mentor|educat/i,
  nature: /nature|environment|plant|farm|agri|animal|wildlife|climate|botany/i,
  business: /business|money|finance|account|commerce|econom|market|entrepreneur|manage/i,
  creative: /art|design|draw|creat|music|film|media|photo|writ|ux|ui/i,
  practical: /practical|hands|build|repair|trade|cook|make|machine|iti|mechanic|electric/i,
  science: /science|physics|chem|biolog|research|lab|astronomy|biotech/i,
  problem: /problem|puzzle|math|logic|solv|analysis|quant/i,
  language: /language|english|hindi|read|speak|story|law|debate|history|journal/i,
  health: /health|doctor|medic|nurs|biolog|psych|pharma|clinic|dental/i,
};

export function extractTagsFromText(text: string): string[] {
  if (!text) return [];
  return Object.keys(KEYWORD_PATTERNS).filter((tag) => KEYWORD_PATTERNS[tag].test(text));
}

export function computeProfileWeights(profile: StudentProfile): Record<string, number> {
  const weights: Record<string, number> = {};

  const addWeight = (tag: string, amount: number) => {
    weights[tag] = (weights[tag] || 0) + amount;
  };

  // Interests have strong weight
  profile.interests.forEach((item) => {
    extractTagsFromText(item).forEach((t) => addWeight(t, 3));
  });

  // Subjects have high relevance
  profile.subjects.forEach((item) => {
    extractTagsFromText(item).forEach((t) => addWeight(t, 2));
  });

  // Strengths and prefs have moderate weight
  profile.strengths.concat(profile.prefs, profile.goals).forEach((item) => {
    extractTagsFromText(item).forEach((t) => addWeight(t, 1.5));
  });

  // Things to avoid penalize heavily
  profile.avoid.forEach((item) => {
    extractTagsFromText(item).forEach((t) => addWeight(t, -4));
  });

  return weights;
}

export function scoreItem(
  item: ItemData,
  profile: StudentProfile,
  feedbackMap: Record<string, 'i' | 'u' | 'n'> = {}
): { score: number; matchedTags: string[] } {
  const weights = computeProfileWeights(profile);
  let score = 0;
  const matchedTags: string[] = [];

  item.t.forEach((tag) => {
    const w = weights[tag] || 0;
    if (w > 0) {
      score += w;
      if (TAG_LABELS[tag]) matchedTags.push(TAG_LABELS[tag]);
    } else if (w < 0) {
      score += w;
    }
  });

  // Stage bonus: if matches student stage
  if (profile.stage && item.st.includes(profile.stage)) {
    score += 2;
  }

  // Explicit user feedback weighting
  const feedback = feedbackMap[item.id];
  if (feedback === 'i') score += 10; // Interested
  if (feedback === 'u') score += 1;  // Unsure
  if (feedback === 'n') score -= 50; // Not for me

  return { score, matchedTags };
}

export function generateMatchReason(item: ItemData, matchedTags: string[]): string {
  if (matchedTags.length > 0) {
    return `Matches your interest in ${matchedTags.slice(0, 2).join(' and ')}.`;
  }
  return 'A high-impact pathway aligned with foundational study streams.';
}

export function rankItems<T extends ItemData>(
  items: T[],
  profile: StudentProfile,
  feedbackMap: Record<string, 'i' | 'u' | 'n'> = {}
): (T & { matchScore: number; matchReason: string })[] {
  return items
    .map((item) => {
      const { score, matchedTags } = scoreItem(item, profile, feedbackMap);
      return {
        ...item,
        matchScore: score,
        matchReason: generateMatchReason(item, matchedTags),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

export function filterItems<T extends ItemData>(
  items: T[],
  options: {
    query?: string;
    stage?: string;
    area?: string;
    type?: string;
    tag?: string;
  }
): T[] {
  const q = (options.query || '').trim().toLowerCase();
  return items.filter((item) => {
    // Search query matching
    if (q) {
      const haystack = [
        item.n,
        item.d || '',
        item.s || '',
        item.f || '',
        item.a || '',
        item.r || '',
        ...(item.sk || []),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // Stage filter
    if (options.stage && !item.st.includes(options.stage)) {
      return false;
    }

    // Area/Field filter
    if (options.area && (item.f !== options.area && item.a !== options.area)) {
      return false;
    }

    // Type filter
    if (options.type && item.ty !== options.type) {
      return false;
    }

    // Tag filter
    if (options.tag && !item.t.includes(options.tag)) {
      return false;
    }

    return true;
  });
}

export function calculateProgress(tasks: { done: boolean }[]): {
  total: number;
  completed: number;
  percent: number;
} {
  const total = tasks.length;
  if (total === 0) return { total: 0, completed: 0, percent: 0 };
  const completed = tasks.filter((t) => t.done).length;
  return {
    total,
    completed,
    percent: Math.round((completed / total) * 100),
  };
}
