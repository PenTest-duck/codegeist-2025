/**
 * IssuePanel View
 * Compact telemetry view for issue sidebar
 */

import React from 'react';
import { rovo, router } from '@forge/bridge';
import { useDashboardData } from '../hooks/useDashboardData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { RACING_FLAGS, LOAD_EMOJIS } from '../lib/constants';

export const IssuePanel: React.FC = () => {
  const { data, loading, error } = useDashboardData();

  const openRovoChat = async (prompt?: string) => {
    console.log('🏎️ Opening Team Radio from Issue Panel...');
    console.log('Agent Key:', 'driver-telemetry-agent');
    console.log('Prompt:', prompt);

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

      // Show setup instructions only once per browser
      const hasSeenSetup = localStorage.getItem('driver-telemetry-agent-setup-shown');
      if (!hasSeenSetup) {
        setTimeout(() => {
          const userResponse = confirm(
            '💡 Team Radio Setup\n\n' +
            'If Rovo didn\'t open, enable the agent:\n' +
            'Chat → Browse Agents → "Driver Telemetry" → Enable\n\n' +
            'Click OK to not show this again.'
          );
          if (userResponse) {
            localStorage.setItem('driver-telemetry-agent-setup-shown', 'true');
          }
        }, 1500);
      }
    } catch (err) {
      console.error('❌ rovo.open() error:', err);

      // Try default Rovo as fallback
      try {
        console.log('Trying default Rovo agent...');
        await rovo.open({ type: 'default' });
        console.log('✅ Default Rovo opened - enable Driver Telemetry agent in Browse Agents');
        alert('Please enable "Driver Telemetry" agent:\n1. Chat → Browse Agents\n2. Find "Driver Telemetry"\n3. Click Enable');
      } catch (defaultErr) {
        console.error('❌ Default Rovo failed:', defaultErr);

        try {
          console.log('Trying router.open()...');
          await router.open('https://home.atlassian.com/assist/rovo');
          if (prompt) {
            await navigator.clipboard.writeText(`Driver Telemetry: ${prompt}`);
          }
        } catch (routerErr) {
          console.error('❌ All methods failed:', routerErr);
          alert('Rovo may not be activated. Contact your admin.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <Spinner size="small" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4">
        <Card>
          <p className="text-sm text-f1-text-secondary">
            Ask "Driver Telemetry" in Rovo chat for insights.
          </p>
        </Card>
      </div>
    );
  }

  const { activeTickets, currentTimeZone, loadStatus, todayRecommendations, timingData, loadData } = data;

  const getZoneVariant = (): 'green' | 'yellow' | 'red' => {
    return currentTimeZone === 'peak' ? 'green' :
           currentTimeZone === 'danger' ? 'red' : 'yellow';
  };

  const getLoadVariant = (): 'green' | 'yellow' | 'red' => {
    return loadStatus === 'optimal' ? 'green' :
           loadStatus === 'critical' || loadStatus === 'over' ? 'red' : 'yellow';
  };

  return (
    <div className="p-4 space-y-4 bg-f1-background-dark">
      {/* Header */}
      <Card>
        <h3 className="text-lg font-racing text-gradient-racing mb-2">
          🏎️ Telemetry
        </h3>
      </Card>

      {/* Quick Status */}
      <Card>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-bold text-f1-text-secondary mb-1">TRACK STATUS</div>
            <div className="flex items-center gap-2">
              <Badge variant={getZoneVariant()}>
                {RACING_FLAGS[currentTimeZone === 'peak' ? 'green' : currentTimeZone === 'danger' ? 'red' : 'yellow']} {currentTimeZone.toUpperCase()}
              </Badge>
              {timingData && (
                <span className="text-xs text-f1-text-muted">
                  Now: {timingData.currentHour}:00
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-f1-text-secondary mb-1">WORKLOAD</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-f1-text-primary">{activeTickets}</span>
                <span className="text-sm text-f1-text-secondary">tickets</span>
              </div>
              {loadData && (
                <div className="text-xs text-f1-text-muted">
                  Optimal: {loadData.optimalMin}-{loadData.optimalMax}
                </div>
              )}
              <Badge variant={getLoadVariant()}>
                {LOAD_EMOJIS[loadStatus]} {loadStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Recommendation */}
      {todayRecommendations && todayRecommendations.length > 0 && (
        <Card>
          <div className="space-y-2">
            <div className="text-xs font-bold text-f1-text-secondary">💡 TOP RECOMMENDATION</div>
            <div className="text-sm text-f1-text-secondary">
              {todayRecommendations[0]}
            </div>
          </div>
        </Card>
      )}

      {/* Team Radio */}
      <Card>
        <div className="space-y-2">
          <Button onClick={() => openRovoChat()} className="w-full">
            📡 Team Radio
          </Button>
          <p className="text-xs text-center text-f1-text-muted">
            Ask your pit crew for guidance
          </p>
        </div>
      </Card>
    </div>
  );
};
