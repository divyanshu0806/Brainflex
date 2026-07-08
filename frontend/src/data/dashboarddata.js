// Mock data — mirrors the original homepag.html hardcoded values.
// Phase 3 will replace these with real API responses.

export const summaryStats = {
  solved: 63,
  testsAttempted: 18,
  passRate: 94,
}

export const quickStats = [
  { label: 'Problems Solved', value: '63', badge: '↑ 5/week', badgeTone: 'up', icon: 'puzzle' },
  { label: 'Completion Rate', value: '25.5%', badge: '↑ 3.2%', badgeTone: 'up', icon: 'check' },
  { label: 'Mocks Attempted', value: '18', badge: '↑ 2 new', badgeTone: 'up', icon: 'notebook' },
  { label: 'Day Streak', value: '12', badge: 'Best ever!', badgeTone: 'fire', icon: 'flame' },
]

export const accuracyBreakdown = [
  { label: 'Easy', value: 82, tone: 'green' },
  { label: 'Medium', value: 61, tone: 'blue' },
  { label: 'Hard', value: 34, tone: 'pink' },
]

export const topicStrength = [
  { label: 'Quantitative', value: 78 },
  { label: 'Reasoning', value: 65 },
  { label: 'General Awareness', value: 45 },
  { label: 'English', value: 72 },
]

// 28-day heatmap levels, 0-4
export const heatmapLevels = [
  0, 0, 1, 2, 3, 4, 2, 0, 1, 3, 4, 3, 1, 0, 2, 3, 4, 4, 3, 2, 1, 0, 3, 4, 4, 3, 2, 1,
]

export const recentAttempts = [
  { id: 1, title: 'UPSC Prelims Mock #4', meta: 'Feb 18 · 100 Qs · 2h', pct: 74, tag: 'Passed', tone: 'green' },
  { id: 2, title: 'SSC CGL Tier-I', meta: 'Feb 17 · 100 Qs · 1h', pct: 58, tag: 'Average', tone: 'blue' },
  { id: 3, title: 'Reasoning Speed Test', meta: 'Feb 16 · 30 Qs · 15m', pct: 90, tag: 'Excellent', tone: 'green' },
]

export const examUpdates = [
  { tag: 'New', tone: 'green', title: 'UPSC CSE 2025', desc: 'Prelims notif. out · Last date: Mar 18' },
  { tag: 'Alert', tone: 'pink', title: 'SSC CGL 2025', desc: 'Tier-I exam: Apr 14–24' },
  { tag: 'Result', tone: 'cyan', title: 'IBPS PO 2024', desc: 'Final result declared at ibps.in' },
  { tag: 'Open', tone: 'green', title: 'RRB NTPC 2025', desc: 'Registration until Feb 25' },
  { tag: 'Soon', tone: 'blue', title: 'NDA 2025', desc: 'Written exam Apr 13 · 54 days left' },
]

