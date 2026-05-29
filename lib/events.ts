// Simple in-memory event hub for snippet changes
type Unsubscribe = () => void;

class SnippetEvents {
  private subs: Set<() => void> = new Set();

  subscribe(cb: () => void): Unsubscribe {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }

  emitRefresh() {
    for (const cb of Array.from(this.subs)) {
      try {
        cb();
      } catch (e) {
        // swallow
      }
    }
  }
}

export const snippetEvents = new SnippetEvents();
