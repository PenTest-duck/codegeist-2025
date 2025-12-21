# Driver Telemetry - Implementation Plan

## Overview
This document provides a detailed, step-by-step implementation plan for building the Driver Telemetry Forge app - a personal performance intelligence system for developers.

---

## Phase 1: Project Setup & Foundation

### 1.1 Initialize Forge Application
**Estimated Time:** 30 minutes

```bash
# Create new Forge app
forge create

# App details:
# - Name: driver-telemetry
# - Template: Custom UI with Rovo agent
# - Category: Jira app with Rovo integration
```

**Files to create:**
- `package.json` - Project dependencies
- `tsconfig.json` - TypeScript configuration
- `.gitignore` - Ignore node_modules, dist, etc.
- `README.md` - Basic setup instructions

### 1.2 Project Structure
**Estimated Time:** 20 minutes

Create the following directory structure:

```
driver-telemetry/
├── src/
│   ├── analyzers/           # Intelligence analysis modules
│   │   ├── timing.ts
│   │   ├── strengths.ts
│   │   ├── collaboration.ts
│   │   ├── load.ts
│   │   ├── trends.ts
│   │   ├── currentStatus.ts
│   │   └── recommendation.ts
│   ├── data/                # Data fetching and API clients
│   │   ├── jira/
│   │   │   ├── client.ts
│   │   │   ├── issues.ts
│   │   │   ├── changelogs.ts
│   │   │   └── sprints.ts
│   │   ├── bitbucket/
│   │   │   ├── client.ts
│   │   │   ├── commits.ts
│   │   │   └── pullRequests.ts
│   │   └── cache.ts         # Forge Storage wrapper
│   ├── models/              # TypeScript interfaces
│   │   ├── issue.ts
│   │   ├── commit.ts
│   │   ├── metrics.ts
│   │   └── analysis.ts
│   ├── utils/               # Shared utilities
│   │   ├── calculations.ts
│   │   ├── dateHelpers.ts
│   │   └── formatting.ts
│   ├── ui/                  # UI components
│   │   ├── dashboard.tsx
│   │   └── issuePanel.tsx
│   └── index.ts             # Main entry point
├── manifest.yml
├── package.json
├── tsconfig.json
└── README.md
```

### 1.3 Install Dependencies
**Estimated Time:** 10 minutes

```json
{
  "dependencies": {
    "@forge/api": "^3.0.0",
    "@forge/ui": "^1.0.0",
    "@forge/resolver": "^1.0.0",
    "@forge/storage": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^18.0.0"
  }
}
```

### 1.4 TypeScript Configuration
**Estimated Time:** 10 minutes

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## Phase 2: Data Models & Interfaces

### 2.1 Core Data Models
**Estimated Time:** 1 hour

**File: `src/models/issue.ts`**
```typescript
export interface JiraIssue {
  id: string;
  key: string;
  summary: string;
  issueType: string;
  status: string;
  assignee: string;
  created: Date;
  updated: Date;
  resolved?: Date;
  storyPoints?: number;
  components: string[];
  labels: string[];
}

export interface IssueChangelog {
  id: string;
  issueKey: string;
  timestamp: Date;
  author: string;
  field: string;
  fromValue: string;
  toValue: string;
}

export interface IssueMetrics {
  cycleTimeDays: number;
  leadTimeDays: number;
  inProgressDuration: number;
  reviewDuration: number;
  wasReopened: boolean;
  hadDefect: boolean;
}
```

**File: `src/models/commit.ts`**
```typescript
export interface Commit {
  hash: string;
  author: string;
  timestamp: Date;
  message: string;
  repository: string;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
}

export interface PullRequest {
  id: number;
  title: string;
  author: string;
  created: Date;
  merged?: Date;
  closed?: Date;
  reviewers: string[];
  reviewDurationHours?: number;
  changesRequested: boolean;
  approved: boolean;
}
```

