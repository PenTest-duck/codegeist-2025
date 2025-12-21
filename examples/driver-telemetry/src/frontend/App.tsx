import React, { useEffect, useState } from 'react';
import { view } from '@forge/bridge';
import { Dashboard } from './views/Dashboard';
import { IssuePanel } from './views/IssuePanel';
import { Spinner } from './components/ui/Spinner';
import type { ForgeContext } from './types';

/**
 * Root App Component for Driver Telemetry Custom UI
 * Routes to appropriate view based on Forge extension context
 */
const App: React.FC = () => {
  const [context, setContext] = useState<ForgeContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get Forge context to determine which view to render
    view.getContext().then((ctx) => {
      console.log('Forge Context:', ctx);
      setContext(ctx);
      setLoading(false);
    }).catch((err) => {
      console.error('Error getting context:', err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-f1-background-dark">
        <div className="text-center space-y-4">
          <Spinner size="large" />
          <div className="text-f1-text-secondary">Loading telemetry...</div>
        </div>
      </div>
    );
  }

  // Route based on extension type
  const extensionType = context?.extension?.type;

  if (extensionType === 'jira:issuePanel') {
    return <IssuePanel />;
  }

  // Default to Dashboard (for jira:projectPage or unknown)
  return <Dashboard />;
};

export default App;
