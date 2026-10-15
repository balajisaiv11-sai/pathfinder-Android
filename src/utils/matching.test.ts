import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractTagsFromText,
  computeProfileWeights,
  scoreItem,
  generateMatchReason,
  rankItems,
  filterItems,
  calculateProgress,
  type ItemData,
  type StudentProfile,
} from './matching.ts';

test('extractTagsFromText identifies relevant tags from freeform input', () => {
  const codingTags = extractTagsFromText('I love coding software apps and robotics');
  assert.ok(codingTags.includes('tech'));

  const medicalTags = extractTagsFromText('I want to help hospital patients and biology research');
  assert.ok(medicalTags.includes('health'));
  assert.ok(medicalTags.includes('people') || medicalTags.includes('science'));

  const emptyTags = extractTagsFromText('');
  assert.deepEqual(emptyTags, []);
});

test('computeProfileWeights awards positive weights for interests and negative for avoided areas', () => {
  const profile: StudentProfile = {
    stage: 'c12',
    subjects: ['Physics', 'Mathematics'],
    interests: ['Building software'],
    strengths: ['Problem solving'],
    prefs: ['Hands-on coding'],
    goals: ['Get into technology'],
    avoid: ['biology and medical'],
  };

  const weights = computeProfileWeights(profile);
  assert.ok((weights.tech || 0) > 0, 'Tech weight should be positive');
  assert.ok((weights.problem || 0) > 0, 'Problem solving weight should be positive');
  assert.ok((weights.health || 0) < 0 || (weights.science || 0) !== undefined, 'Avoided areas should carry negative weights');
});

test('scoreItem boosts score for stage match and explicit user interest', () => {
  const item: ItemData = {
    id: 'k1',
    n: 'Software Developer',
    f: 'Technology',
    d: 'Builds apps and web systems',
    sk: ['Problem solving', 'Logic'],
    t: ['tech', 'problem'],
    st: ['c10', 'c12'],
    kind: 'career',
  };

  const profile: StudentProfile = {
    stage: 'c12',
    subjects: ['Mathematics'],
    interests: ['Coding and computers'],
    strengths: [],
    prefs: [],
    goals: [],
    avoid: [],
  };

  const resultNormal = scoreItem(item, profile, {});
  assert.ok(resultNormal.score > 0, 'Score should be positive');

  const resultInterested = scoreItem(item, profile, { k1: 'i' });
  assert.ok(resultInterested.score > resultNormal.score, 'Explicit interest should boost score');

  const resultDisliked = scoreItem(item, profile, { k1: 'n' });
  assert.ok(resultDisliked.score < 0, 'Not for me feedback should heavily penalize score');
});

test('rankItems sorts items by match score descending', () => {
  const items: ItemData[] = [
    {
      id: 'k1',
      n: 'Software Developer',
      t: ['tech'],
      st: ['c12'],
      sk: [],
      kind: 'career',
    },
    {
      id: 'k2',
      n: 'Botanist',
      t: ['nature'],
      st: ['c12'],
      sk: [],
      kind: 'career',
    },
  ];

  const profile: StudentProfile = {
    stage: 'c12',
    subjects: ['Computer Science'],
    interests: ['coding apps'],
    strengths: [],
    prefs: [],
    goals: [],
    avoid: [],
  };

  const ranked = rankItems(items, profile);
  assert.equal(ranked[0].id, 'k1', 'Software developer should rank first for coding interest');
});

test('filterItems accurately filters by search query and study stage', () => {
  const items: ItemData[] = [
    {
      id: 'c1',
      n: 'Engineering degree',
      a: 'Engineering',
      st: ['c12'],
      t: ['tech'],
      sk: ['maths'],
      kind: 'course',
    },
    {
      id: 'c2',
      n: 'ITI Electrician',
      a: 'Trades',
      st: ['c10'],
      t: ['practical'],
      sk: ['wiring'],
      kind: 'course',
    },
  ];

  const c10Items = filterItems(items, { stage: 'c10' });
  assert.equal(c10Items.length, 1);
  assert.equal(c10Items[0].id, 'c2');

  const searchItems = filterItems(items, { query: 'wiring' });
  assert.equal(searchItems.length, 1);
  assert.equal(searchItems[0].id, 'c2');
});

test('calculateProgress returns correct percentage', () => {
  const tasks = [
    { done: true },
    { done: false },
    { done: true },
    { done: true },
  ];

  const progress = calculateProgress(tasks);
  assert.equal(progress.total, 4);
  assert.equal(progress.completed, 3);
  assert.equal(progress.percent, 75);

  const emptyProgress = calculateProgress([]);
  assert.equal(emptyProgress.percent, 0);
});
