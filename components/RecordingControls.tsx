"use client";

import { useLanguage } from "@/components/LanguageProvider";

interface Props {
  isRecording: boolean;
  canPlayback: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlayback: () => void;
  onDownload: () => void;
  onClear: () => void;
}

export default function RecordingControls(props: Props) {
  const {
    isRecording,
    canPlayback,
    isPlaying,
    onRecord,
    onPlayback,
    onDownload,
    onClear,
  } = props;
  const { language } = useLanguage();
  const isChinese = language === "zh";
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-3">
      <button
        onClick={onRecord}
        className={`min-h-12 min-w-36 rounded-xl px-6 py-3 text-sm font-bold shadow-sm transition ${isRecording ? "bg-red-600 text-white" : "bg-stone-900 text-white hover:bg-stone-800"}`}
      >
        {isRecording
          ? isChinese
            ? "■ 停止录音"
            : "■ Stop recording"
          : isChinese
            ? "● 开始录音"
            : "● Record"}
      </button>
      <button
        onClick={onPlayback}
        disabled={!canPlayback}
        className="min-h-12 min-w-32 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPlaying
          ? isChinese
            ? "■ 停止"
            : "■ Stop"
          : isChinese
            ? "▶ 回放"
            : "▶ Replay"}
      </button>
      <button
        onClick={onDownload}
        disabled={!canPlayback}
        className="min-h-12 min-w-32 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-bold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isChinese ? "↓ 导出" : "↓ Export"}
      </button>
      <button
        onClick={onClear}
        className="min-h-12 min-w-28 rounded-xl border border-black/10 bg-white px-6 py-3 text-sm font-bold text-stone-500 shadow-sm transition hover:bg-stone-50"
      >
        {isChinese ? "清除" : "Clear"}
      </button>
    </div>
  );
}