export const problems = [
  { id: 1,  title: 'Two Sum', topic: 'Arrays', diff: 'Easy', acc: 72, status: 'solved' },
  { id: 2,  title: 'Number of Islands', topic: 'Graphs', diff: 'Medium', acc: 54, status: 'solved' },
  { id: 3,  title: 'Binary Tree Level Order Traversal', topic: 'Trees', diff: 'Medium', acc: 61, status: 'solved' },
  { id: 4,  title: 'Trapping Rain Water', topic: 'Stack', diff: 'Hard', acc: 37, status: 'attempted' },
  { id: 5,  title: 'Climbing Stairs', topic: 'Dynamic Programming', diff: 'Easy', acc: 68, status: 'solved' },
  { id: 6,  title: 'Median of Two Sorted Arrays', topic: 'Binary Search', diff: 'Hard', acc: 31, status: 'unsolved' },
  { id: 7,  title: 'Simplify Path', topic: 'Strings', diff: 'Medium', acc: 38, status: 'unsolved' },
  { id: 8,  title: 'LRU Cache', topic: 'Design', diff: 'Medium', acc: 40, status: 'unsolved' },
  { id: 9,  title: 'Word Search', topic: 'Backtracking', diff: 'Medium', acc: 39, status: 'attempted' },
  { id: 10, title: 'N-Queens', topic: 'Backtracking', diff: 'Hard', acc: 62, status: 'unsolved' },
  { id: 11, title: 'Polity: Fundamental Rights', topic: 'UPSC Polity', diff: 'Easy', acc: 78, status: 'solved' },
  { id: 12, title: 'Economy: GDP Concepts', topic: 'UPSC Economy', diff: 'Medium', acc: 55, status: 'solved' },
  { id: 13, title: 'History: Indus Valley Civilisation', topic: 'UPSC History', diff: 'Easy', acc: 81, status: 'solved' },
  { id: 14, title: 'Geography: Monsoon System', topic: 'UPSC Geography', diff: 'Medium', acc: 49, status: 'attempted' },
  { id: 15, title: 'SSC CGL: Profit & Loss', topic: 'Quantitative', diff: 'Easy', acc: 74, status: 'solved' },
  { id: 16, title: 'SSC CGL: Time & Work', topic: 'Quantitative', diff: 'Medium', acc: 58, status: 'solved' },
  { id: 17, title: 'IBPS PO: Syllogisms', topic: 'Reasoning', diff: 'Medium', acc: 63, status: 'unsolved' },
  { id: 18, title: 'IBPS PO: Blood Relations', topic: 'Reasoning', diff: 'Hard', acc: 42, status: 'unsolved' },
  { id: 19, title: 'Current Affairs: Feb 2025', topic: 'General Awareness', diff: 'Easy', acc: 69, status: 'attempted' },
  { id: 20, title: 'Environment: Paris Agreement', topic: 'UPSC Environment', diff: 'Medium', acc: 52, status: 'unsolved' },
]

export const nextUp = [
  {
    tag: '⏱ Recommended',
    tone: 'violet',
    title: 'UPSC Prelims Full Test #5',
    meta: '100 Qs · 2 hours · based on your gaps',
  },
  {
    tag: '📚 Quick',
    tone: 'cyan',
    title: 'Current Affairs Drill',
    meta: '30 Qs · 20 min · today\u2019s news',
  },
]

// Full mock test history for Attempted page
export const mockTests = [
  { id: 1,  title: 'UPSC Prelims Mock #4',     date: 'Feb 18', questions: 100, duration: '2h 0m',  score: 74, tag: 'Passed',     exam: 'UPSC'  },
  { id: 2,  title: 'SSC CGL Tier-I Full Test', date: 'Feb 17', questions: 100, duration: '1h 0m',  score: 58, tag: 'Average',    exam: 'SSC'   },
  { id: 3,  title: 'Reasoning Speed Test',      date: 'Feb 16', questions: 30,  duration: '14m',    score: 90, tag: 'Excellent',  exam: 'Mixed' },
  { id: 4,  title: 'IBPS PO Mock #2',           date: 'Feb 14', questions: 100, duration: '1h 15m', score: 63, tag: 'Passed',     exam: 'IBPS'  },
  { id: 5,  title: 'General Awareness Quiz',    date: 'Feb 13', questions: 50,  duration: '35m',    score: 42, tag: 'Needs Work', exam: 'Mixed' },
  { id: 6,  title: 'Quant Sectional Test',      date: 'Feb 12', questions: 40,  duration: '30m',    score: 70, tag: 'Good',       exam: 'SSC'   },
  { id: 7,  title: 'UPSC Prelims Mock #3',      date: 'Feb 10', questions: 100, duration: '2h 0m',  score: 66, tag: 'Passed',     exam: 'UPSC'  },
  { id: 8,  title: 'English Language Test',     date: 'Feb 9',  questions: 40,  duration: '25m',    score: 55, tag: 'Average',    exam: 'IBPS'  },
  { id: 9,  title: 'Current Affairs Feb 2025',  date: 'Feb 8',  questions: 50,  duration: '30m',    score: 80, tag: 'Excellent',  exam: 'Mixed' },
  { id: 10, title: 'SSC CGL Tier-I Mock #2',   date: 'Feb 6',  questions: 100, duration: '1h 0m',  score: 48, tag: 'Needs Work', exam: 'SSC'   },
]