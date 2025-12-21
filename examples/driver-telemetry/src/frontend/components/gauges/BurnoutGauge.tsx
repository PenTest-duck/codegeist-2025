/**
 * Burnout Gauge Component
 * Engine temperature style visualization for burnout risk
 * F1 Theme: Engine Temperature Monitoring
 */

import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';
import { motion } from 'framer-motion';

interface BurnoutGaugeProps {
  burnoutScore: number; // 0-100
  riskLevel: 'healthy' | 'warning' | 'high' | 'critical';
  topRiskFactors?: string[];
}

export const BurnoutGauge: React.FC<BurnoutGaugeProps> = ({
  burnoutScore,
  riskLevel,
  topRiskFactors = []
}) => {
  // Color zones for burnout
  const customSegmentStops = [0, 30, 50, 70, 100];
  const segmentColors = [
    '#00D66F', // Green: Healthy (0-30)
    '#FFD700', // Yellow: Warning (30-50)
    '#FFA500', // Orange: High (50-70)
    '#E10600'  // Red: Critical (70-100)
  ];

  // Get risk level color
  const getRiskColor = (): string => {
    switch (riskLevel) {
      case 'healthy': return '#00D66F';
      case 'warning': return '#FFD700';
      case 'high': return '#FFA500';
      case 'critical': return '#E10600';
      default: return '#666666';
    }
  };

  // Get risk level emoji
  const getRiskEmoji = (): string => {
    switch (riskLevel) {
      case 'healthy': return '✅';
      case 'warning': return '💛';
      case 'high': return '🔶';
      case 'critical': return '🚨';
      default: return '🌡️';
    }
  };

  // Get risk level text
  const getRiskText = (): string => {
    switch (riskLevel) {
      case 'healthy': return 'HEALTHY';
      case 'warning': return 'WARNING';
      case 'high': return 'HIGH RISK';
      case 'critical': return 'CRITICAL';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Speedometer Gauge */}
      <motion.div
        animate={riskLevel === 'critical' ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ReactSpeedometer
          value={burnoutScore}
          minValue={0}
          maxValue={100}
          customSegmentStops={customSegmentStops}
          segmentColors={segmentColors}
          needleColor={riskLevel === 'critical' ? '#E10600' : '#666666'}
          currentValueText={`${Math.round(burnoutScore)}`}
          needleTransitionDuration={1000}
          width={280}
          height={180}
          ringWidth={30}
          textColor="#FFFFFF"
        />
      </motion.div>

      {/* Risk Level Badge */}
      <div
        style={{
          backgroundColor: getRiskColor(),
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '6px 16px',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {getRiskEmoji()} {getRiskText()}
      </div>

      {/* Risk Factors */}
      {topRiskFactors.length > 0 && (
        <div className="w-full space-y-2 text-xs text-f1-text-secondary">
          <div className="font-bold text-f1-text-primary">Top Risk Factors:</div>
          {topRiskFactors.map((factor, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-f1-ferrari">•</span>
              <span>{factor}</span>
            </div>
          ))}
        </div>
      )}

      {/* Temperature Scale */}
      <div className="w-full text-xs text-f1-text-muted text-center">
        Engine Temperature Scale
      </div>
    </div>
  );
};
