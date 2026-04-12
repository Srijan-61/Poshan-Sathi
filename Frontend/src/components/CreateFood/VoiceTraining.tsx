import React from "react";
import { useTheme } from "../../context/ThemeContext";

interface VoiceTrainingProps {
  textAliases: string[];
  updateTextAlias: (index: number, val: string) => void;
  voiceAliases: string[];
  activeMicIndex: number | null;
  recordAlias: (index: number) => void;
}

export default function VoiceTraining({
  textAliases,
  updateTextAlias,
  voiceAliases,
  activeMicIndex,
  recordAlias
}: VoiceTrainingProps) {
  const { isDark } = useTheme();
  const subtext = isDark ? "text-neutral-400" : "text-neutral-500";

  return (
    <div className={`mt-8 border-t pt-6 ${isDark ? "border-neutral-700" : "border-neutral-100"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide ${subtext}`}>
          Voice training
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isDark ? "bg-orange-950/80 text-orange-300 ring-1 ring-orange-800/50" : "bg-orange-50 text-orange-600 ring-1 ring-orange-200"
          }`}
        >
          Recommended: 3+
        </span>
      </div>

      <div className="space-y-2">
        <details
          className={`group overflow-hidden rounded-xl border ${
            isDark
              ? "border-slate-700 bg-neutral-800/40"
              : "border-slate-200 bg-slate-50/60"
          }`}
        >
          <summary
            className={`flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold transition-colors [&::-webkit-details-marker]:hidden ${
              isDark
                ? "text-slate-200 hover:bg-neutral-700/50"
                : "text-slate-800 hover:bg-slate-100/80"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isDark ? "bg-slate-600/35 text-slate-200" : "bg-slate-200 text-slate-700"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">keyboard</span>
            </span>
            <span className="flex-1">Type nicknames</span>
            <span className="material-symbols-outlined text-lg opacity-60 transition-transform group-open:rotate-180">
              expand_more
            </span>
          </summary>
          <div
            className={`space-y-2 border-t px-4 py-3 ${
              isDark ? "border-slate-700/80 bg-neutral-900/30" : "border-slate-200 bg-white/70"
            }`}
          >
            {textAliases.map((alias, i) => (
              <input
                key={i}
                className={`w-full rounded-lg border-2 border-slate-400/30 p-2.5 text-sm font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-500/25 focus:outline-none ${
                  isDark
                    ? "border-slate-600 bg-neutral-900 text-white placeholder:text-neutral-500"
                    : "border-slate-300 bg-white text-neutral-900 placeholder:text-neutral-400"
                }`}
                placeholder={`Alias ${i + 1} (e.g. Gym Food)`}
                value={alias}
                onChange={(e) => updateTextAlias(i, e.target.value)}
              />
            ))}
          </div>
        </details>

        <details
          className={`group overflow-hidden rounded-xl border ${
            isDark
              ? "border-emerald-800/50 bg-emerald-950/25"
              : "border-emerald-200 bg-emerald-50/50"
          }`}
        >
          <summary
            className={`flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold transition-colors [&::-webkit-details-marker]:hidden ${
              isDark
                ? "text-emerald-200 hover:bg-emerald-950/40"
                : "text-emerald-900 hover:bg-emerald-100/60"
            }`}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                isDark ? "bg-emerald-800/50 text-emerald-200" : "bg-emerald-200/80 text-emerald-900"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </span>
            <span className="flex-1">Speak nicknames</span>
            <span className="material-symbols-outlined text-lg opacity-60 transition-transform group-open:rotate-180">
              expand_more
            </span>
          </summary>
          <div
            className={`space-y-2 border-t px-4 py-3 ${
              isDark ? "border-emerald-900/50 bg-emerald-950/20" : "border-emerald-200 bg-white/80"
            }`}
          >
            {voiceAliases.map((alias, i) => (
              <div key={i} className="flex gap-2">
                <input
                  readOnly
                  className={`min-w-0 flex-1 rounded-lg border-2 p-2.5 text-sm font-semibold ${
                    isDark
                      ? "border-emerald-800/60 bg-neutral-900 text-emerald-50 placeholder:text-emerald-700/80"
                      : "border-emerald-300 bg-white text-neutral-900 placeholder:text-emerald-600/70"
                  }`}
                  placeholder={
                    activeMicIndex === i ? "Listening..." : "Tap mic to record →"
                  }
                  value={alias}
                />
                <button
                  type="button"
                  onClick={() => recordAlias(i)}
                  className={`flex shrink-0 items-center justify-center rounded-lg px-3 shadow-sm transition-all ${
                    activeMicIndex === i
                      ? "animate-pulse bg-red-500 text-white ring-2 ring-red-400/50"
                      : isDark
                        ? "border border-emerald-700/50 bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800/50"
                        : "border border-emerald-300 bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">mic</span>
                </button>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
