export function CookieNotice({ text, onAccept }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 text-white">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-aqua/30 bg-[#0b0f0f] p-6 shadow-glow">
        <div className="space-y-4">
          <p className="font-display text-3xl tracking-normal text-white">{text.title}</p>
          <p className="text-sm leading-6 text-zinc-300">{text.body}</p>
          <button
            className="w-full rounded-2xl bg-aqua px-5 py-3 text-sm font-black text-black transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-ember/30"
            onClick={onAccept}
          >
            {text.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
