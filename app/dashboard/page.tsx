export default function DashboardPage() {
  return (
    <>
      <section className="flex flex-col items-center justify-center pt-10 md:pt-0 pb-6">
        <p className="text-lg text-on-surface-variant mb-8">
          Listening... start speaking.
        </p>
        <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-secondary-container shadow-[0_0_40px_rgba(75,65,225,0.3)] cursor-pointer hover:scale-105 transition-transform duration-300">
          <span className="material-symbols-outlined text-[48px] text-on-secondary-container">
            mic
          </span>
        </div>
      </section>

      <section className="bg-surface border border-outline-variant rounded-3xl p-6 flex flex-col gap-4 transition-colors hover:border-secondary shadow-sm">
        <div className="flex justify-between items-center border-b border-outline-variant pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <h2 className="text-lg font-semibold text-primary">
              Current Recording
            </h2>
          </div>
          <span className="text-[13px] font-mono text-on-surface-variant bg-surface-container px-2 py-1 rounded">
            00:00
          </span>
        </div>
        <div className="min-h-[150px] text-base text-on-surface leading-relaxed">
          <p className="text-on-surface-variant italic">
            Your transcription will appear here...
          </p>
        </div>
        <div className="flex justify-between items-center pt-4 mt-auto border-t border-outline-variant/50">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-primary text-sm">
              <span className="material-symbols-outlined text-[18px]">
                content_copy
              </span>
              Copy
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-error-container hover:text-on-error-container transition-colors text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-[18px]">
                clear_all
              </span>
              Clear
            </button>
          </div>
          <span className="text-[13px] font-mono text-on-surface-variant">
            0 chars
          </span>
        </div>
      </section>
    </>
  );
}
