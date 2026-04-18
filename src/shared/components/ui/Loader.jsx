export function AppBootLoader() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 rounded-full border-2 border-white/10" />
          <div className="absolute inset-0 rounded-full border-2 border-accent/70 border-t-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border border-accent/30 animate-pulse" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold tracking-[0.18em] uppercase text-white/90">Finance Dashboard</p>
          <p className="text-xs text-muted">Preparing your workspace...</p>
        </div>
      </div>
    </div>
  );
}

export function PageLoader({ className = 'h-[60vh]' }) {
  return (
    <div className={`flex w-full items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent animate-bounce [animation-delay:-0.2s]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/70 animate-bounce [animation-delay:-0.1s]" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/40 animate-bounce" />
        </div>
        <p className="text-xs uppercase tracking-widest text-muted">Loading page</p>
      </div>
    </div>
  );
}

export function GraphLoader({ className = 'h-[400px]' }) {
  return (
    <div className={`glass-panel rounded-2xl p-6 ${className}`}>
      <div className="h-full w-full animate-pulse">
        <div className="h-5 w-44 rounded bg-white/10" />
        <div className="mt-2 h-3 w-56 rounded bg-white/5" />
        <div className="mt-8 grid h-[calc(100%-4.5rem)] grid-cols-6 items-end gap-2">
          <div className="h-[30%] rounded bg-white/10" />
          <div className="h-[55%] rounded bg-white/10" />
          <div className="h-[42%] rounded bg-white/10" />
          <div className="h-[70%] rounded bg-white/10" />
          <div className="h-[48%] rounded bg-white/10" />
          <div className="h-[62%] rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// Backward-compatible generic loader for existing call sites
export function Loader({ className = 'h-[60vh]' }) {
  return <PageLoader className={className} />;
}
