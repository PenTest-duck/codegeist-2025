/**
 * Speedometer Gauge Component
 * Uses react-d3-speedometer for F1-style workload visualization
 */

import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';
import { F1_THEME } from '../../lib/constants';

interface SpeedometerProps {
  value: number;
  maxValue: number;
  optimalMin: number;
  optimalMax: number;
  label?: string;
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  value,
  maxValue,
  optimalMin,
  optimalMax,
  label = 'Active Tickets',
}) => {
  // Create custom segment stops for color zones
  const customSegmentStops = [0, optimalMin, optimalMax, maxValue * 0.75, maxValue];

  // Color segments: under (blue) → optimal (green) → over (yellow) → critical (red)
  const segmentColors = [
    F1_THEME.loadStatus.colors.under,    // 0 to optimalMin
    F1_THEME.loadStatus.colors.optimal,  // optimalMin to optimalMax
    F1_THEME.loadStatus.colors.over,     // optimalMax to 75%
    F1_THEME.loadStatus.colors.critical, // 75% to max
  ];

  return (
    <div className="flex flex-col items-center">
      <ReactSpeedometer
        value={value}
        minValue={0}
        maxValue={maxValue}
        needleColor={F1_THEME.speedometer.needleColor}
        startColor={segmentColors[0]}
        endColor={segmentColors[3]}
        segments={4}
        customSegmentStops={customSegmentStops}
        segmentColors={segmentColors}
        currentValueText={`${value}`}
        textColor={F1_THEME.speedometer.textColor}
        needleTransitionDuration={F1_THEME.speedometer.needleTransitionDuration}
        needleTransition={"easeElastic" as any}
        width={300}
        height={200}
        ringWidth={30}
        needleHeightRatio={0.7}
        valueTextFontSize="24px"
        labelFontSize="14px"
      />
      <div className="text-center mt-2 text-sm text-f1-text-secondary">
        {label}
      </div>
    </div>
  );
};