**File: `src/models/analysis.ts`**
```typescript
export interface TimingAnalysis {
  peakWindow: {
    start: number;
    end: number;
    qualityMultiplier: number;
  };
  dangerZone?: {
    start: number;
    end: number;
    revertMultiplier: number;
  };
  dayPatterns: Record<string, {
    quality: number;
    speed: number;
  }>;
}

export interface StrengthAnalysis {
  ticketTypes: Record<string, {
    userAvg: number;
    teamAvg: number;
    delta: number;
  }>;
  components: Record<string, {
    userAvg: number;
    teamAvg: number;
    expertise: 'expert' | 'strong' | 'average' | 'avoid';
  }>;
}

export interface LoadAnalysis {
  optimalRange: {
    min: number;
    max: number;
  };
  loadCurve: Record<number, {
    cycleTime: number;
    defectRate: number;
  }>;
  currentLoad: number;
  recommendation: string;
}
```

---

## Phase 3: Data Layer Implementation

### 3.1 Jira API Client
**Estimated Time:** 2 hours

**File: `src/data/jira/client.ts`**
- Create authenticated API client using `@forge/api`
- Implement rate limiting and error handling
- Add retry logic for failed requests

**File: `src/data/jira/issues.ts`**
```typescript
export async function getUserIssues(
  accountId: string,
  daysBack: number = 180
): Promise<JiraIssue[]> {
  // JQL: assignee was {accountId} AND updated >= -{daysBack}d
}

export async function getActiveIssues(
  accountId: string
): Promise<JiraIssue[]> {
  // JQL: assignee = {accountId} AND status NOT IN (Done, Closed)
}
```

**File: `src/data/jira/changelogs.ts`**
```typescript
export async function getIssueChangelog(
  issueKey: string
): Promise<IssueChangelog[]> {
  // GET /rest/api/3/issue/{issueKey}/changelog
}

export async function calculateCycleTime(
  changelogs: IssueChangelog[]
): Promise<number> {
  // Time from "In Progress" to "Done"
}
```

### 3.2 Bitbucket API Client
**Estimated Time:** 1.5 hours

**File: `src/data/bitbucket/client.ts`**
- Create authenticated client for Bitbucket API
- Handle pagination for large result sets

**File: `src/data/bitbucket/commits.ts`**
```typescript
export async function getUserCommits(
  username: string,
  repository: string,
  daysBack: number = 180
): Promise<Commit[]> {
  // GET /repositories/{workspace}/{repo}/commits
}
```

**File: `src/data/bitbucket/pullRequests.ts`**
```typescript
export async function getUserPullRequests(
  username: string,
  repository: string
): Promise<PullRequest[]> {
  // GET /repositories/{workspace}/{repo}/pullrequests
}
```

### 3.3 Caching Layer
**Estimated Time:** 1 hour

**File: `src/data/cache.ts`**
```typescript
import { storage } from '@forge/api';

export interface CacheEntry<T> {
  data: T;
  lastUpdated: Date;
  ttl: number; // hours
}

export async function getCached<T>(
  key: string,
  ttlHours: number = 24
): Promise<T | null> {
  const entry = await storage.get(key) as CacheEntry<T>;
  if (!entry) return null;

  const age = Date.now() - new Date(entry.lastUpdated).getTime();
  const maxAge = ttlHours * 60 * 60 * 1000;

  return age < maxAge ? entry.data : null;
}

export async function setCache<T>(
  key: string,
  data: T,
  ttlHours: number = 24
): Promise<void> {
  await storage.set(key, {
    data,
    lastUpdated: new Date(),
    ttl: ttlHours
  });
}
```

---

## Phase 4: Core Intelligence Analyzers

### 4.1 Timing Analyzer
**Estimated Time:** 3 hours

**File: `src/analyzers/timing.ts`**

Implementation steps:
1. Fetch user's commits and issue updates
2. Group activities by hour of day
3. Calculate quality metrics per hour:
   - Revision rate (commits with follow-up fixes)
   - Bug introduction rate
   - PR approval speed
4. Identify peak window (highest quality, min volume threshold)
5. Identify danger zones (low quality, high revert rate)
6. Analyze day-of-week patterns

