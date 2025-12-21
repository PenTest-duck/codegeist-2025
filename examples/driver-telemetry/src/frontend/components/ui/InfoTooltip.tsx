/**
 * Info Tooltip Component
 * Displays calculation methodology on hover
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  maxWidth?: number;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  maxWidth = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-block',
        marginLeft: '8px'
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Info Icon */}
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          color: '#94A3B8',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'help',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.color = '#E2E8F0';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#94A3B8';
        }}
      >
        i
      </span>

      {/* Tooltip Content */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: '8px',
              padding: '12px',
              backgroundColor: '#1E293B',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
              maxWidth: `${maxWidth}px`,
              width: 'max-content',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            {/* Arrow */}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid #1E293B'
              }}
            />

            {/* Content */}
            <div
              style={{
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#E2E8F0'
              }}
            >
              {typeof content === 'string' ? (
                <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>
              ) : (
                content
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
