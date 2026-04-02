'use client';

import {Component} from 'react';
import type {ReactNode, ErrorInfo} from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level React error boundary.
 *
 * Catches rendering errors in the component tree below and shows a
 * friendly fallback UI instead of a blank screen.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // In production this would report to an error-tracking service
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({hasError: false});
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              className="text-red-500"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              An unexpected error occurred. Please try reloading the page.
            </p>
          </div>

          <button
            onClick={this.handleReload}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
