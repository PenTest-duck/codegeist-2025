/**
 * Team Network List Component
 * Shows top collaborators and chemistry scores
 * F1 Theme: Pit Crew Performance
 */

import React from 'react';
import { motion } from 'framer-motion';

interface TeamMember {
  name: string;
  collaborations: number;
}

interface BestChemistry {
  name: string;
  speedup: number;
}

interface TeamNetworkListProps {
  topTeammates: TeamMember[];
  bestChemistry?: BestChemistry;
}

export const TeamNetworkList: React.FC<TeamNetworkListProps> = ({
  topTeammates,
  bestChemistry
}) => {
  if (topTeammates.length === 0) {
    return (
      <div className="text-center text-f1-text-muted py-8">
        <div className="text-4xl mb-2">👥</div>
        <div>No collaboration data yet</div>
        <div className="text-xs mt-2">Work with teammates to build pit crew analytics</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Best Chemistry Highlight */}
      {bestChemistry && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 214, 111, 0.1) 0%, rgba(0, 144, 255, 0.1) 100%)',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(0, 214, 111, 0.3)',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-sm font-bold text-f1-text-primary">Best Chemistry</div>
                <div className="text-xs text-f1-text-secondary">{bestChemistry.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-400">
                +{bestChemistry.speedup.toFixed(0)}%
              </div>
              <div className="text-xs text-f1-text-muted">faster together</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Teammates List */}
      <div className="space-y-2">
        <div className="text-sm font-bold text-f1-text-primary">Top Collaborators</div>
        {topTeammates.map((teammate, idx) => (
          <motion.div
            key={teammate.name}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center justify-between p-2 rounded"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : '#4A4A4A',
                  color: '#000000',
                  fontSize: '12px',
                }}
              >
                #{idx + 1}
              </div>
              <div>
                <div className="text-sm text-f1-text-primary">{teammate.name}</div>
                <div className="text-xs text-f1-text-muted">
                  {teammate.collaborations} shared issue{teammate.collaborations !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            {idx === 0 && (
              <span className="text-xl">🏆</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pit Crew Note */}
      <div className="text-xs text-f1-text-muted text-center pt-2">
        Your pit crew makes you faster 🏎️
      </div>
    </div>
  );
};
