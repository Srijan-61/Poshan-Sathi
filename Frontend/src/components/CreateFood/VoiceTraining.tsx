interface VoiceTrainingProps {
  textAliases: string[];
  updateTextAlias: (index: number, val: string) => void;
  voiceAliases: string[];
  activeMicIndex: number | null;
  recordAlias: (index: number) => void;
  /** Raw Devanagari transcript from the most recent recognition event */
  recognizedVoiceText?: string;
}

export default function VoiceTraining({
  textAliases,
  updateTextAlias,
  voiceAliases,
  activeMicIndex,
  recordAlias,
  recognizedVoiceText,
}: VoiceTrainingProps) {
  const subtext = "text-neutral-500";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-[13px] font-black uppercase tracking-widest text-neutral-800">
            Intelligent Voice Aliasing
          </h4>
          <p className={`text-xs mt-1 font-bold ${subtext}`}>
            Teach the app how you say this food in English or Nepali.
          </p>
        </div>
        <span className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
          Smart Mapping
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keyboard Aliases */}
        <div className="space-y-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-neutral-400">keyboard</span>
            <span className="text-xs font-black uppercase tracking-widest text-neutral-600">Keyboard Shortcuts</span>
          </div>
          {textAliases.map((alias, i) => (
            <input
              key={i}
              className="w-full rounded-xl border border-neutral-200 p-3 text-sm font-bold focus:border-green-500 focus:ring-4 focus:ring-green-500/10 focus:outline-none bg-white placeholder:text-neutral-300"
              placeholder={`Alias ${i + 1} (e.g. Health Salad)`}
              value={alias}
              onChange={(e) => updateTextAlias(i, e.target.value)}
            />
          ))}
        </div>

        {/* Voice Aliases */}
        <div className="space-y-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-600">mic</span>
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600">Live Voice Profiles</span>
          </div>

          {/* Feedback Area */}
          {(activeMicIndex !== null || recognizedVoiceText) ? (
            <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black border ${
              activeMicIndex !== null 
                ? "bg-red-50 text-red-600 border-red-100" 
                : "bg-white text-emerald-700 border-emerald-200"
            }`}>
              {activeMicIndex !== null ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  <span>Listening... बोलनुहोस्</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  <span className="truncate">Saved: {recognizedVoiceText}</span>
                </>
              )}
            </div>
          ) : (
            <div className="px-4 py-3 rounded-xl border border-emerald-100 bg-white/40 text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest text-center">
              Tap mic to learn accents
            </div>
          )}

          {voiceAliases.map((alias, i) => (
            <div key={i} className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  readOnly
                  className="w-full rounded-xl border border-emerald-100 p-3 text-sm font-bold bg-white/80 placeholder:text-emerald-300 transition-all text-neutral-800"
                  placeholder={activeMicIndex === i ? "🎤 Listening..." : `Profile ${i+1}`}
                  value={alias}
                />
              </div>
              <button
                type="button"
                onClick={() => recordAlias(i)}
                className={`flex shrink-0 items-center justify-center rounded-xl px-4 shadow-sm transition-all ${
                  activeMicIndex === i
                    ? "bg-red-500 text-white ring-4 ring-red-500/20"
                    : "bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
