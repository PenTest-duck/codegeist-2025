# Driver Telemetry: Custom UI Migration Plan

**Version:** 1.0
**Date:** 2024-12-19
**Status:** Planning Phase

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Why Custom UI?](#why-custom-ui)
4. [New Architecture Design](#new-architecture-design)
5. [Technology Stack](#technology-stack)
6. [Directory Structure](#directory-structure)
7. [Component Design System](#component-design-system)
8. [UI/UX Redesign](#uiux-redesign)
9. [Data Flow & Communication](#data-flow--communication)
10. [Migration Strategy](#migration-strategy)
11. [Implementation Checklist](#implementation-checklist)
12. [Timeline & Milestones](#timeline--milestones)

---

## 🎯 Executive Summary

### Current State
- Using **Forge UI Kit 2** with `@forge/react`
- Limited to Atlassian's component library (DonutChart, ProgressBar, Box, Text, etc.)
- Cannot use external npm packages like `react-d3-speedometer`
- Restrictive styling and layout options
- Dashboard feels basic and not "F1-like"

### Desired State
- Migrate to **Forge Custom UI**
- Full React freedom with modern libraries
- Advanced visualizations: react-d3-speedometer, recharts, framer-motion
- Custom F1-inspired design system
- Responsive, modern dashboard with animations
- Complete control over styling and UX

### Key Benefits
✅ Use any React library (react-d3-speedometer, recharts, etc.)
✅ Modern UI frameworks (Tailwind CSS, styled-components)
✅ Advanced animations (framer-motion)
✅ Full design control - create true F1 telemetry experience
✅ Better developer experience with standard React tooling
✅ Reusable component library

---

## 🔍 Current Architecture Analysis

### Backend (Keep As-Is)
```
src/
├── analyzers/           ✅ Keep - Working well
│   ├── timing.ts
│   ├── load.ts
│   ├── strengths.ts
│   ├── collaboration.ts
│   ├── trends.ts
│   └── currentStatus.ts
├── data/                ✅ Keep - Solid data layer
│   ├── jira/
│   ├── bitbucket/
│   └── cache.ts
├── models/              ✅ Keep - Good type definitions
├── utils/               ✅ Keep - Useful helpers
└── resolvers/           ✅ Keep - Backend communication
```

### Frontend (Replace Completely)
```
src/
└── frontend/
    └── index.tsx        ❌ Replace - UI Kit 2, very limited
```

**Current Issues:**
- UI Kit 2 components are too basic (DonutChart, ProgressBar)
- No control over styling, spacing, animations
- Cannot use external charting libraries
- Dashboard doesn't feel like F1 telemetry
- Hard to create modern, engaging UX

---

## 💡 Why Custom UI?

### 1. **Full React Ecosystem Access**
Custom UI runs in an iframe with full npm support:
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-d3-speedometer": "^2.2.1",     // ✅ Now possible!
    "recharts": "^2.10.0",                // ✅ Advanced charts
    "framer-motion": "^10.16.0",          // ✅ Animations
    "tailwindcss": "^3.4.0",              // ✅ Modern styling
    "@radix-ui/react-*": "latest"         // ✅ Headless UI
  }
}
```

### 2. **Modern Build Tooling**
- Webpack bundling (included with Forge)
- Hot module replacement during development
- Code splitting & optimization
- Asset management (images, fonts, etc.)

### 3. **Design Freedom**
Create a true F1 telemetry dashboard:
- Racing-themed color schemes
- Animated speedometers and gauges
- Real-time data visualizations
- Responsive grid layouts
- Custom typography (racing fonts)
- Smooth transitions & micro-interactions

### 4. **Better Developer Experience**
- Standard React development workflow
- TypeScript with full type safety
- Component libraries (Radix, Headless UI, etc.)
- CSS-in-JS or Tailwind CSS
- Reusable design system

---

## 🏗️ New Architecture Design

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    JIRA INTERFACE                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Custom UI (React App in iframe)            │ │
│  │                                                      │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │ │
│  │  │  Dashboard   │  │ Issue Panel  │  │  Modals  │ │ │
│  │  │  Component   │  │  Component   │  │          │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────┘ │ │
│  │           │                │                 │      │ │
│  │           └────────────────┴─────────────────┘      │ │
│  │                         │                           │ │
│  │                    invoke()                         │ │
│  │                  @forge/bridge                      │ │
│  └─────────────────────┬───────────────────────────────┘ │
│                        │                                 │
│  ┌─────────────────────▼───────────────────────────────┐ │
│  │           Forge Resolver (Backend)                  │ │
│  │                                                      │ │
│  │  getDashboardStatus()  ─►  analyzers/              │ │
│  │  getIssuePanelStatus() ─►  data/jira               │ │
│  │                       ─►  data/bitbucket            │ │
│  │                       ─►  data/cache                │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Communication Pattern
```typescript
// Frontend (Custom UI)
import { invoke } from '@forge/bridge';

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    invoke('getDashboardStatus').then(setData);
  }, []);

  return <Speedometer value={data.activeTickets} />;
};

// Backend (Resolver) - NO CHANGES NEEDED
resolver.define('getDashboardStatus', async (req) => {
  const status = await getCurrentStatus(req.context?.accountId);
  return status;
});
```

---

## 🛠️ Technology Stack

### Frontend (Custom UI)
| Technology | Purpose | Why |
|------------|---------|-----|
| **React 18** | UI framework | Standard, performant, huge ecosystem |
| **TypeScript** | Type safety | Catch errors early, better DX |
| **Tailwind CSS** | Styling | Rapid development, consistent design |
| **react-d3-speedometer** | Gauges | Beautiful F1-style speedometers |
| **Recharts** | Charts | Flexible, composable charts |
| **Framer Motion** | Animations | Smooth, professional animations |
| **@radix-ui/react-*** | UI primitives | Accessible, unstyled components |
| **React Query** | Data fetching | Smart caching, auto-refresh |
| **Zustand** | State management | Simple, lightweight state |

### Backend (No Changes)
| Technology | Purpose |
|------------|---------|
| **@forge/api** | Jira/Bitbucket API |
| **@forge/resolver** | Invoke handlers |
| **TypeScript** | Type safety |

### Build Tools
| Tool | Purpose |
|------|---------|
| **Webpack** | Bundling (included in Forge) |
| **Babel** | Transpilation |
| **PostCSS** | CSS processing |

---

## 📁 Directory Structure

### New Structure
```
driver-telemetry/
├── manifest.yml                      # Updated for Custom UI
├── package.json                      # New frontend dependencies
├── webpack.config.js                 # Webpack configuration
├── tailwind.config.js                # Tailwind CSS config
├── tsconfig.json                     # TypeScript config
│
├── src/
│   │
│   ├── backend/                      # ✅ KEEP AS-IS (minimal changes)
│   │   ├── analyzers/
│   │   │   ├── timing.ts
│   │   │   ├── load.ts
│   │   │   ├── strengths.ts
│   │   │   ├── collaboration.ts
│   │   │   ├── trends.ts
│   │   │   └── currentStatus.ts
│   │   ├── data/
│   │   │   ├── jira/
│   │   │   ├── bitbucket/
│   │   │   └── cache.ts
│   │   ├── models/
│   │   ├── utils/
│   │   ├── resolvers/
│   │   │   └── index.ts             # invoke() handlers
│   │   └── index.ts                 # Entry point
│   │
│   └── frontend/                     # ❌ COMPLETELY NEW
│       ├── index.tsx                 # React app entry point
│       ├── App.tsx                   # Root component with routing
│       │
│       ├── components/               # Reusable UI components
│       │   ├── ui/                   # Base components (Radix-based)
│       │   │   ├── Button.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Progress.tsx
│       │   │   └── Dialog.tsx
│       │   │
│       │   ├── gauges/               # F1-style visualizations
│       │   │   ├── Speedometer.tsx   # react-d3-speedometer wrapper
│       │   │   ├── LoadGauge.tsx     # Capacity meter
│       │   │   ├── TimeZoneGauge.tsx # Peak/danger zones
│       │   │   └── ProgressRing.tsx  # Sprint progress
│       │   │
│       │   ├── charts/               # Data visualizations
│       │   │   ├── TrendChart.tsx
│       │   │   ├── LoadCurve.tsx
│       │   │   └── TimingHeatmap.tsx
│       │   │
│       │   └── layout/               # Layout components
│       │       ├── DashboardGrid.tsx
│       │       ├── GaugeCluster.tsx
│       │       └── Section.tsx
│       │
│       ├── views/                    # Page-level components
│       │   ├── Dashboard.tsx         # Main dashboard view
│       │   └── IssuePanel.tsx        # Issue-specific view
│       │
│       ├── hooks/                    # Custom React hooks
│       │   ├── useInvoke.ts          # Wrapper for @forge/bridge
│       │   ├── useDashboardData.ts   # Dashboard data fetching
│       │   ├── usePolling.ts         # Auto-refresh logic
│       │   └── useTheme.ts           # Dark/light mode
│       │
│       ├── lib/                      # Utilities
│       │   ├── api.ts                # invoke() wrappers
│       │   ├── formatting.ts         # Date/number formatting
│       │   └── constants.ts          # Colors, thresholds, etc.
│       │
│       ├── types/                    # TypeScript types
│       │   └── index.ts              # Shared types
│       │
│       └── styles/                   # Global styles
│           ├── globals.css           # Tailwind imports
│           └── theme.css             # F1 color scheme
│
├── static/                           # Bundled output (auto-generated)
│   └── view/
│       ├── index.html
│       ├── app.js
│       └── app.css
│
└── public/                           # Static assets
    ├── fonts/
    │   └── racing-sans.woff2
    └── images/
        └── f1-logo.svg
```

---

## 🎨 Component Design System

### Design Tokens (F1 Theme)
```typescript
// src/frontend/lib/constants.ts
export const F1_THEME = {
  colors: {
    // Racing flag colors
    green: '#00D66F',      // Peak performance (green flag)
    yellow: '#FFD700',     // Normal (yellow flag)
    red: '#FF1E1E',        // Danger zone (red flag)

    // Dashboard accents
    primary: '#E10600',    // Ferrari red
    secondary: '#0090FF',  // Mercedes blue

    // Neutrals
    background: {
      dark: '#0A0A0A',
      card: '#1A1A1A',
      elevated: '#2A2A2A',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
      muted: '#666666',
    },
  },

  typography: {
    fontFamily: {
      racing: '"Racing Sans One", sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
  },

  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
```

### Core Components

#### 1. Speedometer (Load Gauge)
```typescript
// src/frontend/components/gauges/Speedometer.tsx
import ReactSpeedometer from 'react-d3-speedometer';
import { F1_THEME } from '@/lib/constants';

interface SpeedometerProps {
  value: number;
  maxValue: number;
  optimalMin: number;
  optimalMax: number;
  label: string;
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  value,
  maxValue,
  optimalMin,
  optimalMax,
  label,
}) => {
  return (
    <div className="relative">
      <ReactSpeedometer
        value={value}
        minValue={0}
        maxValue={maxValue}
        needleColor={F1_THEME.colors.red}
        startColor={F1_THEME.colors.green}
        endColor={F1_THEME.colors.red}
        segments={5}
        customSegmentStops={[0, optimalMin, optimalMax, maxValue * 0.75, maxValue]}
        segmentColors={[
          F1_THEME.colors.secondary,  // Under
          F1_THEME.colors.green,       // Optimal
          F1_THEME.colors.yellow,      // Over
          F1_THEME.colors.red,         // Critical
        ]}
        currentValueText={`${value} Active`}
        textColor={F1_THEME.colors.text.primary}
        needleTransitionDuration={1000}
        needleTransition="easeElastic"
        width={300}
        height={200}
      />
      <div className="text-center mt-2 text-sm text-gray-400">
        {label}
      </div>
    </div>
  );
};
```

#### 2. TimeZone Gauge (Peak/Danger Hours)
```typescript
// src/frontend/components/gauges/TimeZoneGauge.tsx
import { motion } from 'framer-motion';

interface TimeZoneGaugeProps {
  currentHour: number;
  peakStart: number;
  peakEnd: number;
  dangerStart?: number;
  dangerEnd?: number;
}

export const TimeZoneGauge: React.FC<TimeZoneGaugeProps> = ({
  currentHour,
  peakStart,
  peakEnd,
  dangerStart,
  dangerEnd,
}) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getZone = (hour: number) => {
    if (hour >= peakStart && hour <= peakEnd) return 'peak';
    if (dangerStart && hour >= dangerStart && hour <= dangerEnd) return 'danger';
    return 'normal';
  };

  return (
    <div className="relative w-full h-32">
      {/* 24-hour timeline */}
      <div className="flex justify-between items-end h-full">
        {hours.map((hour) => {
          const zone = getZone(hour);
          const isCurrent = hour === currentHour;

          return (
            <motion.div
              key={hour}
              className={`w-[3%] rounded-t transition-all ${
                zone === 'peak' ? 'bg-green-500' :
                zone === 'danger' ? 'bg-red-500' :
                'bg-gray-700'
              }`}
              style={{
                height: zone === 'peak' ? '100%' :
                        zone === 'danger' ? '60%' :
                        '40%',
              }}
              animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {isCurrent && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="text-xs font-bold bg-blue-500 px-2 py-1 rounded">
                    {hour}:00
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>00:00</span>
        <span>12:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
};
```

#### 3. Dashboard Grid Layout
```typescript
// src/frontend/components/layout/DashboardGrid.tsx
export const DashboardGrid: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
      {children}
    </div>
  );
};

export const GaugeCard: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-lg p-6 shadow-2xl border border-gray-800"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
      {children}
    </motion.div>
  );
};
```

---

## 🎯 UI/UX Redesign

### Dashboard Layout (Desktop)
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🏎️ Driver Telemetry Dashboard           [Refresh] [•••] ┃
┃  Real-time performance analytics • Last updated: 14:32:05  ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                             ┃
┃  ┏━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━┓              ┃
┃  ┃ 🏁 Track Status   ┃  ┃ ⛽ Workload      ┃              ┃
┃  ┃                   ┃  ┃                   ┃              ┃
┃  ┃  [Timeline Bar]   ┃  ┃  [Speedometer]    ┃              ┃
┃  ┃  ████▓▓▓░░░░░░    ┃  ┃      ╱│╲          ┃              ┃
┃  ┃  🟢 Peak: 16-17   ┃  ┃     ╱ │ ╲         ┃              ┃
┃  ┃  🔴 Danger: 1-5   ┃  ┃    ╱  │  ╲        ┃              ┃
┃  ┃  Current: 14:30   ┃  ┃   0   3   20      ┃              ┃
┃  ┃                   ┃  ┃  OPTIMAL: 2-3     ┃              ┃
┃  ┗━━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━┛              ┃
┃                                                             ┃
┃  ┏━━━━━━━━━━━━━━━━━━┓  ┏━━━━━━━━━━━━━━━━━━┓              ┃
┃  ┃ 🏁 Sprint        ┃  ┃ 📊 Performance    ┃              ┃
┃  ┃                   ┃  ┃                   ┃              ┃
┃  ┃  [Progress Ring]  ┃  ┃  [Trend Chart]    ┃              ┃
┃  ┃      72%          ┃  ┃   ╱╲  ╱╲         ┃              ┃
┃  ┃     ████          ┃  ┃  ╱  ╲╱  ╲╱       ┃              ┃
┃  ┃    ██  ██         ┃  ┃ ╱                 ┃              ┃
┃  ┃    ██████         ┃  ┃ Velocity ↑ 15%    ┃              ┃
┃  ┗━━━━━━━━━━━━━━━━━━┛  ┗━━━━━━━━━━━━━━━━━━┛              ┃
┃                                                             ┃
┃  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ┃
┃  ┃ 🎯 Recommendations                                   ┃  ┃
┃  ┃ • ⏰ TIMING: You're in your peak productivity window ┃  ┃
┃  ┃ • 📊 WORKLOAD: Optimal balance ⭐                    ┃  ┃
┃  ┃ • 📋 FOCUS: 3 tasks in progress - review priorities ┃  ┃
┃  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ┃
┃                                                             ┃
┃  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  ┃
┃  ┃ 📡 Team Radio                                        ┃  ┃
┃  ┃ [Open Rovo Chat]  Quick: [When?] [What?] [Too much?]┃  ┃
┃  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Key Design Improvements

1. **F1-Inspired Color Scheme**
   - Dark background (#0A0A0A) like F1 garage
   - Racing colors: Green (go), Yellow (caution), Red (stop)
   - Accent colors from F1 teams (Ferrari red, Mercedes blue)

2. **Real Speedometers**
   - react-d3-speedometer for workload gauge
   - Animated needle transitions
   - Color-coded segments (optimal range highlighted)

3. **Animated Timeline**
   - 24-hour bar visualization
   - Animated "current time" indicator
   - Height-coded zones (peak = tallest)

4. **Smooth Animations**
   - Framer Motion page transitions
   - Gauge needle animations
   - Counter number animations
   - Hover effects on cards

5. **Responsive Grid**
   - Tailwind CSS grid
   - 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
   - Cards reorder based on priority

---

## 🔄 Data Flow & Communication

### Frontend → Backend Communication
```typescript
// src/frontend/hooks/useInvoke.ts
import { invoke } from '@forge/bridge';
import { useQuery } from '@tanstack/react-query';

export const useInvoke = <T>(method: string, params?: any) => {
  return useQuery({
    queryKey: [method, params],
    queryFn: () => invoke<T>(method, params),
    refetchInterval: 30000, // Auto-refresh every 30s
  });
};

// Usage in component
const Dashboard = () => {
  const { data, isLoading } = useInvoke<CurrentStatus>('getDashboardStatus');

  if (isLoading) return <LoadingSpinner />;

  return (
    <DashboardGrid>
      <GaugeCard title="Workload">
        <Speedometer
          value={data.activeTickets}
          maxValue={data.loadData.optimalMax * 2}
          optimalMin={data.loadData.optimalMin}
          optimalMax={data.loadData.optimalMax}
        />
      </GaugeCard>
    </DashboardGrid>
  );
};
```

### Backend Resolvers (Minimal Changes)
```typescript
// src/backend/resolvers/index.ts
// NO CHANGES NEEDED - Same invoke() handlers work with Custom UI!

resolver.define('getDashboardStatus', async (req) => {
  const accountId = req.context?.accountId;
  const status = await getCurrentStatus(accountId);
  return status;
});

resolver.define('getIssuePanelStatus', async (req) => {
  const accountId = req.context?.accountId;
  const status = await getCurrentStatus(accountId);
  return status;
});
```

### Auto-Refresh Pattern
```typescript
// src/frontend/hooks/usePolling.ts
export const usePolling = (callback: () => void, interval: number) => {
  useEffect(() => {
    callback(); // Initial call
    const id = setInterval(callback, interval);
    return () => clearInterval(id);
  }, [callback, interval]);
};

// Usage
const Dashboard = () => {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    const result = await invoke('getDashboardStatus');
    setData(result);
  }, []);

  usePolling(fetchData, 30000); // Every 30s

  return <DashboardView data={data} />;
};
```

---

## 🚀 Migration Strategy

### Phase 1: Setup & Scaffolding (Day 1-2)
**Goal:** Get Custom UI infrastructure working

1. **Install Dependencies**
   ```bash
   npm install react react-dom
   npm install react-d3-speedometer recharts framer-motion
   npm install tailwindcss postcss autoprefixer
   npm install @tanstack/react-query zustand
   npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
   npm install -D @types/react @types/react-dom webpack webpack-cli
   ```

2. **Create Webpack Config**
   - Configure for Custom UI bundling
   - Set up hot reload
   - Configure asset handling

3. **Update manifest.yml**
   ```yaml
   resources:
     - key: main-ui
       path: static/view

   modules:
     jira:projectPage:
       - key: driver-telemetry-dashboard
         resource: main-ui
         resolver:
           function: ui-resolver
         render: custom-ui  # Changed from 'native'
   ```

4. **Create Basic App Shell**
   - src/frontend/index.tsx (React entry)
   - src/frontend/App.tsx (routing)
   - Verify invoke() communication works

### Phase 2: Component Library (Day 3-5)
**Goal:** Build reusable F1-themed components

1. **Base UI Components**
   - Button, Card, Badge, Progress
   - Typography components
   - Layout grid system

2. **Gauge Components**
   - Speedometer (react-d3-speedometer)
   - TimeZone gauge (24-hour timeline)
   - Progress ring (sprint completion)
   - Load curve chart

3. **Styling System**
   - Tailwind config with F1 colors
   - Dark theme
   - Racing fonts
   - Animation utilities

### Phase 3: Dashboard Views (Day 6-8)
**Goal:** Rebuild dashboard with new components

1. **Main Dashboard**
   - Track conditions section
   - Workload speedometer
   - Sprint progress
   - Recommendations panel
   - Team Radio integration

2. **Issue Panel**
   - Compact view variant
   - Key metrics only
   - Quick actions

3. **Data Integration**
   - Connect to existing resolvers
   - Implement auto-refresh
   - Handle loading states
   - Error boundaries

### Phase 4: Polish & Testing (Day 9-10)
**Goal:** Production-ready quality

1. **Animations & Transitions**
   - Framer Motion page transitions
   - Gauge needle animations
   - Card hover effects
   - Loading skeletons

2. **Responsive Design**
   - Mobile layout
   - Tablet optimization
   - Desktop multi-column

3. **Performance**
   - Code splitting
   - Lazy loading
   - Bundle optimization

4. **Testing**
   - Component testing
   - Integration testing
   - User acceptance testing

---

## ✅ Implementation Checklist

### Setup
- [ ] Install Custom UI dependencies
- [ ] Create webpack.config.js
- [ ] Create tailwind.config.js
- [ ] Update manifest.yml for Custom UI
- [ ] Set up src/frontend/ directory structure
- [ ] Configure TypeScript for frontend
- [ ] Test basic React app renders

### Base Components
- [ ] Button component
- [ ] Card component
- [ ] Badge component
- [ ] Progress component
- [ ] Typography components
- [ ] Grid layout components

### Gauges & Visualizations
- [ ] Speedometer component (react-d3-speedometer)
- [ ] TimeZone gauge (24-hour timeline)
- [ ] Progress ring (sprint)
- [ ] Trend chart (recharts)
- [ ] Load curve chart

### Hooks & Utilities
- [ ] useInvoke hook
- [ ] useDashboardData hook
- [ ] usePolling hook
- [ ] useTheme hook
- [ ] API wrapper functions
- [ ] Formatting utilities

### Views
- [ ] Dashboard view
- [ ] Issue panel view
- [ ] Loading states
- [ ] Error states
- [ ] Empty states

### Styling
- [ ] Tailwind CSS setup
- [ ] F1 color scheme
- [ ] Dark theme
- [ ] Racing fonts
- [ ] Responsive grid
- [ ] Animation utilities

### Integration
- [ ] Connect to getDashboardStatus
- [ ] Connect to getIssuePanelStatus
- [ ] Implement auto-refresh (30s)
- [ ] Handle Rovo chat integration
- [ ] Test with real Jira data

### Polish
- [ ] Framer Motion animations
- [ ] Loading skeletons
- [ ] Hover effects
- [ ] Transitions
- [ ] Mobile responsive
- [ ] Error boundaries

### Testing & Deployment
- [ ] Component tests
- [ ] Integration tests
- [ ] Browser testing (Chrome, Firefox, Safari)
- [ ] Mobile testing
- [ ] Build optimization
- [ ] Deploy to development
- [ ] User acceptance testing
- [ ] Deploy to production

---

## 📅 Timeline & Milestones

### Week 1: Foundation
**Days 1-2:** Setup & Infrastructure
- Custom UI scaffold working
- Basic React app rendering
- invoke() communication verified

**Days 3-5:** Component Library
- All base UI components built
- F1 styling applied
- Gauge components implemented

### Week 2: Implementation
**Days 6-8:** Dashboard Views
- Main dashboard rebuilt
- Issue panel rebuilt
- Data integration complete

**Days 9-10:** Polish
- Animations added
- Responsive design complete
- Performance optimized

### Launch Ready
- [ ] All checklist items complete
- [ ] Tested in real Jira environment
- [ ] User feedback incorporated
- [ ] Ready for Hackathon submission

---

## 🎓 Learning Resources

### Custom UI Documentation
- [Forge Custom UI Guide](https://developer.atlassian.com/platform/forge/custom-ui/)
- [Custom UI Bundling](https://developer.atlassian.com/platform/forge/custom-ui-bundling/)
- [@forge/bridge API](https://developer.atlassian.com/platform/forge/bridge-api-reference/)

### React Libraries
- [react-d3-speedometer](https://github.com/palerdot/react-d3-speedometer)
- [Recharts](https://recharts.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 📝 Notes & Considerations

### Advantages of This Approach
✅ Full React ecosystem access
✅ Modern, engaging F1-themed UI
✅ Reusable component library
✅ Better developer experience
✅ Production-ready quality

### Trade-offs
⚠️ More complex setup (Webpack, etc.)
⚠️ Larger bundle size vs UI Kit 2
⚠️ Need to implement own styling (no Atlassian components)

### Why It's Worth It
🎯 **User Experience:** Dashboard will look professional and engaging
🎯 **Hackathon Impact:** Stand out with polished, modern UI
🎯 **Maintainability:** Standard React is easier to maintain long-term
🎯 **Scalability:** Can add any features/libraries in future

---

## 🚦 Next Steps

**Ready to proceed?** Let's start with Phase 1:

1. Review this plan and approve
2. Begin setup & scaffolding
3. Test Custom UI infrastructure
4. Build component library
5. Rebuild dashboard views
6. Polish and deploy

**Questions to address:**
- Any specific F1 teams' color schemes you prefer? (Ferrari, Mercedes, Red Bull, etc.)
- Any additional visualizations you want?
- Mobile priority or desktop-first?
- Dark mode only or light mode support too?

---

**This is your blueprint for building a world-class F1-inspired telemetry dashboard!** 🏎️💨
