"use client";

import React, { useState } from "react";

export interface DemoSong {
  name: string;
  notes: Array<{ note: string | string[]; duration: number }>;
}

type SongEvent = { note: string | string[]; duration: number };

const WHOLE = 1.6;
const HALF = 0.8;
const TRIPLET_SIXTEENTH = 0.075;
const DOTTED_QUARTER = 0.6;
const SIXTEENTH = 0.1;
const EIGHTH = 0.2;
const DOTTED_EIGHTH = 0.3;
const QUARTER = 0.4;

const note = (pitch: string, duration: number) => ({ note: pitch, duration });
const chord = (pitches: string[], duration: number) => ({
  note: pitches,
  duration,
});
const rest = (duration: number) => ({ note: "REST", duration });
const phrase = (...entries: Array<[string, number]>) =>
  entries.map(([pitch, duration]) => note(pitch, duration));

const PITCHES = [
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
const NOTE_INDEX: Record<string, number> = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

function transposeNote(pitch: string, semitones: number): string | null {
  const match = /^([A-G](?:#|b)?)(\d)$/.exec(pitch);
  if (!match) return null;

  const [, noteName, octaveText] = match;
  const noteIndex = NOTE_INDEX[noteName];
  if (noteIndex === undefined) return null;

  const octave = Number(octaveText);
  const midi = (octave + 1) * 12 + noteIndex + semitones;
  const nextOctave = Math.floor(midi / 12) - 1;
  const nextIndex = ((midi % 12) + 12) % 12;

  if (nextOctave < 2 || nextOctave > 8) {
    return null;
  }

  return `${PITCHES[nextIndex]}${nextOctave}`;
}

function arrangeTwoHands(events: SongEvent[]): SongEvent[] {
  let cursor = 0;

  return events.map((event) => {
    if (event.note === "REST" || Array.isArray(event.note)) {
      cursor += event.duration;
      return event;
    }

    const startsOnBeat = Math.abs(cursor % QUARTER) < 0.0001;
    const withBass = event.duration >= QUARTER || startsOnBeat;
    const withFifth = event.duration >= HALF;

    if (!withBass) {
      cursor += event.duration;
      return event;
    }

    const bassRoot = transposeNote(event.note, -12);
    const bassFifth = withFifth ? transposeNote(event.note, -5) : null;
    const chordNotes = [bassRoot, bassFifth, event.note].filter(
      (value): value is string => Boolean(value),
    );

    cursor += event.duration;
    return chord([...new Set(chordNotes)], event.duration);
  });
}

// 完整且已校对过的主旋律曲库
export const DEMO_SONGS: Record<string, DemoSong> = {
  twinkle: {
    name: "✨ 小星星",
    notes: arrangeTwoHands([
      ...phrase(
        ["C4", QUARTER],
        ["C4", QUARTER],
        ["G4", QUARTER],
        ["G4", QUARTER],
        ["A4", QUARTER],
        ["A4", QUARTER],
        ["G4", HALF],
      ),
      ...phrase(
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["D4", QUARTER],
        ["D4", QUARTER],
        ["C4", HALF],
      ),
      ...phrase(
        ["G4", QUARTER],
        ["G4", QUARTER],
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["D4", HALF],
      ),
      ...phrase(
        ["G4", QUARTER],
        ["G4", QUARTER],
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["D4", HALF],
      ),
      ...phrase(
        ["C4", QUARTER],
        ["C4", QUARTER],
        ["G4", QUARTER],
        ["G4", QUARTER],
        ["A4", QUARTER],
        ["A4", QUARTER],
        ["G4", HALF],
      ),
      ...phrase(
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["D4", QUARTER],
        ["D4", QUARTER],
        ["C4", HALF],
      ),
    ]),
  },
  mary: {
    name: "🐑 玛丽有只小羊羔",
    notes: arrangeTwoHands([
      ...phrase(
        ["E4", QUARTER],
        ["D4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["E4", HALF],
      ),
      ...phrase(["D4", QUARTER], ["D4", QUARTER], ["D4", HALF]),
      ...phrase(["E4", QUARTER], ["G4", QUARTER], ["G4", HALF]),
      ...phrase(
        ["E4", QUARTER],
        ["D4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
      ),
      ...phrase(
        ["D4", QUARTER],
        ["D4", QUARTER],
        ["E4", QUARTER],
        ["D4", QUARTER],
        ["C4", HALF],
      ),
    ]),
  },
  ode: {
    name: "🎵 欢乐颂",
    notes: arrangeTwoHands([
      ...phrase(
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["F4", QUARTER],
        ["G4", QUARTER],
        ["G4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["D4", QUARTER],
      ),
      ...phrase(
        ["C4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["E4", QUARTER],
        ["E4", DOTTED_QUARTER],
        ["D4", EIGHTH],
        ["D4", HALF],
      ),
      ...phrase(
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["F4", QUARTER],
        ["G4", QUARTER],
        ["G4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["D4", QUARTER],
      ),
      ...phrase(
        ["C4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["E4", QUARTER],
        ["D4", DOTTED_QUARTER],
        ["C4", EIGHTH],
        ["C4", HALF],
      ),
      ...phrase(
        ["D4", QUARTER],
        ["D4", QUARTER],
        ["E4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["E4", EIGHTH],
        ["F4", EIGHTH],
        ["E4", QUARTER],
        ["C4", QUARTER],
      ),
      ...phrase(
        ["D4", QUARTER],
        ["E4", EIGHTH],
        ["F4", EIGHTH],
        ["E4", QUARTER],
        ["D4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["G3", HALF],
      ),
      ...phrase(
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["F4", QUARTER],
        ["G4", QUARTER],
        ["G4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["D4", QUARTER],
      ),
      ...phrase(
        ["C4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["E4", QUARTER],
        ["D4", DOTTED_QUARTER],
        ["C4", EIGHTH],
        ["C4", HALF],
      ),
    ]),
  },
  birthday: {
    name: "🎂 生日快乐歌",
    notes: arrangeTwoHands([
      ...phrase(
        ["G4", EIGHTH],
        ["G4", EIGHTH],
        ["A4", QUARTER],
        ["G4", QUARTER],
        ["C5", QUARTER],
        ["B4", HALF],
      ),
      ...phrase(
        ["G4", EIGHTH],
        ["G4", EIGHTH],
        ["A4", QUARTER],
        ["G4", QUARTER],
        ["D5", QUARTER],
        ["C5", HALF],
      ),
      ...phrase(
        ["G4", EIGHTH],
        ["G4", EIGHTH],
        ["G5", QUARTER],
        ["E5", QUARTER],
        ["C5", QUARTER],
        ["B4", QUARTER],
        ["A4", HALF],
      ),
      ...phrase(
        ["F5", EIGHTH],
        ["F5", EIGHTH],
        ["E5", QUARTER],
        ["C5", QUARTER],
        ["D5", QUARTER],
        ["C5", HALF],
      ),
    ]),
  },
  alice: {
    name: "🎹 致爱丽丝",
    notes: arrangeTwoHands([
      // 1-1. 前半句
      ...phrase(
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["E5", EIGHTH],
        ["B4", EIGHTH],
        ["D5", EIGHTH],
        ["C5", EIGHTH],
        ["A4", EIGHTH],
      ),
      rest(EIGHTH),
      ...phrase(["C4", EIGHTH], ["E4", EIGHTH], ["A4", EIGHTH]),
      ...phrase(["B4", EIGHTH]),
      rest(EIGHTH),
      ...phrase(["E4", EIGHTH], ["G#4", EIGHTH], ["B4", EIGHTH]),
      ...phrase(["C5", EIGHTH]),
      rest(EIGHTH),
      ...phrase(["E4", EIGHTH]),

      ...phrase(
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["E5", EIGHTH],
        ["B4", EIGHTH],
        ["D5", EIGHTH],
        ["C5", EIGHTH],
        ["A4", EIGHTH],
      ),
      rest(EIGHTH),
      ...phrase(["C4", EIGHTH], ["E4", EIGHTH], ["A4", EIGHTH]),
      ...phrase(["B4", EIGHTH]),
      rest(EIGHTH),
      ...phrase(["E4", EIGHTH], ["C5", EIGHTH], ["B4", EIGHTH]),
      ...phrase(["A4", EIGHTH]),
      rest(EIGHTH),

      // ================= 2. 插段一 (B段 - F大调) =================
      ...phrase(["C5", EIGHTH], ["C5", EIGHTH], ["C5", EIGHTH]),
      ...phrase(
        ["F5", DOTTED_EIGHTH],
        ["E5", EIGHTH],
        ["D5", EIGHTH],
        ["C5", EIGHTH],
      ),
      ...phrase(
        ["Bb4", EIGHTH],
        ["A4", EIGHTH],
        ["G4", EIGHTH],
        ["F4", EIGHTH],
      ),
      ...phrase(
        ["E4", EIGHTH],
        ["F4", EIGHTH],
        ["G4", EIGHTH],
        ["A4", EIGHTH],
        ["Bb4", EIGHTH],
        ["C5", EIGHTH],
      ),
      ...phrase(["D5", EIGHTH], ["B4", EIGHTH], ["C5", EIGHTH]),
      rest(EIGHTH),
      ...phrase(["D5", EIGHTH], ["E5", EIGHTH]),
      ...phrase(
        ["F5", EIGHTH],
        ["F5", EIGHTH],
        ["G5", EIGHTH],
        ["E5", EIGHTH],
        ["F5", EIGHTH],
      ),
      ...phrase(
        ["D5", EIGHTH],
        ["E5", EIGHTH],
        ["F5", EIGHTH],
        ["D5", EIGHTH],
        ["E5", EIGHTH],
      ),
      ...phrase(
        ["C5", EIGHTH],
        ["D5", EIGHTH],
        ["C5", EIGHTH],
        ["B4", EIGHTH],
        ["A4", EIGHTH],
      ),

      ...phrase(
        ["Bb4", EIGHTH / 2],
        ["A4", EIGHTH / 2],
        ["G4", EIGHTH / 2],
        ["F4", EIGHTH / 2],
        ["E4", EIGHTH / 2],
        ["D4", EIGHTH / 2],
        ["C4", EIGHTH / 2],
        ["Bb3", EIGHTH / 2],
      ),

      ...phrase(
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["E5", EIGHTH],
        ["B4", EIGHTH],
        ["D5", EIGHTH],
        ["C5", EIGHTH],
        ["A4", EIGHTH],
      ),
      rest(EIGHTH),
      ...phrase(["C4", EIGHTH], ["E4", EIGHTH], ["A4", EIGHTH]),
      ...phrase(["B4", EIGHTH]),
      rest(EIGHTH),
      ...phrase(["E4", EIGHTH], ["G#4", EIGHTH], ["B4", EIGHTH]),
      ...phrase(["C5", EIGHTH]),
      rest(EIGHTH),
      ...phrase(["E4", EIGHTH]),

      ...phrase(
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["E5", EIGHTH],
        ["B4", EIGHTH],
        ["D5", EIGHTH],
        ["C5", EIGHTH],
        ["A4", EIGHTH],
      ),
      rest(EIGHTH),
      ...phrase(["C4", EIGHTH], ["E4", EIGHTH], ["A4", EIGHTH]),
      ...phrase(["B4", EIGHTH]),
      rest(EIGHTH),
      ...phrase(["E4", EIGHTH], ["C5", EIGHTH], ["B4", EIGHTH]),
      ...phrase(["A4", EIGHTH]),
      rest(EIGHTH),

      ...phrase(["E5", EIGHTH], ["E5", EIGHTH], ["E5", EIGHTH]),
      ...phrase(
        ["E5", EIGHTH],
        ["F5", EIGHTH],
        ["E5", EIGHTH],
        ["D5", EIGHTH],
        ["D5", EIGHTH],
      ),
      ...phrase(
        ["D5", EIGHTH],
        ["F5", EIGHTH],
        ["E5", EIGHTH],
        ["D5", EIGHTH],
        ["C5", EIGHTH],
      ),
      ...phrase(
        ["B4", EIGHTH],
        ["C5", EIGHTH],
        ["D5", EIGHTH],
        ["E5", EIGHTH],
        ["C5", EIGHTH],
      ),
      ...phrase(["A4", EIGHTH]),
      rest(EIGHTH),

      ...phrase(
        ["A3", EIGHTH],
        ["C4", EIGHTH],
        ["E4", EIGHTH],
        ["A4", EIGHTH],
        ["C5", EIGHTH],
        ["E5", EIGHTH],
        ["A5", EIGHTH],
        ["C6", EIGHTH],
        ["B5", EIGHTH],
        ["Bb5", EIGHTH],
        ["A5", EIGHTH],
        ["Ab5", EIGHTH],
        ["G5", EIGHTH],
        ["F#5", EIGHTH],
        ["F5", EIGHTH],
        ["E5", EIGHTH],
        ["D#5", EIGHTH],
        ["D5", EIGHTH],
      ),

      ...phrase(
        ["E5", SIXTEENTH],
        ["D#5", SIXTEENTH],
        ["E5", SIXTEENTH],
        ["D#5", SIXTEENTH],
        ["E5", SIXTEENTH],
        ["B4", SIXTEENTH],
        ["D5", SIXTEENTH],
        ["C5", SIXTEENTH],
        ["A4", EIGHTH],
      ),
      rest(SIXTEENTH),
      ...phrase(["C4", SIXTEENTH], ["E4", SIXTEENTH], ["A4", SIXTEENTH]),
      ...phrase(["B4", EIGHTH]),
      rest(SIXTEENTH),
      ...phrase(["E4", SIXTEENTH], ["G#4", SIXTEENTH], ["B4", SIXTEENTH]),
      ...phrase(["C5", EIGHTH]),
      rest(SIXTEENTH),
      ...phrase(["E4", SIXTEENTH]),

      ...phrase(
        ["E5", SIXTEENTH],
        ["D#5", SIXTEENTH],
        ["E5", SIXTEENTH],
        ["D#5", SIXTEENTH],
        ["E5", SIXTEENTH],
        ["B4", SIXTEENTH],
        ["D5", SIXTEENTH],
        ["C5", SIXTEENTH],
        ["A4", EIGHTH],
      ),
      rest(SIXTEENTH),
      ...phrase(["C4", SIXTEENTH], ["E4", SIXTEENTH], ["A4", SIXTEENTH]),
      ...phrase(["B4", EIGHTH]),
      rest(SIXTEENTH),
      ...phrase(["E4", SIXTEENTH], ["C5", SIXTEENTH], ["B4", SIXTEENTH]),
      ...phrase(["A4", EIGHTH]),
    ]),
  },
  bells: {
    name: "🔔 铃儿响叮当",
    notes: arrangeTwoHands([
      ...phrase(["E4", QUARTER], ["E4", QUARTER], ["E4", HALF]),
      ...phrase(["E4", QUARTER], ["E4", QUARTER], ["E4", HALF]),
      ...phrase(
        ["E4", QUARTER],
        ["G4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["E4", WHOLE],
      ),
      ...phrase(
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["E4", EIGHTH],
        ["E4", EIGHTH],
      ),
      ...phrase(
        ["E4", QUARTER],
        ["D4", QUARTER],
        ["D4", QUARTER],
        ["E4", QUARTER],
        ["D4", HALF],
        ["G4", HALF],
      ),
      ...phrase(["E4", QUARTER], ["E4", QUARTER], ["E4", HALF]),
      ...phrase(["E4", QUARTER], ["E4", QUARTER], ["E4", HALF]),
      ...phrase(
        ["E4", QUARTER],
        ["G4", QUARTER],
        ["C4", QUARTER],
        ["D4", QUARTER],
        ["E4", WHOLE],
      ),
      ...phrase(
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["F4", QUARTER],
        ["E4", QUARTER],
        ["E4", QUARTER],
        ["E4", EIGHTH],
        ["E4", EIGHTH],
      ),
      ...phrase(
        ["G4", QUARTER],
        ["G4", QUARTER],
        ["F4", QUARTER],
        ["D4", QUARTER],
        ["C4", WHOLE],
      ),
    ]),
  },
  silent: {
    name: "🌙 平安夜",
    notes: arrangeTwoHands([
      ...phrase(
        ["G4", DOTTED_QUARTER],
        ["A4", EIGHTH],
        ["G4", QUARTER],
        ["E4", DOTTED_QUARTER],
        ["G4", EIGHTH],
      ),
      ...phrase(
        ["A4", DOTTED_QUARTER],
        ["G4", EIGHTH],
        ["E4", QUARTER],
        ["A4", HALF],
      ),
      ...phrase(
        ["B4", HALF],
        ["B4", QUARTER],
        ["D5", QUARTER],
        ["C5", QUARTER],
        ["G4", QUARTER],
        ["E4", QUARTER],
      ),
      ...phrase(["G4", HALF], ["F4", QUARTER], ["D4", QUARTER], ["C4", WHOLE]),
      ...phrase(
        ["G4", DOTTED_QUARTER],
        ["A4", EIGHTH],
        ["G4", QUARTER],
        ["E4", DOTTED_QUARTER],
        ["G4", EIGHTH],
      ),
      ...phrase(
        ["A4", DOTTED_QUARTER],
        ["G4", EIGHTH],
        ["E4", QUARTER],
        ["A4", HALF],
      ),
      ...phrase(
        ["B4", HALF],
        ["B4", QUARTER],
        ["D5", QUARTER],
        ["C5", QUARTER],
        ["G4", QUARTER],
        ["E4", QUARTER],
      ),
      ...phrase(["G4", HALF], ["F4", QUARTER], ["D4", QUARTER], ["C4", WHOLE]),
    ]),
  },
  london: {
    name: "🌉 伦敦大桥",
    notes: arrangeTwoHands([
      ...phrase(
        ["G4", QUARTER],
        ["A4", QUARTER],
        ["G4", QUARTER],
        ["F4", QUARTER],
      ),
      ...phrase(["E4", QUARTER], ["F4", QUARTER], ["G4", HALF]),
      ...phrase(["D4", QUARTER], ["E4", QUARTER], ["F4", HALF]),
      ...phrase(["E4", QUARTER], ["F4", QUARTER], ["G4", HALF]),
      ...phrase(
        ["G4", QUARTER],
        ["A4", QUARTER],
        ["G4", QUARTER],
        ["F4", QUARTER],
      ),
      ...phrase(["E4", QUARTER], ["F4", QUARTER], ["G4", HALF]),
      ...phrase(["D4", HALF], ["G4", HALF]),
      ...phrase(["E4", HALF], ["C4", WHOLE]),
    ]),
  },
};

interface DemoSongsProps {
  onPlaySong: (
    notes: Array<{ note: string | string[]; duration: number }>,
  ) => void;
  isPlaying?: boolean;
}

export default function DemoSongs({
  onPlaySong,
  isPlaying = false,
}: DemoSongsProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);

  const handlePlaySong = (songKey: string) => {
    const song = DEMO_SONGS[songKey];
    if (song && song.notes.length > 0) {
      setSelectedSong(songKey);
      onPlaySong(song.notes);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border-2 border-purple-300">
      <p className="font-bold text-purple-900 mb-4 text-lg">🎹 名曲演奏库</p>
      <p className="mb-4 text-sm text-purple-700">
        当前曲库使用完整主旋律版本，并自动补了左手伴奏，支持左右手同时演奏。
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Object.entries(DEMO_SONGS).map(([key, song]) => (
          <button
            key={key}
            onClick={() => handlePlaySong(key)}
            disabled={
              song.notes.length === 0 || (isPlaying && selectedSong !== key)
            }
            className={`px-4 py-3 rounded-lg font-semibold transition-all transform ${
              selectedSong === key && isPlaying
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg"
                : song.notes.length === 0
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed border-2 border-dashed border-gray-300"
                  : isPlaying
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-white text-purple-900 border-2 border-purple-400 hover:bg-purple-100 hover:scale-105 active:scale-95 shadow-md"
            }`}
          >
            {song.name}
            {song.notes.length === 0 ? " · 待导入" : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
