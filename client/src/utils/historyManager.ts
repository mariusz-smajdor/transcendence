/**
 * No-op History Manager
 *
 * The project no longer needs browser navigation controls. To avoid changing
 * many call sites across the app, this module provides the same API as the
 * original history manager but performs no real navigation or popstate
 * handling. All methods are safe no-ops.
 */

type HistoryStateType = 'base' | 'tab' | 'game' | 'modal';

interface HistoryState {
  type: HistoryStateType;
  data?: any;
}

type StateHandler = (state: HistoryState) => void;

class NoOpHistoryManager {
  // keep handlers to honor on/off semantics, but they'll never be called
  private handlers: Map<HistoryStateType, StateHandler[]> = new Map();

  constructor() {
    // intentionally do not bind to popstate
  }

  pushState(type: HistoryStateType, data?: any, url?: string) {
    // no-op
  }

  replaceState(type: HistoryStateType, data?: any, url?: string) {
    // no-op
  }

  on(type: HistoryStateType, handler: StateHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
  }

  off(type: HistoryStateType, handler: StateHandler) {
    const list = this.handlers.get(type);
    if (!list) return;
    const idx = list.indexOf(handler);
    if (idx > -1) list.splice(idx, 1);
  }

  back() {
    // no-op
  }

  getCurrentState(): HistoryState | null {
    return { type: 'base' } as HistoryState;
  }
}

export const historyManager = new NoOpHistoryManager();

