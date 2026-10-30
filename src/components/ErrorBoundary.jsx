import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  componentDidCatch(err) { console.error(err); }
  render() {
    if (!this.state.err) return this.props.children;
    return (
      <div style={{ padding: 24, maxWidth: 480, margin: '40px auto', fontFamily: 'system-ui, sans-serif', color: '#2b2f3a' }}>
        <h2 style={{ color: '#b8860b' }}>YUÉLÍN</h2>
        <p>Something went wrong while loading this page.</p>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, background: '#eef0f4', padding: 12, borderRadius: 12 }}>{String(this.state.err && (this.state.err.stack || this.state.err.message || this.state.err)).slice(0, 700)}</pre>
        <button type="button" onClick={() => { window.location.href = '/'; }} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', fontWeight: 700 }}>Go to home</button>
      </div>
    );
  }
}
