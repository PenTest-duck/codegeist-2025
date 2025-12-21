/**
 * DashboardGrid Component
 * Responsive grid layout for dashboard cards
 */

import React from 'react';

interface DashboardGridProps {
  children: React.ReactNode;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {children}
    </div>
  );
};
