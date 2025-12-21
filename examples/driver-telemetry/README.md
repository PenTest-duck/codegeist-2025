# 🏎️ Driver Telemetry

> **Personal Performance Intelligence for Developers**
> Like F1 telemetry, but for your development work.

---

## Overview

Driver Telemetry is a Forge-powered Rovo Agent that provides developers with personal performance intelligence by analyzing their work history in Jira and Bitbucket.

Unlike traditional analytics tools that serve managers, Driver Telemetry is built **for the individual developer** — helping them understand their own patterns, optimize their work habits, and become more effective.

## Key Features

### 🕐 Timing Intelligence
Discover when you do your best work based on commit quality and ticket completion patterns.

### 🎯 Strength Intelligence
Learn what types of work suit you best compared to your own baseline and team averages.

### 👥 Collaboration Intelligence
Find your optimal code reviewers and pairing partners based on historical effectiveness.

### 📊 Load Intelligence
Understand your optimal workload and avoid overcommitment before quality suffers.

### 📈 Trend Intelligence
Track your performance evolution and skills growth over time.

---

## Installation

### Prerequisites

- Node.js 18.x or higher
- Atlassian Forge CLI: `npm install -g @forge/cli`
- Atlassian Cloud developer account
- Jira Cloud instance with admin access

### Setup Steps

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Login to Forge
forge login

# 4. Register the app
forge register

# 5. Deploy to development environment
forge deploy

# 6. Install on your Jira instance
forge install --product jira
```

### Configuration

Set optional environment variables:

```bash
forge variables set CACHE_TTL_HOURS 24
forge variables set MIN_DATA_POINTS 10
forge variables set TEAM_COMPARISON true
```

---

## Usage

### Via Rovo Agent

Open Rovo chat in Jira and ask:
- "When do I do my best work?"
- "What are my strengths?"
- "Who should review my code?"
- "Am I taking on too much?"
- "How am I trending this month?"

### Via Dashboard Panel

Navigate to any Jira project to see:
- Current load status
- Current performance zone (peak/normal/danger)
- Quick insights
- Sprint progress

### Via Issue Panel

Open any issue to see:
- Your performance with this type of work
- Recommended reviewer
- Optimal timing
- Expected completion time

---

## Architecture

```
driver-telemetry/
├── src/
│   ├── analyzers/          # Intelligence analysis modules
│   ├── data/               # API clients and data fetching
│   │   ├── jira/
│   │   └── bitbucket/
│   ├── models/             # TypeScript interfaces
│   ├── utils/              # Shared utilities
│   ├── ui/                 # UI components
│   └── handlers/           # Forge function handlers
├── manifest.yml            # Forge app configuration
└── package.json
```

---

## Development

### Local Development

```bash
# Start tunnel for local testing
forge tunnel

# View logs
forge logs
```

### Building

```bash
npm run build
```

### Deploying

```bash
# Deploy to development
forge deploy

# Deploy to production
forge deploy --environment production
```

---

## Privacy & Security

- **User data only** — Each user sees only their own analysis
- **No cross-user comparison** — Team averages are anonymized
- **No manager access** — This tool is for individuals, not surveillance
- **Data stays in Atlassian** — No external storage or transmission

---

## Codegeist 2025

This app is built for the **Codegeist 2025: Atlassian Williams Racing Edition** hackathon.

**Category:** Apps for Software Teams
**Bonus Prize:** Best Rovo Apps

---

## License

MIT License - See LICENSE file for details.

---

## Support

For issues and feedback, please visit: [GitHub Issues](https://github.com/your-org/driver-telemetry/issues)

---

<div align="center">

**🏎️ Know yourself. Optimize yourself. Your personal pit crew.**

</div>
