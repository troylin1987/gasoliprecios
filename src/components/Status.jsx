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
