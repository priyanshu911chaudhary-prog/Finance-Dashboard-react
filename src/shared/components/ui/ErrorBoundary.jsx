import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Keep diagnostics available in development without crashing the whole app.
    if (import.meta.env.DEV) {
      console.error('Unhandled UI error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
          <div className="glass-panel rounded-2xl p-8 max-w-lg w-full text-center space-y-3">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-sm text-muted">
              The app hit an unexpected error. Please refresh the page. If this continues, restore from backup in Settings.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
