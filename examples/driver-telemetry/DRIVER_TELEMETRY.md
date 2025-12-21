# 🏎️ Driver Telemetry

## Personal Performance Intelligence for Developers

> *"F1 drivers have personal telemetry. Now developers do too."*

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [The F1 Connection](#the-f1-connection)
5. [Core Features](#core-features)
6. [Technology Stack](#technology-stack)
7. [Architecture](#architecture)
8. [Data Sources & APIs](#data-sources--apis)
9. [Forge Modules](#forge-modules)
10. [Rovo Agent Design](#rovo-agent-design)
11. [UI Components](#ui-components)
12. [Algorithm Design](#algorithm-design)
13. [Privacy & Security](#privacy--security)
14. [Installation & Setup](#installation--setup)
15. [Demo Script](#demo-script)
16. [Codegeist Submission](#codegeist-submission)
17. [Future Roadmap](#future-roadmap)

---

## Executive Summary

**Driver Telemetry** is a Forge-powered Rovo Agent that provides developers with personal performance intelligence by analyzing their work history in Jira and Bitbucket.

Unlike traditional analytics tools that serve managers and track team performance, Driver Telemetry is built **for the individual developer** — helping them understand their own patterns, optimize their work habits, and become more effective.

### Key Value Proposition

| Traditional Analytics | Driver Telemetry |
|-----------------------|------------------|
| Analytics for managers | Analytics for YOU |
| Team performance | Personal performance |
| Surveillance feeling | Self-improvement feeling |
| "How's the project?" | "How am I performing?" |
| Reactive insights | Personal optimization |

### Hackathon Category

**Apps for Software Teams** — Codegeist 2025: Atlassian Williams Racing Edition

### Bonus Prize Eligibility

- ✅ **Best Rovo Apps** — Uses `rovo:agent` and `action` modules
- ✅ **Runs on Atlassian** — Built entirely on Forge platform

---

## Problem Statement

### The Blind Spot

Developers use Jira every day. Jira tracks everything:
- Every ticket assigned
- Every status change
- Every comment written
- Every hour logged

Yet developers know almost nothing about their own performance patterns:

- **When do I do my best work?** No idea.
- **What types of tickets suit me?** Guesswork.
- **Who should review my code?** Whoever's available.
- **Am I taking on too much?** Feels like it, but no data.
- **How am I trending?** Complete mystery.

### The Analytics Gap

All Jira analytics flow **upward** to managers:
- Sprint velocity reports
- Team capacity dashboards
- Project health metrics
- Burndown charts

Nothing flows **to the individual**.

The person doing the work — the developer — is flying blind about their own performance.

### The Hidden Cost

Without personal performance intelligence, developers:
- Work during suboptimal hours (without knowing)
- Take on tickets that don't suit their strengths
- Request reviews from slow reviewers
- Overload themselves beyond optimal capacity
- Make the same mistakes repeatedly

The data to fix all of this already exists. It's just never been surfaced to the individual.

---

## Solution Overview

### What Is Driver Telemetry?

Driver Telemetry is a personal performance intelligence system that:

1. **Analyzes** your work history in Jira and Bitbucket
2. **Identifies** patterns in your performance
3. **Surfaces** insights about your optimal working conditions
4. **Recommends** actionable improvements

All with **zero input required** from the user.

### Core Insight

> "Jira already tracks everything you do. Driver Telemetry tells you what it means."

### The Five Intelligence Modules

| Module | Question Answered |
|--------|-------------------|
| **Timing Intelligence** | When do I do my best work? |
| **Strength Intelligence** | What types of work suit me best? |
| **Collaboration Intelligence** | Who do I work best with? |
| **Load Intelligence** | What's my optimal workload? |
| **Trend Intelligence** | How am I evolving over time? |

---

## The F1 Connection

### Why "Driver Telemetry"?

In Formula 1, every driver has personal telemetry:

- **Braking patterns** — When and how hard they brake
- **Racing line** — Their optimal path through corners
- **Tire management** — How they preserve tire life
- **Performance windows** — When they're fastest during a race
- **Conditions preference** — Wet vs. dry performance

This data helps drivers understand themselves, optimize their driving, and compete at the highest level.

### The Parallel to Software Development

| F1 Driver | Software Developer |
|-----------|-------------------|
| Braking patterns | Coding patterns |
| Optimal racing line | Optimal workflow |
| Tire management | Energy management |
| Performance windows | Peak productivity hours |
| Conditions preference | Ticket type preference |

### Alignment with Williams Racing Theme

Codegeist 2025 is partnered with Williams Racing, celebrating:
- Speed
- Precision
- Data-driven optimization
- Continuous improvement

Driver Telemetry embodies these principles by treating developer work data like F1 telemetry — not as logs, but as signals that reveal performance patterns.

---

## Core Features

### 1️⃣ Timing Intelligence

Analyzes when the user does their best work based on commit quality, ticket completion speed, and defect rates.

**Insights Provided:**
- Peak coding hours (based on commit quality)
- Peak review hours (based on issues caught)
- Danger zones (times when quality degrades)
- Day-of-week patterns
- Post-meeting recovery time

**Example Output:**
```
⏰ YOUR OPTIMAL HOURS

Peak coding quality: 10:00 AM - 12:30 PM
• Commits have 67% fewer revisions
• 41% fewer bugs introduced
• 2.1x faster PR approval

Danger zone: After 6:00 PM
• Commits are 3.4x more likely to be reverted
• 2.8x more bug fixes needed

Best day: Tuesday (23% higher completion rate)
Worst day: Wednesday (longest cycle times)
```

---

### 2️⃣ Strength Intelligence

Analyzes what types of work suit the user best compared to team averages.

**Insights Provided:**
- Performance by ticket type (bug, feature, refactor)
- Performance by component/module
- Performance by story point size
- Comparison to team averages

**Example Output:**
```
🎯 YOUR STRENGTHS (vs. team average)

TICKET TYPES:
• API Integration: 38% faster than team avg ⭐
• Bug Fixes: 22% faster ⭐
• Frontend Work: 28% slower ⚠️

COMPONENTS:
• Payment Module: Expert (47 tickets closed)
• Auth Service: Strong (23 tickets)
• User Dashboard: Avoid (historically slow)

💡 When possible, trade frontend tickets for API work.
```

---

### 3️⃣ Collaboration Intelligence

Analyzes who the user works best with based on code review patterns and pair effectiveness.

**Insights Provided:**
- Best code reviewers (fastest, highest quality)
- Optimal pairing partners
- Review style analysis
- Communication patterns

**Example Output:**
```
👥 YOUR COLLABORATION PATTERNS

BEST REVIEWERS FOR YOUR CODE:
• Sarah: 1.1 day avg (94% approval rate) ⭐
• Ahmed: 1.4 day avg (89% approval rate)
• John: 3.8 day avg (78% approval rate) ⚠️

PAIR EFFECTIVENESS:
When you work with Ahmed on backend:
• 34% faster delivery
• 45% fewer bugs

💡 Request Sarah for critical PRs.
💡 Pair with Ahmed on complex backend work.
```

---

### 4️⃣ Load Intelligence

Analyzes the user's optimal workload based on historical performance at different capacity levels.

**Insights Provided:**
- Optimal concurrent ticket count
- Performance degradation thresholds
- Current load status
- Story point calibration accuracy

**Example Output:**
```
📊 YOUR OPTIMAL LOAD

Sweet spot: 2-3 concurrent tickets

Performance by load:
• 1 ticket: Efficient but underutilized
• 2-3 tickets: Optimal - peak performance ⭐
• 4 tickets: 89% slower cycles ⚠️
• 5+ tickets: Defect rate doubles 🔴

CURRENT STATUS: 4 active tickets
You're above optimal. Consider completing one
before starting new work.

ESTIMATION CALIBRATION:
• 1-2 points: Accurate (±15%)
• 5 points: Takes 45% longer than estimated
• 8 points: Takes 2.1x longer than estimated
```

---

### 5️⃣ Trend Intelligence

Analyzes how the user's performance has changed over time.

**Insights Provided:**
- Velocity trends (points completed per sprint)
- Quality trends (defect rates, reopen rates)
- Skills evolution (what technologies you're growing in)
- Pattern changes

**Example Output:**
```
📈 YOUR PERFORMANCE TRENDS (6 Months)

VELOCITY:
• April: 29 points ← Peak
• June: 20 points ← Now
• Trend: -31% from peak

POSSIBLE FACTORS DETECTED:
• Meeting load increased 45% in May
• Switched to frontend work (not your strength)
• Concurrent tickets: 2.3 → 4.1 avg

QUALITY:
• Bug rate: Down 23% (improving!)
• Reopen rate: Down 34% (improving!)
• You're trading speed for quality.

SKILLS EVOLUTION:
• Growing: GraphQL (+340%), TypeScript (+120%)
• Declining: Python (-45%)
• You're becoming more of a frontend developer.
```

---

## Technology Stack

### Core Platform

| Component | Technology |
|-----------|------------|
| **App Platform** | Atlassian Forge |
| **Runtime** | Node.js 18.x |
| **Language** | TypeScript |
| **AI Interface** | Rovo Agent & Actions |
| **UI Framework** | Forge UI Kit |
| **Storage** | Forge Storage API |

### Atlassian Integrations

| Product | Integration Purpose |
|---------|---------------------|
| **Jira** | Ticket data, changelogs, comments, sprints |
| **Bitbucket** | Commits, PRs, reviews, build status |
| **Confluence** | Documentation activity (optional) |

### APIs Used

| API | Purpose |
|-----|---------|
| Jira REST API v3 | Issue search, changelogs, users |
| Bitbucket REST API | Commits, PRs, reviews |
| Forge Storage API | Cached analysis, baselines |
| Forge Rovo API | Agent and actions |

### Dependencies

```json
{
  "dependencies": {
    "@forge/api": "^3.0.0",
    "@forge/ui": "^1.0.0",
    "@forge/storage": "^1.0.0",
    "@forge/resolver": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^18.0.0"
  }
}
```

---

## Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     DRIVER TELEMETRY                         │
│                    System Architecture                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  USER INTERFACES                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ Rovo Agent   │  │ Jira Panel   │  │ Full Profile │       │
│  │ (Chat)       │  │ (Dashboard)  │  │ (Page)       │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                 │                 │                │
│         └─────────────────┼─────────────────┘                │
│                           │                                  │
│  ─────────────────────────┼──────────────────────────────── │
│                           ▼                                  │
│  INTELLIGENCE LAYER                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   FORGE FUNCTIONS                      │ │
│  │                                                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │ Timing      │ │ Strength    │ │Collaboration│      │ │
│  │  │ Analyzer    │ │ Analyzer    │ │ Analyzer    │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  │                                                        │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │ │
│  │  │ Load        │ │ Trend       │ │ Current     │      │ │
│  │  │ Analyzer    │ │ Analyzer    │ │ Status      │      │ │
│  │  └─────────────┘ └─────────────┘ └─────────────┘      │ │
│  │                                                        │ │
│  └────────────────────────┬───────────────────────────────┘ │
│                           │                                  │
│  ─────────────────────────┼──────────────────────────────── │
│                           ▼                                  │
│  DATA LAYER                                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Jira API     │  │ Bitbucket    │  │ Forge        │ │ │
│  │  │ (Issues,     │  │ API          │  │ Storage      │ │ │
│  │  │ Changelogs)  │  │ (Commits,PRs)│  │ (Cache)      │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       DATA FLOW                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. USER QUERY                                              │
│     │                                                       │
│     │  "When do I do my best work?"                        │
│     ▼                                                       │
│  2. ROVO AGENT                                              │
│     │                                                       │
│     │  Interprets query, selects appropriate action        │
│     ▼                                                       │
│  3. FORGE ACTION                                            │
│     │                                                       │
│     │  analyze-timing-patterns                             │
│     ▼                                                       │
│  4. DATA FETCH                                              │
│     │                                                       │
│     │  ┌─────────────────────────────────────────────┐     │
│     │  │ Check Forge Storage for cached analysis     │     │
│     │  │                                             │     │
│     │  │ If stale (>24h) or missing:                │     │
│     │  │   → Query Jira API for user's tickets      │     │
│     │  │   → Query Jira API for changelogs          │     │
│     │  │   → Query Bitbucket API for commits        │     │
│     │  │   → Process and cache results              │     │
│     │  └─────────────────────────────────────────────┘     │
│     ▼                                                       │
│  5. ANALYSIS                                                │
│     │                                                       │
│     │  ┌─────────────────────────────────────────────┐     │
│     │  │ Group activities by hour of day            │     │
│     │  │ Calculate quality metrics per time window  │     │
│     │  │ Compare to user's own baseline             │     │
│     │  │ Identify peak windows and danger zones     │     │
│     │  └─────────────────────────────────────────────┘     │
│     ▼                                                       │
│  6. RESPONSE                                                │
│     │                                                       │
│     │  Formatted insight delivered to user                 │
│     ▼                                                       │
│  7. USER                                                    │
│                                                             │
│     "Your peak coding window is 10 AM - 12:30 PM..."       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Caching Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    CACHING STRATEGY                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FORGE STORAGE KEYS:                                        │
│                                                             │
│  user:{accountId}:timing                                    │
│  ├── lastUpdated: timestamp                                 │
│  ├── peakHours: { start, end, quality }                    │
│  ├── dangerHours: { start, end, quality }                  │
│  └── dayPatterns: { mon, tue, wed, thu, fri }              │
│                                                             │
│  user:{accountId}:strengths                                 │
│  ├── lastUpdated: timestamp                                 │
│  ├── ticketTypes: { type: cycleTime, teamAvg }             │
│  └── components: { component: cycleTime, teamAvg }         │
│                                                             │
│  user:{accountId}:collaboration                             │
│  ├── lastUpdated: timestamp                                 │
│  ├── reviewers: { userId: avgTime, approvalRate }          │
│  └── pairs: { partnerUserId: speedMultiplier }             │
│                                                             │
│  user:{accountId}:load                                      │
│  ├── lastUpdated: timestamp                                 │
│  ├── optimalRange: { min, max }                            │
│  └── loadCurve: { count: cycleTime }                       │
│                                                             │
│  user:{accountId}:trends                                    │
│  ├── lastUpdated: timestamp                                 │
│  ├── velocityHistory: [ { sprint, points } ]               │
│  └── qualityHistory: [ { sprint, defectRate } ]            │
│                                                             │
│  REFRESH POLICY:                                            │
│  • Full refresh: Every 24 hours                            │
│  • Incremental update: On user request                     │
│  • Real-time: Current load status only                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Sources & APIs

### Jira Data Points

| Data Point | API Endpoint | Purpose |
|------------|--------------|---------|
| User's issues | `/rest/api/3/search` | Get tickets assigned to user |
| Issue changelog | `/rest/api/3/issue/{id}/changelog` | Track status transitions, assignee changes |
| Issue comments | `/rest/api/3/issue/{id}/comment` | Measure discussion patterns |
| Sprint data | `/rest/agile/1.0/sprint` | Calculate velocity, carry-overs |
| Current user | `/rest/api/3/myself` | Identify the user |

### Key JQL Queries

```javascript
// User's historical issues (last 12 months)
const historicalIssues = `assignee was currentUser() 
  AND updated >= -365d 
  ORDER BY updated DESC`;

// User's currently active issues
const activeIssues = `assignee = currentUser() 
  AND status NOT IN (Done, Closed, Resolved)`;

// User's completed issues with timing
const completedIssues = `assignee = currentUser() 
  AND status IN (Done, Closed, Resolved) 
  AND resolved >= -180d`;
```

### Bitbucket Data Points

| Data Point | API Endpoint | Purpose |
|------------|--------------|---------|
| User's commits | `/repositories/{workspace}/{repo}/commits` | Track coding activity, timing |
| PR reviews (as author) | `/repositories/{workspace}/{repo}/pullrequests` | Measure review cycle time |
| PR reviews (as reviewer) | `/repositories/{workspace}/{repo}/pullrequests` | Analyze review patterns |
| Build status | `/repositories/{workspace}/{repo}/commits/{hash}/statuses` | Track build success rate |

### Derived Metrics

| Metric | Calculation |
|--------|-------------|
| **Cycle Time** | Time from "In Progress" to "Done" |
| **Quality Score** | (1 - reopen_rate) × (1 - defect_rate) |
| **Review Speed** | Time from PR created to merged |
| **Commit Quality** | Commits without subsequent fix commits |
| **Optimal Load** | Ticket count with lowest avg cycle time |
| **Peak Window** | Hours with highest quality score |

---

## Forge Modules

### manifest.yml

```yaml
modules:
  # ═══════════════════════════════════════════════════════════
  # ROVO AGENT
  # The conversational interface for personal insights
  # ═══════════════════════════════════════════════════════════
  rovo:agent:
    - key: driver-telemetry-agent
      name: Driver Telemetry
      description: >
        Your personal performance intelligence. 
        Analyze your work patterns, discover your strengths,
        find your optimal collaborators, and track your growth.
        Like F1 telemetry, but for your development work.
      prompt: |
        You are Driver Telemetry, a personal performance coach 
        for developers. You analyze the user's work history in 
        Jira and Bitbucket to provide insights about their 
        optimal working patterns.
        
        Your role is to help users understand:
        - TIMING: When they do their best work
        - STRENGTHS: What types of work suit them best
        - COLLABORATION: Who they work best with
        - LOAD: Their optimal workload capacity
        - TRENDS: How they're evolving over time
        
        Personality guidelines:
        - Be supportive and encouraging, never judgmental
        - Frame insights positively as opportunities
        - Provide specific, actionable recommendations
        - Use F1/racing metaphors when appropriate
        - Always base responses on actual data
        
        When responding:
        1. Use the appropriate action to fetch real data
        2. Present findings clearly with specific numbers
        3. Explain what the pattern means
        4. Provide actionable recommendations
        
        Never make up data. Always use actions to fetch real metrics.
        If data is insufficient, explain what's needed.
      conversationStarters:
        - When do I do my best work?
        - What are my strengths?
        - Who should review my code?
        - Am I taking on too much?
        - How am I trending this month?
        - What type of work should I pick up next?
        - When should I deploy this?
      actions:
        - analyze-timing
        - analyze-strengths
        - analyze-collaboration
        - analyze-load
        - analyze-trends
        - get-current-status
        - get-recommendation

  # ═══════════════════════════════════════════════════════════
  # ROVO ACTIONS
  # Functions the agent can call to fetch and analyze data
  # ═══════════════════════════════════════════════════════════
  action:
    - key: analyze-timing
      name: Analyze Timing Patterns
      function: analyzeTimingPatterns
      description: >
        Analyzes when the user does their best work based on 
        commit timestamps, ticket completion times, and quality 
        metrics. Returns peak productivity windows, danger zones,
        and day-of-week patterns.
      actionVerb: GET
      inputs:
        timeRange:
          title: Time Range
          type: string
          description: Analysis period (e.g., "6months", "1year")
          required: false

    - key: analyze-strengths
      name: Analyze Strength Patterns
      function: analyzeStrengthPatterns
      description: >
        Analyzes what types of work the user excels at compared 
        to team averages. Includes performance by ticket type,
        component, and complexity level.
      actionVerb: GET
      inputs:
        compareToTeam:
          title: Compare to Team
          type: boolean
          description: Include team average comparison
          required: false

    - key: analyze-collaboration
      name: Analyze Collaboration Patterns
      function: analyzeCollaborationPatterns
      description: >
        Analyzes who the user works best with. Includes optimal 
        code reviewers, effective pairing partners, and 
        communication patterns.
      actionVerb: GET
      inputs:
        focusArea:
          title: Focus Area
          type: string
          description: "reviewers" | "pairs" | "all"
          required: false

    - key: analyze-load
      name: Analyze Load Patterns
      function: analyzeLoadPatterns
      description: >
        Analyzes the user's optimal workload based on historical 
        performance at different capacity levels. Includes 
        current status and recommendations.
      actionVerb: GET

    - key: analyze-trends
      name: Analyze Performance Trends
      function: analyzeTrends
      description: >
        Analyzes how the user's performance has changed over time.
        Includes velocity trends, quality metrics, and skills 
        evolution.
      actionVerb: GET
      inputs:
        months:
          title: Months to Analyze
          type: number
          description: Number of months to include in trend analysis
          required: false

    - key: get-current-status
      name: Get Current Status
      function: getCurrentStatus
      description: >
        Gets the user's real-time status including active tickets,
        current time window assessment, and immediate recommendations.
      actionVerb: GET

    - key: get-recommendation
      name: Get Personalized Recommendation
      function: getRecommendation
      description: >
        Provides a specific recommendation based on context.
        Can advise on ticket selection, timing, reviewers, etc.
      actionVerb: GET
      inputs:
        context:
          title: Context
          type: string
          description: What the user needs a recommendation for
          required: true

  # ═══════════════════════════════════════════════════════════
  # JIRA PANEL
  # Dashboard widget showing key metrics at a glance
  # ═══════════════════════════════════════════════════════════
  jira:projectPage:
    - key: driver-telemetry-dashboard
      title: Driver Telemetry
      function: renderDashboard
      resource: dashboard-resource

  jira:issuePanel:
    - key: driver-telemetry-issue-panel
      title: Driver Telemetry
      function: renderIssuePanel
      resource: issue-panel-resource

  # ═══════════════════════════════════════════════════════════
  # FORGE FUNCTIONS
  # Backend logic for analysis and rendering
  # ═══════════════════════════════════════════════════════════
  function:
    # Analysis functions
    - key: analyzeTimingPatterns
      handler: src/analyzers/timing.handler
    - key: analyzeStrengthPatterns
      handler: src/analyzers/strengths.handler
    - key: analyzeCollaborationPatterns
      handler: src/analyzers/collaboration.handler
    - key: analyzeLoadPatterns
      handler: src/analyzers/load.handler
    - key: analyzeTrends
      handler: src/analyzers/trends.handler
    - key: getCurrentStatus
      handler: src/analyzers/currentStatus.handler
    - key: getRecommendation
      handler: src/analyzers/recommendation.handler
    
    # UI rendering functions
    - key: renderDashboard
      handler: src/ui/dashboard.handler
    - key: renderIssuePanel
      handler: src/ui/issuePanel.handler

  # ═══════════════════════════════════════════════════════════
  # RESOURCES
  # Static assets for UI components
  # ═══════════════════════════════════════════════════════════
  resources:
    - key: dashboard-resource
      path: src/ui/dashboard
    - key: issue-panel-resource
      path: src/ui/issuePanel

# ═══════════════════════════════════════════════════════════
# PERMISSIONS
# Scopes required for API access
# ═══════════════════════════════════════════════════════════
permissions:
  scopes:
    - read:jira-work        # Read issues, projects, sprints
    - read:jira-user        # Read user information
    - storage:app           # Store cached analysis
  external:
    fetch:
      backend:
        - api.atlassian.com
        - api.bitbucket.org

# ═══════════════════════════════════════════════════════════
# APP CONFIGURATION
# ═══════════════════════════════════════════════════════════
app:
  runtime:
    name: nodejs18.x
  id: ari:cloud:ecosystem::app/driver-telemetry
```

---

## Rovo Agent Design

### Agent Personality

The Driver Telemetry agent acts as a **personal performance coach** — supportive, data-driven, and actionable.

**Tone:**
- Encouraging, never judgmental
- Specific, backed by numbers
- Actionable, with clear recommendations
- Uses F1 metaphors naturally

**Anti-patterns to avoid:**
- "You're performing poorly" → "There's an opportunity to optimize here"
- "You're slow at X" → "Your strength is Y, which gives you an advantage"
- Vague advice → Specific recommendations with data

### Conversation Design

#### Pattern 1: Direct Questions

```
USER: When do I do my best work?

AGENT: [Calls analyze-timing action]

Based on your last 8 months of activity:

⏰ YOUR PEAK WINDOW: 10:00 AM - 12:30 PM
• Commits have 67% fewer revisions
• 41% fewer bugs introduced  
• 2.1x faster PR approval

⚠️ YOUR DANGER ZONE: After 6:00 PM
• Commits are 3.4x more likely to be reverted

Right now it's [current time]. 
[If in peak window]: You're in your optimal zone — great time for complex work.
[If in danger zone]: Consider saving complex work for tomorrow morning.

Would you like to see your full timing analysis?
```

#### Pattern 2: Decision Support

```
USER: Should I take the frontend ticket or the API ticket?

AGENT: [Calls analyze-strengths action]

Based on your performance patterns:

🎯 RECOMMENDATION: Take the API ticket

Your stats:
• API tickets: 38% faster than team average ⭐
• Frontend tickets: 28% slower than team average

The API ticket also touches the Payment Module, where you're 
an expert (47 closed tickets, 0 reopens).

The frontend ticket involves User Dashboard — historically 
your slowest area.

Unless you're intentionally growing frontend skills, 
the API ticket plays to your strengths.
```

#### Pattern 3: Proactive Alerts

```
AGENT: [Triggered by get-current-status]

🏎️ PIT STOP CHECK

I noticed you have 4 active tickets right now.
Your optimal range is 2-3 tickets.

Historically at 4+ tickets:
• Your cycle time increases 89%
• Defect rate doubles

PROJ-456 is closest to done. Consider finishing 
it before picking up new work.

Would you like me to analyze your current workload in detail?
```

### Conversation Starters

| Starter | Triggers Action |
|---------|-----------------|
| "When do I do my best work?" | analyze-timing |
| "What are my strengths?" | analyze-strengths |
| "Who should review my code?" | analyze-collaboration |
| "Am I taking on too much?" | analyze-load |
| "How am I trending?" | analyze-trends |
| "What should I work on next?" | get-recommendation |

---

## UI Components

### Jira Dashboard Panel

A compact widget showing key metrics at a glance.

```
┌─────────────────────────────────────────────────────────────┐
│  🏎️ DRIVER TELEMETRY                              [⚙️] [↗️] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ LOAD        │ │ ZONE        │ │ SPRINT      │           │
│  │             │ │             │ │             │           │
│  │   4/3 ⚠️    │ │  🟢 Peak    │ │ ████░ 62%   │           │
│  │ (1 over)    │ │  Window     │ │ on track    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  💡 QUICK INSIGHT                                           │
│  You're in your peak coding window (10 AM - 12:30 PM).     │
│  Great time for complex work.                               │
│                                                             │
│  [Ask Driver Telemetry] [View Full Profile]                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Issue Panel

Context-specific insights when viewing a ticket.

```
┌─────────────────────────────────────────────────────────────┐
│  🏎️ DRIVER TELEMETRY — PROJ-456                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  THIS TICKET:                                               │
│  • Type: API Integration (your strength: -38% time)        │
│  • Component: Payment Module (you're an expert)            │
│  • Estimate: 5 points (historically takes you 45% longer)  │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  RECOMMENDATIONS:                                           │
│                                                             │
│  👥 Best reviewer: Sarah (1.1 day avg for your PRs)        │
│  ⏰ Best time to work: Now (you're in peak window)         │
│  📊 Expected completion: 2-3 days based on your patterns   │
│                                                             │
│  [View Full Analysis]                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Full Profile Page

Comprehensive view with all five intelligence modules.

```
┌─────────────────────────────────────────────────────────────┐
│  🏎️ DRIVER TELEMETRY — Performance Profile                 │
│                                                             │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ ⏰ TIME  │ 🎯 TYPE  │ 👥 TEAM  │ 📊 LOAD  │ 📈 TREND │  │
│  │  (active)│          │          │          │          │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⏰ TIMING INTELLIGENCE                                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │   YOUR DAILY PERFORMANCE CURVE                      │   │
│  │                                                     │   │
│  │   Quality                                           │   │
│  │      ▲                                              │   │
│  │   10 │          ╭───╮                               │   │
│  │    8 │        ╭─╯   ╰─╮      ╭──╮                   │   │
│  │    6 │      ╭─╯       ╰──╮ ╭─╯  ╰─╮                │   │
│  │    4 │    ╭─╯            ╰─╯      ╰─╮              │   │
│  │    2 │  ╭─╯                         ╰──╮           │   │
│  │    0 │──╯                              ╰───        │   │
│  │      └──────────────────────────────────────▶      │   │
│  │        8AM  10AM  12PM  2PM  4PM  6PM  8PM        │   │
│  │                                                     │   │
│  │   ⭐ Peak: 10:00 AM - 12:30 PM (67% better)        │   │
│  │   ⚠️ Danger: After 6:00 PM (3.4x revert rate)     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  💡 ACTIONABLE INSIGHTS                                     │
│                                                             │
│  1. Schedule deep work between 10 AM - 12:30 PM            │
│  2. Use afternoons for reviews and meetings                 │
│  3. Avoid committing code after 6 PM                        │
│  4. Tuesday is your best day — save important work for it  │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  [Export Report] [Refresh Data] [Settings]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Algorithm Design

### Timing Analysis Algorithm

```typescript
interface TimingAnalysis {
  peakWindow: { start: number; end: number; qualityMultiplier: number };
  dangerZone: { start: number; end: number; revertMultiplier: number };
  dayPatterns: Map<string, { quality: number; speed: number }>;
}

function analyzeTimingPatterns(userActivity: UserActivity[]): TimingAnalysis {
  // Group activities by hour of day
  const hourlyBuckets = groupByHour(userActivity);
  
  // Calculate quality metrics per hour
  // Quality = (1 - revisionRate) × (1 - bugRate) × approvalSpeed
  const hourlyQuality = hourlyBuckets.map(bucket => ({
    hour: bucket.hour,
    quality: calculateQualityScore(bucket.activities),
    volume: bucket.activities.length
  }));
  
  // Find peak window (highest average quality, minimum volume threshold)
  const peakWindow = findPeakWindow(hourlyQuality, minVolume: 10);
  
  // Find danger zone (lowest quality, high revert rate)
  const dangerZone = findDangerZone(hourlyQuality);
  
  // Analyze day-of-week patterns
  const dayPatterns = analyzeDayPatterns(userActivity);
  
  return { peakWindow, dangerZone, dayPatterns };
}

function calculateQualityScore(activities: Activity[]): number {
  const commits = activities.filter(a => a.type === 'commit');
  
  const revisionRate = commits.filter(c => c.hadRevisions).length / commits.length;
  const bugRate = commits.filter(c => c.introducedBug).length / commits.length;
  const avgApprovalTime = average(commits.map(c => c.approvalTimeHours));
  
  // Normalize approval time (faster = higher score)
  const approvalScore = Math.max(0, 1 - (avgApprovalTime / 48));
  
  return (1 - revisionRate) * (1 - bugRate) * approvalScore * 10;
}
```

### Strength Analysis Algorithm

```typescript
interface StrengthAnalysis {
  ticketTypes: Map<string, { userAvg: number; teamAvg: number; delta: number }>;
  components: Map<string, { userAvg: number; teamAvg: number; expertise: string }>;
}

function analyzeStrengthPatterns(
  userIssues: Issue[], 
  teamIssues: Issue[]
): StrengthAnalysis {
  
  // Group user issues by type
  const userByType = groupBy(userIssues, 'issueType');
  
  // Calculate user's average cycle time per type
  const userTypeMetrics = Object.entries(userByType).map(([type, issues]) => ({
    type,
    avgCycleTime: average(issues.map(i => i.cycleTimeDays)),
    count: issues.length
  }));
  
  // Calculate team averages for comparison
  const teamByType = groupBy(teamIssues, 'issueType');
  const teamTypeMetrics = Object.entries(teamByType).map(([type, issues]) => ({
    type,
    avgCycleTime: average(issues.map(i => i.cycleTimeDays))
  }));
  
  // Calculate delta (negative = user is faster = strength)
  const ticketTypes = new Map();
  userTypeMetrics.forEach(user => {
    const team = teamTypeMetrics.find(t => t.type === user.type);
    const delta = team 
      ? ((user.avgCycleTime - team.avgCycleTime) / team.avgCycleTime) * 100
      : 0;
    ticketTypes.set(user.type, {
      userAvg: user.avgCycleTime,
      teamAvg: team?.avgCycleTime || user.avgCycleTime,
      delta: delta  // Negative = strength, Positive = weakness
    });
  });
  
  // Similar analysis for components
  const components = analyzeComponentStrengths(userIssues, teamIssues);
  
  return { ticketTypes, components };
}
```

### Load Analysis Algorithm

```typescript
interface LoadAnalysis {
  optimalRange: { min: number; max: number };
  loadCurve: Map<number, { cycleTime: number; defectRate: number }>;
  currentLoad: number;
  recommendation: string;
}

function analyzeLoadPatterns(userHistory: IssueHistory[]): LoadAnalysis {
  // For each completed issue, calculate concurrent load at time of work
  const issuesWithLoad = userHistory.map(issue => ({
    ...issue,
    concurrentLoad: calculateConcurrentTickets(issue.inProgressDate, userHistory)
  }));
  
  // Group by concurrent load
  const loadBuckets = groupBy(issuesWithLoad, 'concurrentLoad');
  
  // Calculate metrics per load level
  const loadCurve = new Map();
  Object.entries(loadBuckets).forEach(([load, issues]) => {
    loadCurve.set(parseInt(load), {
      cycleTime: average(issues.map(i => i.cycleTimeDays)),
      defectRate: issues.filter(i => i.hadDefect).length / issues.length
    });
  });
  
  // Find optimal range (lowest cycle time + defect rate)
  const optimalRange = findOptimalLoadRange(loadCurve);
  
  // Get current load
  const currentLoad = countActiveTickets(userId);
  
  // Generate recommendation
  const recommendation = generateLoadRecommendation(currentLoad, optimalRange);
  
  return { optimalRange, loadCurve, currentLoad, recommendation };
}

function findOptimalLoadRange(loadCurve: Map<number, Metrics>): { min: number; max: number } {
  // Score each load level: lower cycle time + lower defect rate = better
  const scores = Array.from(loadCurve.entries()).map(([load, metrics]) => ({
    load,
    score: (1 / metrics.cycleTime) * (1 - metrics.defectRate)
  }));
  
  // Find loads within 90% of best score
  const bestScore = Math.max(...scores.map(s => s.score));
  const goodLoads = scores.filter(s => s.score >= bestScore * 0.9);
  
  return {
    min: Math.min(...goodLoads.map(s => s.load)),
    max: Math.max(...goodLoads.map(s => s.load))
  };
}
```

---

## Privacy & Security

### Data Principles

1. **User's own data only** — Each user can only see analysis of their own work
2. **No cross-user comparison** — Team averages are anonymized aggregates
3. **No manager access** — This tool is for individuals, not surveillance
4. **Data stays in Atlassian** — No external data storage or transmission

### Permission Scopes

| Scope | Purpose | Justification |
|-------|---------|---------------|
| `read:jira-work` | Read issues and changelogs | Required for analysis |
| `read:jira-user` | Read current user identity | Required to filter to user's data |
| `storage:app` | Cache analysis results | Performance optimization |

### Data Retention

- Analysis cache: 24 hours (refreshed daily)
- No historical data stored beyond cache
- User can clear cache at any time
- Data deleted when app is uninstalled

### What We Don't Do

- ❌ Track individual keystrokes or screen time
- ❌ Share individual data with managers
- ❌ Compare individuals to named others
- ❌ Store data outside Atlassian
- ❌ Sell or export user data

---

## Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- Atlassian Forge CLI (`npm install -g @forge/cli`)
- Atlassian Cloud developer account
- Jira Cloud instance with admin access

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/driver-telemetry.git
cd driver-telemetry

# 2. Install dependencies
npm install

# 3. Login to Forge
forge login

# 4. Register the app
forge register

# 5. Deploy to development environment
forge deploy

# 6. Install on your Jira instance
forge install --product jira --site your-site.atlassian.net

# 7. Enable Rovo in your instance (if not already enabled)
# Navigate to: Jira Settings > Features > Rovo > Enable
```

### Configuration

```bash
# Set environment variables (optional)
forge variables set CACHE_TTL_HOURS 24
forge variables set MIN_DATA_POINTS 10
forge variables set TEAM_COMPARISON true
```

### Verification

1. Open Jira in your browser
2. Navigate to any project
3. Look for "Driver Telemetry" in the project sidebar
4. Open Rovo chat and type "When do I do my best work?"

---

## Demo Script

### 5-Minute Video Outline

#### 0:00 - 0:30 | The Hook

**[Visual: Developer looking frustrated at Jira board]**

**Script:**
> "I've been using Jira for 3 years. It tracks everything I do.
> But I realized... I know nothing about my own performance.
> 
> When do I do my best work? No idea.
> What types of tickets suit me? Guesswork.
> Who should review my code? Whoever's available.
> 
> Jira knows all of this. It just never told me.
> 
> Until now."

**[Visual: Driver Telemetry logo with F1 aesthetic]**

---

#### 0:30 - 1:30 | The Concept

**[Visual: F1 car with telemetry overlay]**

**Script:**
> "In Formula 1, every driver has personal telemetry.
> They know their optimal braking points.
> Their best tire strategies.
> When they perform at their peak.
> 
> Developers have nothing like this.
> All our analytics go to managers.
> We're flying blind about ourselves."

**[Visual: Transition to Driver Telemetry interface]**

**Script:**
> "Driver Telemetry changes that.
> It analyzes YOUR work history.
> And tells YOU about YOUR patterns.
> Zero input required. Pure insight."

---

#### 1:30 - 3:30 | The Demo

**[Visual: Jira board with Driver Telemetry panel]**

**Script:**
> "Here's my Jira board. Notice this panel.
> It shows I have 4 active tickets — one over my optimal load.
> And right now, I'm in my peak coding window.
> 
> Let me ask it a question."

**[Visual: Opens Rovo chat]**

**Script:**
> "When do I do my best work?"

**[Visual: Agent responds with timing analysis]**

**Script:**
> "Turns out my best coding hours are 10 AM to 12:30 PM.
> My commits during this window have 67% fewer revisions.
> I never knew that.
> 
> Let me ask another question.
> Who should review my PR?"

**[Visual: Agent responds with collaboration analysis]**

**Script:**
> "Sarah reviews my code in 1.1 days.
> John takes 3.8 days.
> Same PR, 3x faster — just by choosing the right reviewer.
> 
> One more. Am I taking on too much?"

**[Visual: Agent responds with load analysis]**

**Script:**
> "My optimal load is 2-3 tickets.
> I have 4 right now — and historically, my defect rate 
> doubles at this load.
> 
> No one ever told me this. The data was always there.
> I just never saw it."

---

#### 3:30 - 4:30 | The Impact

**[Visual: Full profile page with all modules]**

**Script:**
> "Here's my complete performance profile.
> Timing. Strengths. Collaboration. Load. Trends.
> 
> All from data that already existed in Jira.
> Zero input from me. Pure intelligence.
> 
> This isn't for my manager. It's for ME.
> To understand myself. To optimize my work.
> To become a better developer."

---

#### 4:30 - 5:00 | The Close

**[Visual: F1 driver looking at telemetry, cross-fade to developer with Driver Telemetry]**

**Script:**
> "F1 drivers don't guess about their performance.
> They know, because they have telemetry.
> 
> Now developers have the same thing."

**[Visual: Logo with tagline]**

**Script:**
> "Driver Telemetry.
> Know yourself. Optimize yourself.
> Your personal pit crew."

---

## Codegeist Submission

### Submission Checklist

- [ ] App ID from Developer Console
- [ ] Installation link (via `forge install:distribution`)
- [ ] Demo video (< 5 minutes, uploaded to YouTube/Vimeo)
- [ ] Text description (this document)
- [ ] Category selection: Apps for Software Teams
- [ ] Bonus prizes selected: Best Rovo Apps

### Devpost Submission Text

**Title:** Driver Telemetry — Personal Performance Intelligence for Developers

**Tagline:** Like F1 telemetry, but for your development work.

**Description:**

Jira tracks everything developers do. But it never tells developers what it means.

Driver Telemetry is a Forge-powered Rovo Agent that analyzes your personal work history to reveal patterns you never knew existed:

🏎️ **TIMING** — Discover when you do your best work. Find your peak coding window and avoid your danger zones.

🏎️ **STRENGTHS** — Learn what types of work suit you. See how you compare to team averages and play to your advantages.

🏎️ **COLLABORATION** — Find your optimal code reviewers. See who you work best with and accelerate your workflow.

🏎️ **LOAD** — Know your optimal workload. Understand when you're overloaded before your quality suffers.

🏎️ **TRENDS** — Track your growth over time. See how your skills are evolving and where you're improving.

All with zero input required. Just ask.

**Built With:**
- Atlassian Forge
- Rovo Agent & Actions
- Jira REST API
- Bitbucket API
- TypeScript

**Why It's Different:**

Traditional analytics serve managers. Driver Telemetry serves YOU.

It's not surveillance — it's self-awareness.
It's not judgment — it's optimization.
It's not for your boss — it's for your growth.

Just like F1 drivers have personal telemetry to understand their performance, now developers do too.

---

## Future Roadmap

### Version 1.1
- [ ] Bitbucket integration for commit analysis
- [ ] Confluence integration for documentation patterns
- [ ] Export weekly/monthly reports

### Version 1.2
- [ ] Goal setting and tracking
- [ ] Custom alerts and notifications
- [ ] Team insights (anonymized, opt-in)

### Version 2.0
- [ ] ML-powered predictions
- [ ] Calendar integration for meeting impact analysis
- [ ] Slack integration for communication patterns

---

## License

MIT License — See LICENSE file for details.

---

## Acknowledgments

- **Atlassian** — For the Forge platform and Rovo APIs
- **Williams Racing** — For inspiring the telemetry concept
- **Codegeist 2025** — For the opportunity to build this

---

<div align="center">

**🏎️ Driver Telemetry**

*Know yourself. Optimize yourself. Your personal pit crew.*

[Demo Video](#) | [Installation](#installation--setup) | [Documentation](#)

</div>
