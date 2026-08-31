import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-6">
          <div className="max-w-lg rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            <h1 className="text-lg font-bold">SellSolar failed to load</h1>
            <p className="mt-2 text-sm">{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
