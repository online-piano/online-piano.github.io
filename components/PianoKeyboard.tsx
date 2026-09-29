"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

interface Props {
  piano: any;
  octave: number;
  notes: Record<string, number>;
  externalPressedKeys?: Set<string>;
  keyboardSize?: "compact" | "full";
}

const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const midiOf = (n: string) => {
  const m = n.match(/^([A-G]#?)(\d+)$/)!;
  return names.indexOf(m[1]) + (Number(m[2]) + 1) * 12;
};
const defaultMap: Record<string, string> = {
  KeyZ: "C4",
  KeyX: "D4",
  KeyC: "E4",
  KeyV: "F4",
  KeyB: "G4",
  KeyN: "A4",
  KeyM: "B4",
  Comma: "C5",
  Period: "D5",
  Slash: "E5",
  KeyS: "C#4",
  KeyD: "D#4",
  KeyG: "F#4",
  KeyH: "G#4",
  KeyJ: "A#4",
  KeyL: "C#5",
  Digit5: "F#5",
  Digit6: "G#5",
  Digit7: "A#5",
};

export default function PianoKeyboard({
  piano,
  octave,
  notes,
  externalPressedKeys = new Set(),
  keyboardSize = "full",
}: Props) {
  const { language } = useLanguage();
  const isChinese = language === "zh";
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [edit, setEdit] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [map, setMap] = useState<Record<string, string>>(defaultMap);
  const pressedNotesRef = useRef(new Set<string>());
  const pointerHandles = useRef(new Map<string, { stop: () => void }>());
  useEffect(() => {
    try {
      const x = localStorage.getItem("online-piano-keymap");
      if (x) setMap(JSON.parse(x));
    } catch {}
  }, []);
  useEffect(() => {
    document.body.dataset.pianoMapping = edit ? "1" : "0";
    return () => {
      document.body.dataset.pianoMapping = "0";
    };
  }, [edit]);
  const octs =
    keyboardSize === "full"
      ? Array.from({ length: 9 }, (_, i) => i)
      : [octave, octave + 1, octave + 2];
  const fullNotes = useMemo(() => {
    if (keyboardSize === "full") {
      return Array.from({ length: 88 }, (_, i) => i + 21).map(
        (m) => names[m % 12] + (Math.floor(m / 12) - 1),
      );
    }
    return octs.flatMap((o) => names.map((n) => `${n}${o}`));
  }, [keyboardSize, octave]);
  const white = fullNotes.filter((n) => !n.includes("#"));
  const isActive = (n: string) =>
    pressed.has(n) ||
    externalPressedKeys.has(n) ||
    piano.activeNotes?.includes(midiOf(n));
  const mapped = (n: string) =>
    Object.entries(map)
      .find(([, v]) => v === n)?.[0]
      ?.replace(/^(Key|Digit)/, "") || "";

  const press = (n: string) => {
    if (edit) {
      setTarget(n);
      return;
    }
    pressedNotesRef.current.add(n);
    setPressed((p) => {
      const q = new Set(p);
      q.add(n);
      return q;
    });
    void piano.playNoteInstance(n).then((handle: { stop: () => void }) => {
      if (!pressedNotesRef.current.has(n)) handle.stop();
      else pointerHandles.current.set(n, handle);
    });
  };
  const release = (n: string) => {
    pressedNotesRef.current.delete(n);
    setPressed((p) => {
      const q = new Set(p);
      q.delete(n);
      return q;
    });
    pointerHandles.current.get(n)?.stop();
    pointerHandles.current.delete(n);
  };
  const releaseAllPointerNotes = () => {
    pointerHandles.current.forEach((handle) => handle.stop());
    pointerHandles.current.clear();
    pressedNotesRef.current.clear();
    setPressed(new Set());
  };
  useEffect(() => () => releaseAllPointerNotes(), []);
  const bind = (e: React.KeyboardEvent) => {
    if (!target) return;
    e.preventDefault();
    const next = { ...map };
    for (const [k, v] of Object.entries(next)) if (v === target) delete next[k];
    next[e.code] = target;
    setMap(next);
    localStorage.setItem("online-piano-keymap", JSON.stringify(next));
    setTarget(null);
  };

  const keyW = keyboardSize === "full" ? 46 : 58,
    keyH = 180;
  return (
    <div
      className="space-y-4 select-none"
      onKeyDown={bind}
      tabIndex={edit ? 0 : -1}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="mb-3 flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setEdit((v) => !v)}
          className={`min-h-11 rounded-lg border-2 px-5 py-3 font-semibold transition ${edit ? "border-purple-600 bg-purple-600 text-white" : "border-purple-500 text-purple-600 hover:bg-purple-50"}`}
        >
          {edit
            ? isChinese
              ? "完成键盘设置"
              : "Done"
            : isChinese
              ? "键盘设置"
              : "Keyboard settings"}
        </button>
        {edit && (
          <button
            onClick={() => {
              setMap(defaultMap);
              localStorage.setItem(
                "online-piano-keymap",
                JSON.stringify(defaultMap),
              );
              setTarget(null);
            }}
            className="min-h-11 rounded-lg border-2 border-gray-300 px-5 py-3 text-gray-600"
          >
            {isChinese ? "恢复默认" : "Reset"}
          </button>
        )}
      </div>
      {edit && (
        <div className="text-center text-sm text-purple-700 bg-purple-50 rounded-lg p-3">
          {isChinese
            ? "先点击钢琴键，再按电脑键盘上的按键。"
            : "Click a piano key, then press a computer key."}
          {target
            ? isChinese
              ? ` 当前等待：${target}`
              : ` Waiting for: ${target}`
            : ""}
        </div>
      )}
      <div
        className="overflow-x-auto overscroll-x-contain pb-3"
        onKeyDown={bind}
      >
        <div
          className="relative mx-auto rounded-xl bg-[#2a2a2a] p-4 shadow-[0_8px_30px_rgba(0,0,0,.5)]"
          style={{
            width: Math.max(
              white.length * keyW + 32,
              keyboardSize === "compact" ? 450 : 900,
            ),
            height: 228,
          }}
        >
          <div className="absolute left-4 top-4 flex" style={{ zIndex: 1 }}>
            {fullNotes
              .filter((n) => !n.includes("#"))
              .map((n) => {
                const active = isActive(n);
                const m = mapped(n);
                return (
                  <button
                    key={n}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.currentTarget.setPointerCapture?.(e.pointerId);
                      press(n);
                    }}
                    onPointerUp={(e) => {
                      if (!edit) release(n);
                    }}
                    onPointerCancel={() => !edit && release(n)}
                    onPointerLeave={(e) => {
                      if (
                        e.pointerType === "mouse" &&
                        !e.currentTarget.hasPointerCapture?.(e.pointerId) &&
                        !edit
                      )
                        release(n);
                    }}
                    className={`relative shrink-0 rounded-b-md border ${active ? "bg-blue-200 shadow-inner" : "bg-gradient-to-b from-white to-gray-100"} border-gray-400`}
                    style={{ width: keyW, height: keyH }}
                  >
                    <span className="absolute bottom-1 left-0 right-0 text-[10px] font-bold text-gray-600">
                      {n.startsWith("C") ? n : n[0]}
                    </span>
                    {m && (
                      <span className="absolute bottom-5 left-0 right-0 text-[9px] text-purple-500">
                        {m}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
          <div
            className="absolute left-4 top-4 pointer-events-none"
            style={{ zIndex: 3 }}
          >
            {fullNotes.map((n, i) => {
              if (!n.includes("#")) return null;
              const idx = white.findIndex((w) => midiOf(w) > midiOf(n));
              const left = (idx < 0 ? white.length : idx) * keyW - keyW / 2;
              const active = isActive(n);
              const m = mapped(n);
              return (
                <button
                  key={n}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.setPointerCapture?.(e.pointerId);
                    press(n);
                  }}
                  onPointerUp={(e) => {
                    e.stopPropagation();
                    if (!edit) release(n);
                  }}
                  onPointerCancel={(e) => {
                    e.stopPropagation();
                    if (!edit) release(n);
                  }}
                  className={`absolute pointer-events-auto rounded-b-md border border-black ${active ? "bg-gray-500" : "bg-gradient-to-b from-gray-800 to-black"}`}
                  style={{ left, width: keyW * 0.6, height: 115 }}
                >
                  <span className="absolute bottom-1 left-0 right-0 text-[8px] text-gray-300">
                    {n}
                  </span>
                  {m && (
                    <span className="absolute bottom-4 left-0 right-0 text-[8px] text-gray-400">
                      {m}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
