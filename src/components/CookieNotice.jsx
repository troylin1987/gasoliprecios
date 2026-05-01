export function CookieNotice({ text, onAccept, onReject }) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-4xl rounded-lg border border-aqua/30 bg-black/95 p-3 shadow-glow backdrop-blur-xl sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl tracking-normal text-white">{text.title}</p>
          <p className="max-w-2xl text-xs leading-5 text-zinc-300 sm:text-sm">{text.body}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-white/40 hover:text-white"
            onClick={onReject}
          >
            {text.reject}
          </button>
          <button
            className="rounded-lg bg-aqua px-3 py-2 text-xs font-black text-black transition hover:-translate-y-0.5 hover:bg-cyan-300"
            onClick={onAccept}
          >
            {text.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
