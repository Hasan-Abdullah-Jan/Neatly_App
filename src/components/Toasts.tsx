import { useUI } from '../store/ui';

export function Toasts() {
  const toasts = useUI((s) => s.toasts);
  const dismiss = useUI((s) => s.dismiss);
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-40 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-rise pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl bg-fg px-4 py-3 text-sm text-bg shadow-2xl"
        >
          <span className="flex-1">{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="rounded-lg px-2 py-1 font-semibold underline underline-offset-2 hover:opacity-80"
              onClick={() => {
                t.action!.run();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
