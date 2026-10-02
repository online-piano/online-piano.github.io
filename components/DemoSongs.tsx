"use client";
import { useLanguage } from "@/components/LanguageProvider";

export type SongEvent = {
  start: number;
  duration: number;
  notes: string[];
};
export type DemoSong = {
  name: string;
  difficulty: string;
  bpm: number;
  events: SongEvent[];
};

const ev = (
  start: number,
  duration: number,
  ...notes: string[]
): SongEvent => ({ start, duration, notes });
const build = (
  bpm: number,
  steps: Array<{ beats: number; duration?: number; notes: string[] }>,
): SongEvent[] => {
  let cursor = 0;
  return steps.map((s) => {
    const e = ev(cursor, s.duration ?? s.beats, ...s.notes);
    cursor += s.beats;
    return e;
  });
};

// Timeline is expressed in beats, not fixed milliseconds. The player converts beats using each song's BPM.
const furElise = (): SongEvent[] => {
  // Für Elise opening/return: 3/8, with the characteristic E-D# motif and left-hand accompaniment.
  // Beat unit here is an eighth-note. This makes the short notes genuinely shorter than the held notes.
  const events: SongEvent[] = [];
  let t = 0;
  const add = (beats: number, duration: number, ...notes: string[]) => {
    events.push(ev(t, duration, ...notes));
    t += beats;
  };

  const motif = () => {
    add(1, 0.82, "E5", "A2", "E3", "A3");
    add(1, 0.82, "D#5", "A2", "E3", "A3");
    add(1, 0.82, "E5", "A2", "E3", "A3");
    add(1, 0.82, "D#5", "A2", "E3", "A3");
    add(1, 0.82, "E5", "A2", "E3", "A3");
    add(1, 0.82, "B4", "E2", "B2", "E3");
    add(1, 0.82, "D5", "E2", "B2", "E3");
    add(1, 0.82, "C5", "E2", "B2", "E3");
    add(3, 2.7, "A4", "A2", "E3", "A3");
    add(1, 0.82, "C4", "A2", "E3", "A3");
    add(1, 0.82, "E4", "A2", "E3", "A3");
    add(3, 2.7, "A4", "A2", "E3", "A3");
    add(3, 2.7, "B4", "E2", "B2", "E3");
    add(1, 0.82, "E4", "E2", "B2", "E3");
    add(1, 0.82, "G#4", "E2", "B2", "E3");
    add(3, 2.7, "B4", "E2", "B2", "E3");
    add(3, 2.7, "C5", "A2", "E3", "A3");
  };

  motif();
  motif();

  // Middle episode: wider register and moving left hand. This is intentionally kept on the same time grid.
  const middle = [
    ["C6", "A2", "E3", "A3"],
    ["B5", "A2", "E3", "A3"],
    ["A5", "A2", "E3", "A3"],
    ["G#5", "E2", "B2", "E3"],
    ["A5", "E2", "B2", "E3"],
    ["C6", "E2", "B2", "E3"],
    ["E6", "E2", "B2", "E3"],
    ["D6", "E2", "B2", "E3"],
    ["C6", "F2", "C3", "F3"],
    ["A5", "F2", "C3", "F3"],
    ["G5", "F2", "C3", "F3"],
    ["F5", "F2", "C3", "F3"],
    ["E5", "G2", "D3", "G3"],
    ["D5", "G2", "D3", "G3"],
    ["C5", "G2", "D3", "G3"],
    ["B4", "E2", "B2", "E3"],
    ["A4", "A2", "E3", "A3"],
  ];
  middle.forEach((notes, i) =>
    add(
      i === middle.length - 1 ? 3 : 1,
      i === middle.length - 1 ? 2.7 : 0.82,
      ...notes,
    ),
  );

  motif();
  return events;
};

