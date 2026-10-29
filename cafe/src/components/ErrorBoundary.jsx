import React, { Component } from 'react';

/**
 * Catches JavaScript errors anywhere in the child component tree,
 * logs them, and displays a graceful fallback UI instead of crashing the app.
 * Crucial for catching network failures during lazy-loaded chunk fetching.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-night text-center px-6">
          <div className="w-16 h-16 mb-5 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold text-2xl font-bold">
            !
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Something went wrong
          </h1>
          <p className="text-neutral-400 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
            We encountered a problem loading this page. This often happens if the network was briefly interrupted.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={this.handleReload}
              className="px-6 py-2.5 rounded-full bg-gold text-black font-semibold text-sm hover:bg-goldLight transition-all duration-300 shadow-lg shadow-gold/20"
            >
              Refresh Page
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-full border border-gold/40 text-gold font-semibold text-sm hover:bg-gold/10 transition-all duration-300"
            >
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
