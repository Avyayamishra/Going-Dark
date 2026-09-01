
import React from "react";

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Expose for debugging.
    if (typeof window !== "undefined") {
      (window as unknown as { __lastError?: { message: string; stack?: string; componentStack?: string } }).__lastError = {
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack ?? undefined,
      };
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          id="__error_boundary_msg__"
          style={{ padding: 24, fontFamily: "monospace", fontSize: 12, color: "#e0564f", whiteSpace: "pre-wrap" }}
        >
          RENDER ERROR: {this.state.error.message}
          {"\n\n"}
          {this.state.error.stack}
        </div>
      );
    }
    return this.props.children;
  }
}
