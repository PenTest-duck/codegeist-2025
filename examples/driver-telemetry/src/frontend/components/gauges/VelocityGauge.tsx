/**
 * Velocity Gauge Component
 * Shows ticket completion velocity vs personal average
 */

import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';
import { F1_THEME } from '../../lib/constants';

export interface VelocityGaugeProps {
  current: number;      // Tickets completed in last 7 days
  weeklyAvg: number;    // 30-day rolling average
  status: 'below' | 'on-pace' | 'above';
}

export const VelocityGauge: React.FC<VelocityGaugeProps> = ({
  current,
  weeklyAvg,
  status
}) => {
  // Calculate max value for gauge
  // Ensure maxValue can accommodate current value with 20% headroom
  const baseMax = Math.max(weeklyAvg * 2.5, 10); // At least 2.5x average or 10
  const maxValue = Math.max(baseMax, current * 1.2); // Ensure current fits with headroom

  // Define zones: below average, on-pace (±20%), above average
  const belowZone = weeklyAvg * 0.8;
  const aboveZone = weeklyAvg * 1.2;

  const customSegmentStops = [
    0,
    belowZone,      // Below average zone
    weeklyAvg,      // On-pace start
    aboveZone,      // On-pace end
    maxValue        // Above average zone
  ];

  const segmentColors = [
    '#3498DB',      // Blue - below average
    '#00D66F',      // Green - on pace (lower half)
    '#00D66F',      // Green - on pace (upper half)
    '#FFD700',      // Yellow - above average (may indicate overwork)
  ];

  console.log('VelocityGauge render:', {
    current,
    weeklyAvg,
    maxValue,
    zones: { belowZone, weeklyAvg, aboveZone, maxValue }
  });

  return (
    <div className="flex flex-col items-center">
      <ReactSpeedometer
        value={current}
        minValue={0}
        maxValue={maxValue}
        customSegmentStops={customSegmentStops}
        segmentColors={segmentColors}
        needleColor={F1_THEME.speedometer.needleColor}
        needleTransition={F1_THEME.speedometer.needleTransition as any}
        needleTransitionDuration={F1_THEME.speedometer.needleTransitionDuration}
        currentValueText={`${current} tickets`}
        width={280}
        height={180}
        ringWidth={40}
        valueTextFontSize="16px"
        labelFontSize="0px"
      />
      <div className="mt-2 text-center">
        <div className="text-xs text-f1-text-secondary">
          Weekly Average: {weeklyAvg.toFixed(1)} tickets
        </div>
      </div>
    </div>
  );
};
