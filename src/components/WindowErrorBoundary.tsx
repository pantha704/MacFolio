import { Component, type ReactNode } from 'react'
import { useWindowStore, type WindowKey } from '#store/useWindowStore'

export class WindowErrorBoundary extends Component<{ children: ReactNode; windowKey: WindowKey }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return <div className="app-error" role="alert"><h2>This app couldn’t open.</h2><p>Your portfolio is still available. Close this message and try opening the app again.</p><button className="primary-action" onClick={() => { useWindowStore.getState().closeWindow(this.props.windowKey); this.setState({ failed: false }) }}>Close</button></div>
  }
}