```typescript
export async function analyzeTimingPatterns(
  accountId: string,
  timeRange: string = '6months'
): Promise<TimingAnalysis> {
  // 1. Check cache
  const cached = await getCached<TimingAnalysis>(
    `user:${accountId}:timing`
  );
  if (cached) return cached;

  // 2. Fetch data
  const issues = await getUserIssues(accountId, 180);
  const commits = await getUserCommits(accountId, 180);

  // 3. Group by hour
  const hourlyBuckets = groupByHour(commits, issues);

  // 4. Calculate quality scores
  const hourlyQuality = hourlyBuckets.map(calculateQualityScore);

  // 5. Find patterns
  const peakWindow = findPeakWindow(hourlyQuality);
  const dangerZone = findDangerZone(hourlyQuality);
  const dayPatterns = analyzeDayPatterns(commits, issues);

  const result = { peakWindow, dangerZone, dayPatterns };

  // 6. Cache
  await setCache(`user:${accountId}:timing`, result);

  return result;
}
```

### 4.2 Load Analyzer
**Estimated Time:** 2.5 hours

**File: `src/analyzers/load.ts`**

Implementation steps:
1. For each completed issue, calculate concurrent load at time of work
2. Group by concurrent load level
3. Calculate metrics per load level (cycle time, defect rate)
4. Find optimal range (lowest cycle time + defect rate)
5. Get current load status
6. Generate recommendation

```typescript
export async function analyzeLoadPatterns(
  accountId: string
): Promise<LoadAnalysis> {
  const issues = await getUserIssues(accountId, 180);

  // Calculate concurrent load for each issue
  const issuesWithLoad = issues.map(issue => ({
    ...issue,
    concurrentLoad: calculateConcurrentTickets(issue, issues)
  }));

  // Group by load and calculate metrics
  const loadCurve = calculateLoadCurve(issuesWithLoad);

  // Find optimal range
  const optimalRange = findOptimalLoadRange(loadCurve);

  // Get current load
  const currentLoad = await countActiveTickets(accountId);

  // Generate recommendation
  const recommendation = generateLoadRecommendation(
    currentLoad,
    optimalRange
  );

  return { optimalRange, loadCurve, currentLoad, recommendation };
}
```

### 4.3 Strength Analyzer
**Estimated Time:** 3 hours

**File: `src/analyzers/strengths.ts`**

Implementation steps:
1. Fetch user's historical issues
2. Group by ticket type and component
3. Calculate user's average cycle time per category
4. Fetch team data for comparison
5. Calculate delta (user vs team)
6. Identify strengths (negative delta) and weaknesses (positive delta)

```typescript
export async function analyzeStrengthPatterns(
  accountId: string,
  compareToTeam: boolean = true
): Promise<StrengthAnalysis> {
  const userIssues = await getUserIssues(accountId, 180);

  // Calculate user metrics by type
  const userByType = groupAndCalculateMetrics(userIssues, 'issueType');
  const userByComponent = groupAndCalculateMetrics(userIssues, 'component');

  let ticketTypes = userByType;
  let components = userByComponent;

  if (compareToTeam) {
    // Fetch team data
    const teamIssues = await getTeamIssues(180);
    const teamByType = groupAndCalculateMetrics(teamIssues, 'issueType');
    const teamByComponent = groupAndCalculateMetrics(teamIssues, 'component');

    // Calculate deltas
    ticketTypes = calculateDeltas(userByType, teamByType);
    components = calculateDeltas(userByComponent, teamByComponent);
  }

  return { ticketTypes, components };
}
```

### 4.4 Collaboration Analyzer
**Estimated Time:** 2.5 hours

**File: `src/analyzers/collaboration.ts`**

Implementation steps:
1. Fetch user's PRs
2. Analyze reviewers by speed and approval rate
3. Identify optimal reviewers
4. Analyze pairing effectiveness
5. Generate collaboration recommendations

### 4.5 Trend Analyzer
**Estimated Time:** 2 hours

**File: `src/analyzers/trends.ts`**