export const songs: DemoSong[] = [
  {
    name: "Twinkle Twinkle Little Star",
    difficulty: "Easy",
    bpm: 96,
    events: build(96, [
      ...["C4", "C4", "G4", "G4", "A4", "A4"].map((notes) => ({
        beats: 1,
        notes: [notes],
      })),
      { beats: 2, notes: ["G4"] },
      ...["F4", "F4", "E4", "E4", "D4", "D4"].map((notes) => ({
        beats: 1,
        notes: [notes],
      })),
      { beats: 2, notes: ["C4"] },
      ...["G4", "G4", "F4", "F4", "E4", "E4"].map((notes) => ({
        beats: 1,
        notes: [notes],
      })),
      { beats: 2, notes: ["D4"] },
      ...["G4", "G4", "F4", "F4", "E4", "E4"].map((notes) => ({
        beats: 1,
        notes: [notes],
      })),
      { beats: 2, notes: ["D4"] },
      ...["C4", "C4", "G4", "G4", "A4", "A4"].map((notes) => ({
        beats: 1,
        notes: [notes],
      })),
      { beats: 2, notes: ["G4"] },
      ...["F4", "F4", "E4", "E4", "D4", "D4"].map((notes) => ({
        beats: 1,
        notes: [notes],
      })),
      { beats: 4, notes: ["C4"] },
    ]),
  },
  {
    name: "Mary Had a Little Lamb",
    difficulty: "Easy",
    bpm: 100,
    events: build(100, [
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 1, notes: ["C4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 4, notes: ["E4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 4, notes: ["D4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 4, notes: ["G4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 1, notes: ["C4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 4, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 3, notes: ["C4"] },
    ]),
  },
  {
    name: "Ode to Joy",
    difficulty: "Easy",
    bpm: 108,
    events: build(108, [
      ...["E4", "E4", "F4", "G4"].map((n) => ({ beats: 1, notes: [n] })),
      { beats: 2, notes: ["G4"] },
      { beats: 2, notes: ["F4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 2, notes: ["D4"] },
      ...["C4", "C4", "D4", "E4"].map((n) => ({ beats: 1, notes: [n] })),
      { beats: 2, notes: ["E4"] },
      { beats: 2, notes: ["D4"] },
      { beats: 4, notes: ["D4"] },
      ...["E4", "E4", "F4", "G4"].map((n) => ({ beats: 1, notes: [n] })),
      { beats: 2, notes: ["G4"] },
      { beats: 2, notes: ["F4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 2, notes: ["D4"] },
      ...["C4", "C4", "D4", "E4"].map((n) => ({ beats: 1, notes: [n] })),
      { beats: 2, notes: ["D4"] },
      { beats: 2, notes: ["C4"] },
      { beats: 4, notes: ["C4"] },
    ]),
  },
  {
    name: "Happy Birthday",
    difficulty: "Easy",
    bpm: 96,
    events: build(96, [
      { beats: 1, notes: ["G4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 2, notes: ["A4"] },
      { beats: 2, notes: ["G4"] },
      { beats: 2, notes: ["C5"] },
      { beats: 2, notes: ["B4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 2, notes: ["A4"] },
      { beats: 2, notes: ["G4"] },
      { beats: 2, notes: ["D5"] },
      { beats: 2, notes: ["C5"] },
      { beats: 1, notes: ["G4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 2, notes: ["G5"] },
      { beats: 2, notes: ["E5"] },
      { beats: 2, notes: ["C5"] },
      { beats: 2, notes: ["B4"] },
      { beats: 2, notes: ["A4"] },
      { beats: 1, notes: ["F5"] },
      { beats: 1, notes: ["F5"] },
      { beats: 2, notes: ["E5"] },
      { beats: 2, notes: ["C5"] },
      { beats: 2, notes: ["D5"] },
      { beats: 4, notes: ["C5"] },
    ]),
  },
  { name: "Für Elise", difficulty: "Medium", bpm: 112, events: furElise() },
  {
    name: "Jingle Bells",
    difficulty: "Easy",
    bpm: 120,
    events: build(120, [
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 1, notes: ["C4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 4, notes: ["E4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 2, notes: ["D4"] },
      { beats: 2, notes: ["G4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 2, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 1, notes: ["C4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 4, notes: ["E4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["E4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 1, notes: ["G4"] },
      { beats: 1, notes: ["F4"] },
      { beats: 1, notes: ["D4"] },
      { beats: 1, notes: ["C4"] },
      { beats: 4, notes: ["C4"] },
    ]),
  },
];

interface DemoSongsProps {
  onPlaySong: (song: DemoSong) => void;
  onPauseSong: () => void;
  onResumeSong: () => void;
  onStopSong: () => void;
  playingSongName?: string;
  isPaused?: boolean;
}

export default function DemoSongs({
  onPlaySong,
  onPauseSong,
  onResumeSong,
  onStopSong,
  playingSongName = "",
  isPaused = false,
}: DemoSongsProps) {
  const { language } = useLanguage();
  const isChinese = language === "zh";
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => {
        const isCurrent = playingSongName === song.name;
        const isOtherPlaying = !!playingSongName && !isCurrent;
        return (
          <div key={song.name} className="card p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-violet-500">
              {isChinese
                ? song.difficulty === "Easy"
                  ? "简单"
                  : "中等"
                : song.difficulty}
            </div>
            <h3 className="mt-2 font-bold">{song.name}</h3>
            <p className="mt-1 text-xs text-gray-500">
              {isChinese
                ? `时间轴演奏 · ${song.events.length} 个乐句事件 · ${song.bpm} BPM`
                : `Timeline · ${song.events.length} events · ${song.bpm} BPM`}
            </p>
            <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
              <button
                className="btn btn-primary w-full"
                disabled={isOtherPlaying}
                onClick={() =>
                  isCurrent
                    ? isPaused
                      ? onResumeSong()
                      : onPauseSong()
                    : onPlaySong(song)
                }
              >
                {isCurrent
                  ? isPaused
                    ? isChinese
                      ? "▶ 继续"
                      : "▶ Resume"
                    : isChinese
                      ? "Ⅱ 暂停"
                      : "Ⅱ Pause"
                  : isChinese
                    ? "▶ 播放"
                    : "▶ Play"}
              </button>
              <button
                className="min-h-11 min-w-11 rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                disabled={!isCurrent}
                onClick={onStopSong}
                title={isChinese ? "停止" : "Stop"}
              >
                ■
              </button>
            </div>
            {isCurrent && (
              <div className="mt-2 text-center text-xs font-semibold text-violet-600">
                {isPaused
                  ? isChinese
                    ? "已暂停"
                    : "Paused"
                  : isChinese
                    ? "播放中…"
                    : "Playing…"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
