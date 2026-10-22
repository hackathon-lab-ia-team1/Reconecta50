import { Component } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: (retry: () => void) => ReactNode;
}
export class ErrorBoundary extends Component<ErrorBoundaryProps, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  retry = () => this.setState({ hasError: false });

  render() {
    return this.state.hasError ? this.props.fallback(this.retry) : this.props.children;
  }
}
