export function LoadingScreen({ text }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-4 border-aqua/20 border-t-aqua" />
        <p className="font-display text-3xl tracking-normal text-white">{text.status.loadingPrices}</p>
        <p className="mt-2 text-sm text-zinc-400">{text.status.loadingHelp}</p>
      </div>
    </div>
  );
}

export function ErrorBanner({ children }) {
  return (
    <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
      {children}
    </div>
  );
}

export function DataSourceWarningBar({ message, theme }) {
  if (!message) return null;

  return (
    <div
      className={
        theme === 'light'
          ? 'border-y border-orange-300 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-800'
          : 'border-y border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100'
      }
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto max-w-7xl">{message}</div>
    </div>
  );
}
