/**
 * GaugeCard Component
 * Card wrapper for gauge visualizations with title and subtitle
 */

import React from 'react';
import { Card } from '../ui/Card';
import { InfoTooltip } from '../ui/InfoTooltip';

interface GaugeCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  infoContent?: string | React.ReactNode;
}

export const GaugeCard: React.FC<GaugeCardProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = '',
  infoContent,
}) => {
  return (
    <Card className={className}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {icon && <span className="text-2xl">{icon}</span>}
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-bold text-f1-text-primary">{title}</h3>
              {infoContent && <InfoTooltip content={infoContent} />}
            </div>
            {subtitle && (
              <p className="text-sm text-f1-text-secondary">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </Card>
  );
};
