"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePiano } from "@/hooks/usePiano";
import PianoKeyboard from "@/components/PianoKeyboard";
import PedalPanel from "@/components/PedalPanel";
import RecordingControls from "@/components/RecordingControls";
import DemoSongs, { type DemoSong } from "@/components/DemoSongs";
import { useLanguage } from "@/components/LanguageProvider";

const NOTES: Record<string, number> = {};
const noteNames = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
for (let m = 21; m <= 108; m++) {
  NOTES[`${noteNames[m % 12]}${Math.floor(m / 12) - 1}`] =
    440 * Math.pow(2, (m - 69) / 12);
}

const DEFAULT_KEY_MAP: Record<string, string> = {
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

function readKeyMap() {
  try {
    const saved = localStorage.getItem("online-piano-keymap");
    return saved ? JSON.parse(saved) : DEFAULT_KEY_MAP;
  } catch {
    return DEFAULT_KEY_MAP;
  }
}

export default function PianoPage() {
  const piano = usePiano();
  const { language, setLanguage } = useLanguage();
  const isChinese = language === "zh";
  const [volume, setVolume] = useState(85);
  const [currentOctave, setCurrentOctave] = useState(4);
  const [keyboardSize, setKeyboardSize] = useState<"compact" | "full">("full");
  const [sustainActive, setSustainActive] = useState(false);
  const [softActive, setSoftActive] = useState(false);
  const [centerPedalActive, setCenterPedalActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [canPlayback, setCanPlayback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [keyboardPressed, setKeyboardPressed] = useState<Set<string>>(
    new Set(),
  );
  const computerPressedRef = useRef(new Set<string>());
  const [playbackNotes, setPlaybackNotes] = useState<Set<string>>(new Set());
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [isSongPaused, setIsSongPaused] = useState(false);
  const [playingSongName, setPlayingSongName] = useState("");
  const stopPlaybackRef = useRef<(() => void) | null>(null);
  const stopSongRef = useRef(false);
  const songTimersRef = useRef<number[]>([]);
  const songTimerResolversRef = useRef<Array<() => void>>([]);
  const songNoteHandlesRef = useRef<
    Array<{ stop: () => void; midi: number; note: string }>
  >([]);
  const songVisualNotesRef = useRef<Set<string>>(new Set());
  const computerKeyHandlesRef = useRef(new Map<string, { stop: () => void }>());
  const songStartedAtRef = useRef(0);
  const songOffsetBeatRef = useRef(0);
  const songRef = useRef<DemoSong | null>(null);
  // Every playback gets its own generation. This prevents an old async playback
  // loop from waking up after a new song has started.
  const songGenerationRef = useRef(0);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => {
      if (
        ["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName,
        )
      )
        return;
      if (document.body.dataset.pianoMapping === "1") return;
      const map = readKeyMap();
      const note = map[e.code];
      if (!note || e.repeat) return;
      e.preventDefault();
      if (!NOTES[note]) return;
      computerPressedRef.current.add(e.code);
      void piano.playNoteInstance(note).then((handle) => {
        if (computerPressedRef.current.has(e.code))
          computerKeyHandlesRef.current.set(e.code, handle);
        else handle.stop();
      });
      setKeyboardPressed((prev) => new Set(prev).add(note));
    };
    const handleUp = (e: KeyboardEvent) => {
      if (document.body.dataset.pianoMapping === "1") return;
      const map = readKeyMap();
      const note = map[e.code];
      if (!note) return;
      e.preventDefault();
      computerPressedRef.current.delete(e.code);
      computerKeyHandlesRef.current.get(e.code)?.stop();
      computerKeyHandlesRef.current.delete(e.code);
      setKeyboardPressed((prev) => {
        const next = new Set(prev);
        next.delete(note);
        return next;
      });
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      computerKeyHandlesRef.current.forEach((handle) => handle.stop());
      computerKeyHandlesRef.current.clear();
      computerPressedRef.current.clear();
    };
  }, [piano]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    piano.setVolume(v / 100);
  };

  const handleRecordClick = () => {
    if (!isRecording) {
      void piano.startRecording();
      setIsRecording(true);
    } else {
      piano.stopRecording();
      setIsRecording(false);
      setCanPlayback(piano.recordedNotes.length > 0);
    }
  };

  const midiOf = (note: string) => {
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return -1;
    return noteNames.indexOf(match[1]) + (Number(match[2]) + 1) * 12;
  };

  const clearSongTimers = () => {
    songTimersRef.current.forEach((id) => window.clearTimeout(id));
    songTimersRef.current = [];
    songTimerResolversRef.current.forEach((resolve) => resolve());
    songTimerResolversRef.current = [];
  };

  const stopSongNotes = () => {
    songNoteHandlesRef.current.forEach((handle) => handle.stop());
    songNoteHandlesRef.current = [];
    songVisualNotesRef.current.clear();
    setPlaybackNotes(new Set());
  };

  const stopSongPlayback = () => {
    songGenerationRef.current += 1;
    stopSongRef.current = true;
    clearSongTimers();
    stopSongNotes();
    songRef.current = null;
    songOffsetBeatRef.current = 0;
    setIsSongPlaying(false);
    setIsSongPaused(false);
    setPlayingSongName("");
  };

  const pauseSongPlayback = () => {
    if (!songRef.current || !isSongPlaying || isSongPaused) return;
    const song = songRef.current;
    const beatMs = 60000 / song.bpm;
    songOffsetBeatRef.current = Math.max(
      0,
      (performance.now() - songStartedAtRef.current) / beatMs,
    );
    // Invalidate the running loop while keeping the song and offset for resume.
    songGenerationRef.current += 1;
    stopSongRef.current = true;
    clearSongTimers();
    stopSongNotes();
    setIsSongPaused(true);
  };

  const playSong = async (song: DemoSong, fromBeat = 0) => {
    // Invalidate every previous playback before starting this one.
    const generation = ++songGenerationRef.current;
    stopSongRef.current = false;
    clearSongTimers();
    stopSongNotes();

    const beatMs = 60000 / song.bpm;
    const events = [...song.events].sort((a, b) => a.start - b.start);
    const totalBeats =
      (events.at(-1)?.start ?? 0) + (events.at(-1)?.duration ?? 0);

    songRef.current = song;
    songOffsetBeatRef.current = fromBeat;
    songStartedAtRef.current = performance.now() - fromBeat * beatMs;
    setIsSongPlaying(true);
    setIsSongPaused(false);
    setPlayingSongName(song.name);

    const isAlive = () =>
      songGenerationRef.current === generation &&
      !stopSongRef.current &&
      songRef.current === song;

    const waitUntil = (targetBeat: number) =>
      new Promise<boolean>((resolve) => {
        if (!isAlive()) {
          resolve(false);
          return;
        }
        const delay = Math.max(
          0,
          targetBeat * beatMs - (performance.now() - songStartedAtRef.current),
        );
        const timer = window.setTimeout(() => {
          songTimerResolversRef.current = songTimerResolversRef.current.filter(
            (r) => r !== resolve,
          );
          resolve(isAlive());
        }, delay);
        songTimersRef.current.push(timer);
        songTimerResolversRef.current.push(() => {
          window.clearTimeout(timer);
          songTimerResolversRef.current = songTimerResolversRef.current.filter(
            (r) => r !== resolve,
          );
          resolve(false);
        });
      });

    for (const event of events) {
      if (!isAlive()) return;

      const eventEnd = event.start + event.duration;
      if (eventEnd <= fromBeat) continue;
      const startBeat = Math.max(event.start, fromBeat);

      if (!(await waitUntil(startBeat)) || !isAlive()) return;

      const notes = event.notes.filter((n) => NOTES[n]);
      if (!notes.length) continue;

      const elapsedBeat = Math.max(startBeat, fromBeat);
      const remainingDuration = Math.max(0.03, eventEnd - elapsedBeat);

      // Start every note in the chord from the same scheduling point.
      // Promise.all is intentionally kept here so a chord is never serialized.
      const handles = await Promise.all(
        notes.map(async (note) => {
          const handle = await piano.playNoteInstance(note);
          return { ...handle, note };
        }),
      );

      if (!isAlive()) {
        handles.forEach((handle) => handle.stop());
        return;
      }

      handles.forEach((handle) => {
        songNoteHandlesRef.current.push(handle);
        songVisualNotesRef.current.add(handle.note);
      });
      setPlaybackNotes(new Set(songVisualNotesRef.current));

      const stopTimer = window.setTimeout(() => {
        if (songGenerationRef.current !== generation) return;
        handles.forEach((handle) => handle.stop());
        songNoteHandlesRef.current = songNoteHandlesRef.current.filter(
          (h) => !handles.includes(h),
        );
        handles.forEach((handle) =>
          songVisualNotesRef.current.delete(handle.note),
        );
        setPlaybackNotes(new Set(songVisualNotesRef.current));
      }, remainingDuration * beatMs);
      songTimersRef.current.push(stopTimer);
    }

    if (!(await waitUntil(totalBeats)) || !isAlive()) return;

    stopSongNotes();
    setIsSongPlaying(false);
    setIsSongPaused(false);
    setPlayingSongName("");
    songRef.current = null;
    songOffsetBeatRef.current = 0;
    clearSongTimers();
  };

  const resumeSongPlayback = () => {
    const song = songRef.current;
    if (!song || !isSongPaused) return;
    const beat = songOffsetBeatRef.current;
    void playSong(song, beat);
  };

  useEffect(() => {
    return () => {
      songGenerationRef.current += 1;
      stopSongRef.current = true;
      clearSongTimers();
      stopSongNotes();
    };
  }, []);

  return (
    <div className="piano-page min-h-screen p-3 sm:p-6">
      <div className="piano-shell mx-auto w-full max-w-[1320px] rounded-[28px] p-5 shadow-2xl sm:p-8 lg:p-10">
        <div className="piano-header mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow">
              {isChinese ? "在线钢琴工作室" : "Web piano studio"}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              {isChinese ? "在线钢琴" : "Online Piano"}
            </h1>
            <p className="mt-2 text-base text-gray-600 sm:text-lg">
              {isChinese
                ? "用电脑键盘或点击琴键开始演奏"
                : "Play with your computer keyboard or click the keys"}
            </p>
          </div>
          <div className="flex gap-2 text-sm font-bold text-gray-500">
            <button
              className="language-toggle"
              onClick={() => setLanguage(isChinese ? "en" : "zh")}
            >
              {isChinese ? "EN" : "中文"}
            </button>
            <a href="/menu" className="nav-link">
              {isChinese ? "菜单" : "Menu"}
            </a>
            <a href="/guide" className="nav-link">
              {isChinese ? "使用指南" : "Guide"}
            </a>
          </div>
        </div>

        <div className="control-deck mb-8 grid gap-3 lg:grid-cols-3">
          <div className="control-group flex items-center gap-4">
            <label className="font-semibold text-gray-700">
              {isChinese ? "音量:" : "Volume:"}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-32 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-gray-700 font-semibold min-w-12">
              {volume}%
            </span>
          </div>
          <div className="control-group flex items-center justify-center gap-4">
            <label className="font-semibold text-gray-700">
              {isChinese ? "八度:" : "Octave:"}
            </label>
            <button
              onClick={() => setCurrentOctave(Math.max(2, currentOctave - 1))}
              className="min-h-11 min-w-11 rounded-lg border-2 border-purple-500 px-4 py-2 text-purple-500 transition hover:bg-purple-500 hover:text-white"
            >
              -
            </button>
            <span className="min-w-8 text-center font-semibold text-gray-700">
              {currentOctave}
            </span>
            <button
              onClick={() => setCurrentOctave(Math.min(6, currentOctave + 1))}
              className="min-h-11 min-w-11 rounded-lg border-2 border-purple-500 px-4 py-2 text-purple-500 transition hover:bg-purple-500 hover:text-white"
            >
              +
            </button>
          </div>
          <div className="control-group flex items-center justify-center gap-4">
            <label className="font-semibold text-gray-700">
              {isChinese ? "键盘:" : "Keys:"}
            </label>
            <button
              onClick={() => setKeyboardSize("compact")}
              className={`min-h-11 rounded-lg border-2 px-5 py-2 transition ${keyboardSize === "compact" ? "border-blue-500 bg-blue-500 text-white" : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"}`}
            >
              21键
            </button>
            <button
              onClick={() => setKeyboardSize("full")}
              className={`min-h-11 rounded-lg border-2 px-5 py-2 transition ${keyboardSize === "full" ? "border-blue-500 bg-blue-500 text-white" : "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"}`}
            >
              88键
            </button>
          </div>
        </div>

        <div className="instrument-controls mb-8 grid gap-5 xl:grid-cols-[1.25fr_1fr]">
          <RecordingControls
            isRecording={isRecording}
            canPlayback={canPlayback}
            isPlaying={isPlaying}
            onRecord={handleRecordClick}
            onPlayback={() => {
              if (isPlaying) {
                stopPlaybackRef.current?.();
                return;
              }
              setIsPlaying(true);
              setPlaybackNotes(new Set());
              const cancel = () => {
                setIsPlaying(false);
                setPlaybackNotes(new Set());
              };
              stopPlaybackRef.current = cancel;
              void piano.playRecording().finally(cancel);
            }}
            onDownload={() => {
              const blob = new Blob(
                [JSON.stringify(piano.recordedNotes, null, 2)],
                { type: "application/json" },
              );
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "online-piano-recording.json";
              a.click();
              URL.revokeObjectURL(a.href);
            }}
            onClear={() => {
              piano.clearRecording();
              setCanPlayback(false);
            }}
          />
          <PedalPanel
            sustainActive={sustainActive}
            softActive={softActive}
            centerPedalActive={centerPedalActive}
            onSustainClick={() => {
              piano.toggleSustain();
              setSustainActive((v) => !v);
            }}
            onSoftClick={() => setSoftActive((v) => !v)}
            onCenterPedalClick={() => setCenterPedalActive((v) => !v)}
          />
        </div>

        <section className="keyboard-stage" aria-labelledby="keyboard-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">
                {isChinese ? "演奏区域" : "Play surface"}
              </p>
              <h2
                id="keyboard-heading"
                className="mt-1 text-2xl font-black text-gray-900"
              >
                {isChinese ? "演奏键盘" : "Piano keyboard"}
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              {isChinese
                ? "映射、琴键范围和电脑快捷键都在这里设置"
                : "Set mappings, range, and computer shortcuts here"}
            </p>
          </div>
          <PianoKeyboard
            piano={piano}
            octave={currentOctave}
            notes={NOTES}
            externalPressedKeys={
              new Set([...keyboardPressed, ...playbackNotes])
            }
            keyboardSize={keyboardSize}
          />
        </section>

        <section
          className="mt-10 border-t border-gray-200 pt-8"
          aria-labelledby="demo-heading"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-500">
                {isChinese ? "练习曲库" : "Practice library"}
              </p>
              <h2
                id="demo-heading"
                className="mt-1 text-2xl font-black text-gray-800"
              >
                {isChinese ? "示范曲目" : "Demo songs"}
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              {isChinese
                ? "选择一首，跟着键盘上的高亮练习"
                : "Choose a song and follow the highlighted keys"}
            </p>
          </div>
          <DemoSongs
            onPlaySong={(song) => void playSong(song, 0)}
            onPauseSong={pauseSongPlayback}
            onResumeSong={resumeSongPlayback}
            onStopSong={stopSongPlayback}
            playingSongName={playingSongName}
            isPaused={isSongPaused}
          />
        </section>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <p className="font-bold text-blue-900 mb-2">
            {isChinese ? "键盘快捷键：" : "Keyboard shortcuts:"}
          </p>
          <p className="text-gray-700 font-mono text-sm">
            <strong>{isChinese ? "白键：" : "White keys:"}</strong> Z X C V B N
            M | , . /
          </p>
          <p className="text-gray-700 font-mono text-sm mt-1">
            <strong>{isChinese ? "黑键：" : "Black keys:"}</strong> S D | G H J
            | L | 5 6 7
          </p>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm border-t pt-6">
          <p>
            使用 Web Audio API + Piano Samples 实现的虚拟钢琴 | Next.js + React
            + TypeScript
          </p>
          <p className="mt-2">
            <a href="/privacy" className="hover:text-purple-600">
              Privacy
            </a>{" "}
            ·{" "}
            <a href="/terms" className="hover:text-purple-600">
              Terms
            </a>{" "}
            ·{" "}
            <a href="/cookies" className="hover:text-purple-600">
              Cookies
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