Implementation steps:
1. Fetch historical data (6-12 months)
2. Group by sprint/month
3. Calculate velocity trends
4. Calculate quality trends
5. Identify skill evolution
6. Detect pattern changes

### 4.6 Current Status
**Estimated Time:** 1 hour

**File: `src/analyzers/currentStatus.ts`**

Real-time status check:
1. Get active tickets
2. Check current time vs peak window
3. Check load vs optimal
4. Generate immediate recommendations

### 4.7 Recommendation Engine
**Estimated Time:** 1.5 hours

**File: `src/analyzers/recommendation.ts`**

Context-aware recommendations based on:
- Current time
- Current load
- Available work
- User strengths
- Collaboration patterns

---

## Phase 5: Rovo Agent & Actions

### 5.1 Manifest Configuration
**Estimated Time:** 1.5 hours

**File: `manifest.yml`**

Define complete manifest with:
- Rovo agent configuration with personality prompt
- 7 action definitions with inputs/outputs
- Conversation starters
- Permissions and scopes

### 5.2 Action Handlers
**Estimated Time:** 2 hours

Create handler files that connect manifest actions to analyzer functions:

**File: `src/handlers/analyzers.ts`**
```typescript
import { resolver } from '@forge/resolver';

resolver.define('analyzeTimingPatterns', async ({ payload, context }) => {
  const accountId = context.accountId;
  const { timeRange } = payload;

  const analysis = await analyzeTimingPatterns(accountId, timeRange);

  return {
    success: true,
    data: analysis
  };
});

// Similar for other 6 actions...
```

### 5.3 Agent Prompt Engineering
**Estimated Time:** 1 hour

Fine-tune agent personality:
- Supportive and encouraging tone
- Data-driven responses
- Actionable recommendations
- F1 racing metaphors
- Handle insufficient data gracefully

---

## Phase 6: UI Components

### 6.1 Jira Dashboard Panel
**Estimated Time:** 2 hours

**File: `src/ui/dashboard.tsx`**

Create compact dashboard showing:
- Current load status (with visual indicator)
- Current time zone (peak/normal/danger)
- Sprint progress
- Quick insight
- Links to agent chat and full profile

### 6.2 Issue Context Panel
**Estimated Time:** 1.5 hours

**File: `src/ui/issuePanel.tsx`**

Show context for current ticket:
- Ticket type vs user strength
- Component expertise level
- Recommended reviewer
- Optimal timing
- Expected completion time

### 6.3 UI Handler Registration
**Estimated Time:** 30 minutes

**File: `src/handlers/ui.ts`**
```typescript
resolver.define('renderDashboard', async ({ context }) => {
  const accountId = context.accountId;

  const status = await getCurrentStatus(accountId);

  return (
    <DashboardPanel status={status} />
  );
});
```

---

## Phase 7: Testing & Refinement

### 7.1 Local Development
**Estimated Time:** 1 hour

```bash
# Start tunnel for local testing
forge tunnel

# Test with real Jira instance
forge install --site your-site.atlassian.net --product jira
```

### 7.2 Data Validation
**Estimated Time:** 2 hours

- Test with various data volumes
- Handle edge cases (new users, sparse data)
- Validate calculations
- Test caching behavior

### 7.3 Error Handling
**Estimated Time:** 1 hour

- API failures
- Rate limiting
- Invalid data
- Insufficient data for analysis

### 7.4 Performance Optimization
**Estimated Time:** 1.5 hours

- Optimize data fetching (batch requests)
- Implement smart caching
- Reduce redundant API calls
- Optimize calculation algorithms

---

## Phase 8: Documentation & Demo

### 8.1 README & Setup Guide
**Estimated Time:** 1 hour

Create comprehensive README with:
- Installation instructions
- Configuration options
- Troubleshooting guide
- Architecture overview

### 8.2 Demo Script
**Estimated Time:** 1 hour

Prepare demo following the 5-minute video outline:
- Hook (0:00 - 0:30)
- Concept (0:30 - 1:30)
- Live demo (1:30 - 3:30)
- Impact (3:30 - 4:30)
- Close (4:30 - 5:00)

