"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface Props {
  sustainActive: boolean;
  softActive: boolean;
  centerPedalActive: boolean;
  onSustainClick: () => void;
  onSoftClick: () => void;
  onCenterPedalClick: () => void;
}

export default function PedalPanel({
  sustainActive,
  softActive,
  centerPedalActive,
  onSustainClick,
  onSoftClick,
  onCenterPedalClick,
}: Props) {
  const { language } = useLanguage();
  const isChinese = language === "zh";
  const items = [
    [isChinese ? "柔音" : "Soft", softActive, onSoftClick],
    [isChinese ? "中音" : "Sostenuto", centerPedalActive, onCenterPedalClick],
    [isChinese ? "延音" : "Sustain", sustainActive, onSustainClick],
  ] as const;

  return (
    <div className="my-3 flex flex-wrap items-center justify-center gap-4 py-3">
      <span className="mr-2 text-xs font-bold uppercase tracking-widest text-stone-400">
        {isChinese ? "踏板" : "Pedals"}
      </span>
      {items.map(([label, active, action]) => (
        <button
          key={label}
          onClick={action}
          className={`min-h-12 min-w-28 rounded-xl border px-5 py-3 text-xs font-bold transition ${active ? "border-violet-500 bg-violet-600 text-white shadow-md" : "border-black/10 bg-white text-stone-600 hover:border-violet-200 hover:bg-violet-50"}`}
        >
          {active ? "● " : ""}
          {label}
        </button>
      ))}
    </div>
  );
}
