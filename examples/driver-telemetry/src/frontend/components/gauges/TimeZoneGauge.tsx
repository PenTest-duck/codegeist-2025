/**
 * TimeZoneGauge Component
 * 24-hour timeline visualization showing peak/danger zones
 */

import React from 'react';
import { motion } from 'framer-motion';
import { F1_THEME, RACING_FLAGS } from '../../lib/constants';

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

  console.log('TimeZoneGauge render:', {
    currentHour,
    peakStart,
    peakEnd,
    dangerStart,
    dangerEnd
  });

  const getZone = (hour: number): 'peak' | 'danger' | 'normal' => {
    if (hour >= peakStart && hour <= peakEnd) return 'peak';
    if (dangerStart !== undefined && dangerEnd !== undefined) {
      if (hour >= dangerStart && hour <= dangerEnd) return 'danger';
    }
    return 'normal';
  };

  const getHeightPx = (zone: 'peak' | 'danger' | 'normal'): number => {
    switch (zone) {
      case 'peak': return 160; // 100% of 160px
      case 'danger': return 112; // 70% of 160px
      case 'normal': return 80; // 50% of 160px
    }
  };

  const getColor = (zone: 'peak' | 'danger' | 'normal'): string => {
    return F1_THEME.timeZone.colors[zone];
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Chart area */}
      <div style={{ position: 'relative', width: '100%', height: '160px', marginBottom: '16px' }}>

        {/* Background for bars */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '160px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
            borderRadius: '8px',
          }}
        />

        {/* Bars container - positioned at bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            height: '160px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '2px',
            padding: '0 8px',
          }}
        >
          {hours.map((hour) => {
            const zone = getZone(hour);
            const isCurrent = hour === currentHour;
            const heightPx = getHeightPx(zone);
            const color = getColor(zone);

            console.log(`Hour ${hour}: zone=${zone}, height=${heightPx}px, color=${color}, isCurrent=${isCurrent}`);

            return (
              <div key={hour} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', height: '160px' }}>
                <motion.div
                  style={{
                    width: '100%',
                    height: `${heightPx}px`,
                    backgroundColor: color,
                    opacity: isCurrent ? 1 : 0.75,
                    borderTopLeftRadius: '3px',
                    borderTopRightRadius: '3px',
                  }}
                  animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Time labels - clear spacing */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666666',
          padding: '0 8px',
          marginBottom: '32px',
        }}
      >
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>

      {/* Legend - explicit spacing */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>

          {/* Peak performance legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{RACING_FLAGS.green}</span>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                backgroundColor: F1_THEME.timeZone.colors.peak,
              }}
            />
            <span style={{ color: '#A0A0A0' }}>
              Peak Performance ({peakStart}:00 - {peakEnd}:00)
            </span>
          </div>

          {/* Danger zone legend (if exists) */}
          {dangerStart !== undefined && dangerEnd !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{RACING_FLAGS.red}</span>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  backgroundColor: F1_THEME.timeZone.colors.danger,
                }}
              />
              <span style={{ color: '#A0A0A0' }}>
                Danger Zone ({dangerStart}:00 - {dangerEnd}:00)
              </span>
            </div>
          )}

          {/* Normal hours legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{RACING_FLAGS.yellow}</span>
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                backgroundColor: F1_THEME.timeZone.colors.normal,
              }}
            />
            <span style={{ color: '#A0A0A0' }}>
              Normal Hours
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