### 8.3 Video Recording
**Estimated Time:** 2 hours

- Record screen captures
- Add voiceover
- Edit with F1 aesthetic graphics
- Add music and transitions

---

## Implementation Timeline

### Week 1: Foundation
- **Days 1-2:** Project setup, structure, dependencies
- **Days 3-4:** Data models and interfaces
- **Day 5:** Jira API client

### Week 2: Data & Core Logic
- **Days 1-2:** Bitbucket client and caching
- **Days 3-4:** Timing and Load analyzers
- **Day 5:** Strength analyzer

### Week 3: Intelligence & Integration
- **Days 1-2:** Collaboration and Trend analyzers
- **Day 3:** Current status and recommendations
- **Days 4-5:** Rovo agent and actions

### Week 4: UI & Polish
- **Days 1-2:** Dashboard and issue panels
- **Day 3:** Testing and bug fixes
- **Days 4-5:** Documentation and demo prep

**Total Estimated Time:** 60-70 hours (~4 weeks at 15-18 hours/week)

---

## Key Decision Points

### MVP Scope
**Must Have:**
- Timing analyzer
- Load analyzer
- Rovo agent with basic actions
- Dashboard panel

**Nice to Have:**
- Strength analyzer
- Collaboration analyzer
- Trend analyzer
- Issue panel
- Full profile page

### Data Sources
**Phase 1:** Jira only
**Phase 2:** Add Bitbucket integration

### Comparison Logic
**Phase 1:** User's own baseline (compare to their average)
**Phase 2:** Team comparisons (if team data available)

---

## Risk Mitigation

### Insufficient Data
**Risk:** New users or low-activity users may not have enough data
**Mitigation:**
- Set minimum thresholds (e.g., 10 closed tickets)
- Show helpful messages explaining what data is needed
- Suggest waiting periods

### API Rate Limits
**Risk:** Hitting Jira/Bitbucket rate limits with large datasets
**Mitigation:**
- Implement smart caching
- Batch requests efficiently
- Use progressive loading

### Calculation Complexity
**Risk:** Analysis taking too long, timing out
**Mitigation:**
- Cache aggressively
- Run analyses asynchronously
- Show loading states

### Privacy Concerns
**Risk:** Users worried about surveillance
**Mitigation:**
- Clear messaging: "This is for YOU, not your manager"
- User-only data access
- Option to clear cache
- Transparent about what's tracked

---

## Success Metrics

### Technical Success
- [ ] All 5 analyzers producing valid results
- [ ] Response time < 3 seconds for cached queries
- [ ] Response time < 10 seconds for fresh queries
- [ ] Zero errors on valid data

### User Experience Success
- [ ] Clear, actionable insights
- [ ] Easy to understand visualizations
- [ ] Natural conversational flow with agent
- [ ] Helpful recommendations

### Demo Success
- [ ] 5-minute video completed
- [ ] All features demonstrated
- [ ] F1 theme clearly communicated
- [ ] Value proposition clear

---

## Post-Hackathon Improvements

### Version 1.1
- Export reports (PDF, JSON)
- Custom date ranges
- More granular time analysis (15-min windows)
- Calendar integration for meeting impact

### Version 1.2
- Goal setting and tracking
- Alerts and notifications
- Team insights (opt-in, anonymized)
- Slack integration

### Version 2.0
- ML-powered predictions
- Anomaly detection
- Automated coaching suggestions
- Integration with CI/CD metrics

---

## Quick Start Checklist

Ready to start? Follow this checklist:

- [ ] Read driver_telemetry.md completely
- [ ] Set up Forge CLI and authenticate
- [ ] Create project structure
- [ ] Start with Phase 1 (Foundation)
- [ ] Build incrementally, test frequently
- [ ] Focus on MVP features first
- [ ] Keep F1 theme in mind throughout
- [ ] Document as you go
- [ ] Prepare demo early

---

**Next Steps:** Begin with Phase 1.1 - Initialize the Forge application and set up the basic project structure.
