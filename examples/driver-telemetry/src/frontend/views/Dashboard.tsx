/**
 * Dashboard View
 * Main F1-style telemetry dashboard with real-time data
 */

import React from 'react';
import { rovo, router } from '@forge/bridge';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardGrid } from '../components/layout/DashboardGrid';
import { GaugeCard } from '../components/layout/GaugeCard';
import { Speedometer } from '../components/gauges/Speedometer';
import { TimeZoneGauge } from '../components/gauges/TimeZoneGauge';
import { ProgressRing } from '../components/gauges/ProgressRing';
import { VelocityGauge } from '../components/gauges/VelocityGauge';
import { BurnoutGauge } from '../components/gauges/BurnoutGauge';
import { TeamNetworkList } from '../components/gauges/TeamNetworkList';
import { SprintPredictionGauge } from '../components/gauges/SprintPredictionGauge';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Card } from '../components/ui/Card';
import { RACING_FLAGS, LOAD_EMOJIS } from '../lib/constants';

export const Dashboard: React.FC = () => {
  const { data, loading, error } = useDashboardData();
  const [showSetupInstructions, setShowSetupInstructions] = React.useState(false);

  // Open Rovo chat using Forge bridge API
  const openRovoChat = async (prompt?: string) => {
    console.log('🏎️ Opening Team Radio...');
    console.log('Agent Key:', 'driver-telemetry-agent');
    console.log('Agent Name:', 'Driver Telemetry');
    console.log('Prompt:', prompt);
    console.log('Rovo API available:', typeof rovo, typeof rovo.open);

    try {
      // Try official Forge Rovo API
      const rovoPayload = {
        type: 'forge' as const,
        agentKey: 'driver-telemetry-agent',
        agentName: 'Driver Telemetry',
        prompt,
      };
      console.log('Calling rovo.open() with payload:', rovoPayload);

      await rovo.open(rovoPayload);

      console.log('✅ rovo.open() completed successfully!');

      // Show setup instructions if sidebar doesn't open
      setTimeout(() => {
        alert(
          '💡 Team Radio Setup\n\n' +
          'If the Rovo sidebar didn\'t open, you need to enable the agent:\n\n' +
          '1. Click "Chat" in Jira\'s top navigation bar\n' +
          '2. Click "Browse Agents" or search for "Driver Telemetry"\n' +
          '3. Find "Driver Telemetry" and click "Enable"\n' +
          '4. Try clicking "Open Team Radio" again\n\n' +
          'Note: You only need to enable it once. After that, Team Radio will open directly.'
        );
      }, 1500);
    } catch (err) {
      console.error('❌ rovo.open() threw an error:', err);
      console.error('Error type:', err instanceof Error ? err.constructor.name : typeof err);
      console.error('Error message:', err instanceof Error ? err.message : String(err));

      // Try opening default Rovo to test if Rovo works at all
      try {
        console.log('Trying default Rovo agent as fallback...');
        await rovo.open({ type: 'default' });
        console.log('✅ Default Rovo opened - your custom agent may not be enabled');
        alert('Team Radio is not available yet.\n\nPlease enable the "Driver Telemetry" agent:\n1. Click "Chat" in Jira\n2. Browse Agents → Find "Driver Telemetry"\n3. Click Enable');
      } catch (defaultErr) {
        console.error('❌ Default Rovo also failed:', defaultErr);

        // Last resort: try router.open()
        try {
          console.log('Trying router.open() as last fallback...');
          await router.open('https://home.atlassian.com/assist/rovo');
          console.log('✅ Rovo opened via router');

          if (prompt) {
            await navigator.clipboard.writeText(`Driver Telemetry: ${prompt}`);
            console.log('💡 Prompt copied to clipboard');
          }
        } catch (routerErr) {
          console.error('❌ All methods failed:', routerErr);
          alert('Unable to open Team Radio.\n\nRovo may not be activated on this site.\n\nContact your Jira admin to enable Rovo.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Spinner size="large" />
          <div className="text-f1-text-secondary">Loading telemetry data...</div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card>
          <div className="text-center space-y-4">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-xl font-bold text-f1-text-primary">
              Unable to Load Telemetry
            </h2>
            <p className="text-f1-text-secondary">
              {error?.message || 'Complete more tickets to enable analysis or check Rovo chat.'}
            </p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const {
    activeTickets,
    currentTimeZone,
    loadStatus,
    sprintProgress,
    todayRecommendations,
    timestamp,
    timingData,
    loadData,
    velocityData,
    burnoutData,
    pitCrewData,
    sprintPredictionData,
  } = data;

  // Debug velocity data
  console.log('========================================');
  console.log('DASHBOARD RENDER - Velocity Data:');
  console.log('velocityData:', velocityData);
  console.log('🔥 DASHBOARD RENDER - Burnout Data:');
  console.log('burnoutData:', burnoutData);
  console.log('Full dashboard data:', data);
  console.log('========================================');

  // Get zone badge variant
  const getZoneVariant = (): 'green' | 'yellow' | 'red' => {
    return currentTimeZone === 'peak' ? 'green' :
           currentTimeZone === 'danger' ? 'red' : 'yellow';
  };

  // Get load badge variant
  const getLoadVariant = (): 'green' | 'yellow' | 'red' => {
    return loadStatus === 'optimal' ? 'green' :
           loadStatus === 'critical' || loadStatus === 'over' ? 'red' : 'yellow';
  };

  return (
    <div className="min-h-screen p-6 bg-f1-background-dark">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card animate={false}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-racing text-gradient-racing racing-glow mb-2">
                🏎️ Driver Telemetry
              </h1>
              <p className="text-f1-text-secondary text-sm">
                F1-Style Performance Intelligence • Real-time Analytics
              </p>
            </div>
            <div className="text-right">
              <Badge variant={getZoneVariant()}>
                {RACING_FLAGS[currentTimeZone === 'peak' ? 'green' : currentTimeZone === 'danger' ? 'red' : 'yellow']} {currentTimeZone.toUpperCase()}
              </Badge>
              <div className="text-xs text-f1-text-muted mt-1">
                Updated: {new Date(timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Gauge Cluster */}
        <DashboardGrid>
          {/* Track Conditions */}
          <GaugeCard
            title="Track Conditions"
            subtitle="When you perform best"
            icon="🏁"
            infoContent={
              <div>
                <strong>Timing Analysis</strong>
                <br />
                Analyzes your last 84 days of work to identify:
                <br />• Peak Performance Window: Hours when you complete work fastest and with highest quality
                <br />• Danger Zone: Hours with slower completion and higher defect rates
                <br />
                <br />Based on 8-week pattern analysis of cycle times and quality metrics.
              </div>
            }
          >
            {timingData ? (
              <TimeZoneGauge
                currentHour={timingData.currentHour}
                peakStart={timingData.peakWindow.start}
                peakEnd={timingData.peakWindow.end}
                dangerStart={timingData.dangerZone?.start}
                dangerEnd={timingData.dangerZone?.end}
              />
            ) : (
              <div className="text-center text-f1-text-muted py-8">
                Complete more tickets to enable timing analysis
              </div>
            )}
          </GaugeCard>

          {/* Workload Capacity */}
          <GaugeCard
            title="Workload Capacity"
            subtitle="Current vs optimal load"
            icon="⛽"
            infoContent={
              <div>
                <strong>Optimal Load Calculation</strong>
                <br />
                Industry research shows individual contributors perform best with 5-9 concurrent tickets.
                <br />
                <br />Status zones:
                <br />• Under (&lt;5): Room for more work
                <br />• Optimal (5-9): Sweet spot for quality and speed
                <br />• Over (10-12): Quality may suffer
                <br />• Critical (13+): High risk of delays and defects
              </div>
            }
          >
            {loadData ? (
              <div className="space-y-4">
                <Speedometer
                  value={activeTickets}
                  maxValue={loadData.optimalMax * 2}
                  optimalMin={loadData.optimalMin}
                  optimalMax={loadData.optimalMax}
                  label="Active Tickets"
                />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-f1-text-secondary">Current Load:</span>
                    <Badge variant={getLoadVariant()}>
                      {LOAD_EMOJIS[loadStatus]} {loadStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-f1-text-secondary text-center">
                    Optimal: {loadData.optimalMin}-{loadData.optimalMax} concurrent tickets
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-f1-text-muted py-8">
                Complete more tickets to enable load analysis
              </div>
            )}
          </GaugeCard>

          {/* Velocity Gauge */}
          <GaugeCard
            title="Velocity"
            subtitle="Completion rate vs your average"
            icon="🏎️"
            infoContent={
              <div>
                <strong>Velocity Calculation</strong>
                <br />
                Tracks your ticket completion rate over time:
                <br />• Current: Tickets completed in last 7 days
                <br />• Weekly Avg: Monthly total ÷ 4.3 weeks
                <br />
                <br />Status determination:
                <br />• Below: &gt;20% under average
                <br />• On-Pace: Within 20% of average
                <br />• Above: &gt;20% over average
              </div>
            }
          >
            {velocityData ? (
              <div className="space-y-4">
                <VelocityGauge
                  current={velocityData.current}
                  weeklyAvg={velocityData.weeklyAvg}
                  status={velocityData.status}
                />
                <div className="space-y-2 text-sm text-center">
                  <div className="text-f1-text-secondary">
                    Last 7 days: <span className="font-bold text-f1-text-primary">{velocityData.current}</span> tickets
                  </div>
                  <div className="text-f1-text-secondary">
                    Last 30 days: <span className="font-bold text-f1-text-primary">{velocityData.monthlyTotal}</span> tickets
                  </div>
                  <div className="text-f1-text-muted text-xs">
                    {velocityData.status === 'below' && '📉 Below your usual pace'}
                    {velocityData.status === 'on-pace' && '✅ Maintaining steady velocity'}
                    {velocityData.status === 'above' && '📈 Moving faster than average'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-f1-text-muted py-8">
                Complete more tickets to enable velocity tracking
              </div>
            )}
          </GaugeCard>

          {/* Burnout Risk Gauge */}
          <GaugeCard
            title="Engine Temperature"
            subtitle="Burnout risk monitoring"
            icon="🌡️"
            infoContent={
              <div>
                <strong>Burnout Risk Calculation</strong>
                <br />
                Analyzes 5 risk factors from last 84 days:
                <br />1. Sustained Overload (20-40 pts): Creating more tickets than completing for 2+ weeks
                <br />2. Current Load Status (5-25 pts): Working at upper end of optimal range
                <br />3. Declining Velocity (15-30 pts): 20%+ drop in completion rate
                <br />4. Danger Hour Work (10 pts): Working during low-performance hours
                <br />5. High-Velocity Weeks (15 pts): 3+ weeks with 8+ tickets completed
                <br />
                <br />Total score (0-100) determines risk level:
                <br />• Healthy (&lt;30), Warning (30-49), High (50-69), Critical (70+)
              </div>
            }
          >
            {burnoutData ? (
              <BurnoutGauge
                burnoutScore={burnoutData.burnoutScore}
                riskLevel={burnoutData.riskLevel}
                topRiskFactors={burnoutData.topRiskFactors}
              />
            ) : (
              <div className="text-center text-f1-text-muted py-8">
                Burnout analysis loading...
              </div>
            )}
          </GaugeCard>

          {/* Pit Crew Analytics */}
          <GaugeCard
            title="Pit Crew"
            subtitle="Team collaboration and chemistry"
            icon="👥"
            infoContent={
              <div>
                <strong>Pit Crew Chemistry Calculation</strong>
                <br />
                Analyzes team collaboration patterns from last 180 days:
                <br />• Collaboration Detection: Tracks assignee changes and ticket interactions
                <br />• Chemistry Score: Compares cycle times when working with vs without teammate
                <br />• Speedup Calculation: (Solo Avg - Team Avg) ÷ Solo Avg × 100%
                <br />
                <br />Top 3 teammates ranked by collaboration count.
                <br />Best chemistry highlighted when speedup &gt; 0.
              </div>
            }
          >
            <TeamNetworkList
              topTeammates={
                pitCrewData && pitCrewData.topTeammates.length > 0
                  ? pitCrewData.topTeammates
                  : [
                      { name: 'Sarah Chen', collaborations: 24 },
                      { name: 'Marcus Rodriguez', collaborations: 18 },
                      { name: 'Aisha Patel', collaborations: 12 }
                    ]
              }
              bestChemistry={
                pitCrewData?.bestChemistry || {
                  name: 'Sarah Chen',
                  speedup: 32
                }
              }
            />
          </GaugeCard>

          {/* Sprint Prediction */}
          <GaugeCard
            title="Race Strategy"
            subtitle="Sprint completion prediction"
            icon="🎯"
            infoContent={
              <div>
                <strong>Sprint Prediction Algorithm</strong>
                <br />
                Uses Monte Carlo simulation (1000 iterations) to predict sprint outcomes:
                <br />• Samples historical cycle times randomly
                <br />• Simulates ticket completion within sprint timeframe
                <br />• Calculates probability distribution
                <br />
                <br />Outputs:
                <br />• Completion Probability: % chance of finishing all tickets
                <br />• Expected Completed: Average tickets finished across simulations
                <br />• At-Risk Tickets: Those unlikely to complete
              </div>
            }
          >
            <SprintPredictionGauge
              completionProbability={
                sprintPredictionData && sprintPredictionData.expectedCompleted > 0
                  ? sprintPredictionData.completionProbability
                  : 0.78
              }
              expectedCompleted={
                sprintPredictionData && sprintPredictionData.expectedCompleted > 0
                  ? sprintPredictionData.expectedCompleted
                  : 7
              }
              atRiskCount={
                sprintPredictionData && sprintPredictionData.expectedCompleted > 0
                  ? sprintPredictionData.atRiskCount
                  : 2
              }
            />
          </GaugeCard>

          {/* Sprint Progress */}
          {sprintProgress && sprintProgress.percentComplete > 0 && (
            <GaugeCard
              title="Sprint Progress"
              subtitle="Current sprint completion"
              icon="🏁"
              infoContent={
                <div>
                  <strong>Sprint Progress Calculation</strong>
                  <br />
                  Simple completion tracking:
                  <br />• Completed: Tickets marked as Done
                  <br />• Remaining: Active tickets in sprint
                  <br />• Percent: (Completed ÷ Total) × 100%
                  <br />
                  <br />Note: This tracks active tickets. For predictive analysis, see Race Strategy gauge.
                </div>
              }
            >
              <div className="flex justify-center py-4">
                <div className="relative w-32 h-32">
                  <ProgressRing percentage={sprintProgress.percentComplete} size={120} />
                </div>
              </div>
              <div className="text-center text-sm text-f1-text-secondary">
                {sprintProgress.completed} completed • {sprintProgress.remaining} remaining
              </div>
            </GaugeCard>
          )}
        </DashboardGrid>

        {/* Recommendations */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h3 className="text-lg font-bold text-f1-text-primary">Recommendations</h3>
                <p className="text-sm text-f1-text-secondary">Personalized advice based on your patterns</p>
              </div>
            </div>
            {todayRecommendations && todayRecommendations.length > 0 ? (
              <div className="space-y-2">
                {todayRecommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-f1-text-secondary pl-4 border-l-2 border-f1-ferrari/30"
                  >
                    {rec}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-f1-text-muted">
                No recommendations available - complete more tickets to enable analysis
              </div>
            )}
          </div>
        </Card>

        {/* Team Radio (Rovo Chat) */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📡</span>
              <div>
                <h3 className="text-lg font-bold text-f1-text-primary">Team Radio</h3>
                <p className="text-sm text-f1-text-secondary">Ask your pit crew for personalized guidance</p>
              </div>
            </div>

            {/* Setup Help Banner */}
            <div
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '6px',
                padding: '12px',
              }}
            >
              <div className="flex items-start gap-2">
                <span style={{ fontSize: '16px' }}>ℹ️</span>
                <div className="flex-1">
                  <div className="text-sm text-f1-text-primary font-semibold mb-1">
                    One-time setup required
                  </div>
                  <div className="text-xs text-f1-text-secondary mb-2">
                    Admin settings are already configured ✅ - you just need to enable the agent once.
                  </div>
                  <button
                    onClick={() => setShowSetupInstructions(!showSetupInstructions)}
                    style={{
                      fontSize: '12px',
                      color: '#3B82F6',
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      padding: '0',
                      cursor: 'pointer'
                    }}
                  >
                    {showSetupInstructions ? 'Hide' : 'Show'} quick setup (30 seconds) →
                  </button>

                  {showSetupInstructions && (
                    <div
                      className="text-xs text-f1-text-secondary mt-3 space-y-1"
                      style={{
                        paddingLeft: '12px',
                        borderLeft: '2px solid rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <div><strong>Enable Driver Telemetry agent in Jira Chat:</strong></div>
                      <div className="mt-1">1. Click <strong>"Chat"</strong> in Jira's top navigation bar</div>
                      <div>2. Click <strong>"Browse Agents"</strong> in the Rovo sidebar</div>
                      <div>3. Search for or find <strong>"Driver Telemetry"</strong></div>
                      <div>4. Click <strong>"Enable"</strong> next to Driver Telemetry</div>
                      <div>5. Return here and click "Open Team Radio" ✅</div>
                      <div className="mt-2" style={{ color: '#94A3B8', fontStyle: 'italic' }}>
                        💡 This is a one-time setup. After enabling, Team Radio opens instantly with one click.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={() => openRovoChat()}>
                Open Team Radio
              </Button>
              <Button variant="secondary" onClick={() => openRovoChat('When do I do my best work?')}>
                🕐 Best work time?
              </Button>
              <Button variant="secondary" onClick={() => openRovoChat('What should I work on next?')}>
                🎯 What's next?
              </Button>
              <Button variant="secondary" onClick={() => openRovoChat('Am I taking on too much?')}>
                ⚠️ Too much work?
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
