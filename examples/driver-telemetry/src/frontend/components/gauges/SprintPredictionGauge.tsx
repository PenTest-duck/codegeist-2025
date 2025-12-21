/**
 * Sprint Prediction Gauge Component
 * Probability meter for sprint completion
 * F1 Theme: Race Strategy
 */

import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';
import { motion } from 'framer-motion';

interface SprintPredictionGaugeProps {
  completionProbability: number; // 0-1
  expectedCompleted: number;
  atRiskCount: number;
}

export const SprintPredictionGauge: React.FC<SprintPredictionGaugeProps> = ({
  completionProbability,
  expectedCompleted,
  atRiskCount
}) => {
  const probabilityPercent = Math.round(completionProbability * 100);

  // Color zones for probability
  const customSegmentStops = [0, 50, 80, 90, 100];
  const segmentColors = [
    '#E10600', // Red: < 50% (very unlikely)
    '#FFA500', // Orange: 50-80% (risky)
    '#FFD700', // Yellow: 80-90% (good)
    '#00D66F'  // Green: 90-100% (excellent)
  ];

  // Get status based on probability
  const getStatus = (): { text: string; emoji: string; color: string } => {
    if (probabilityPercent >= 90) {
      return { text: 'ON TRACK', emoji: '🏁', color: '#00D66F' };
    } else if (probabilityPercent >= 70) {
      return { text: 'GOOD PACE', emoji: '✅', color: '#FFD700' };
    } else if (probabilityPercent >= 50) {
      return { text: 'AT RISK', emoji: '⚠️', color: '#FFA500' };
    } else {
      return { text: 'NEEDS ADJUSTMENT', emoji: '🚨', color: '#E10600' };
    }
  };

  const status = getStatus();

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Speedometer Gauge */}
      <motion.div
        animate={probabilityPercent < 50 ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ReactSpeedometer
          value={probabilityPercent}
          minValue={0}
          maxValue={100}
          customSegmentStops={customSegmentStops}
          segmentColors={segmentColors}
          needleColor="#666666"
          currentValueText={`${probabilityPercent}%`}
          needleTransitionDuration={1000}
          width={280}
          height={180}
          ringWidth={30}
          textColor="#FFFFFF"
        />
      </motion.div>

      {/* Status Badge */}
      <div
        style={{
          backgroundColor: status.color,
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '6px 16px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {status.emoji} {status.text}
      </div>

      {/* Prediction Details */}
      <div className="w-full space-y-2 text-sm">
        <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <span className="text-f1-text-secondary">Expected to complete:</span>
          <span className="font-bold text-f1-text-primary">{expectedCompleted} tickets</span>
        </div>

        {atRiskCount > 0 && (
          <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'rgba(225,6,0,0.1)', border: '1px solid rgba(225,6,0,0.3)' }}>
            <span className="text-f1-text-secondary">At-risk tickets:</span>
            <span className="font-bold text-red-400">{atRiskCount}</span>
          </div>
        )}
      </div>

      {/* Racing Tip */}
      <div className="text-xs text-f1-text-muted text-center">
        {probabilityPercent >= 90 && '🏎️ Clear track ahead - maintain pace'}
        {probabilityPercent >= 70 && probabilityPercent < 90 && '🎯 Stay focused on priorities'}
        {probabilityPercent >= 50 && probabilityPercent < 70 && '⚠️ Consider scope adjustment'}
        {probabilityPercent < 50 && '🚨 Defer low-priority work immediately'}
      </div>
    </div>
  );
};
