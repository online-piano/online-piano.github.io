'use client';

import React, { useState } from 'react';

export interface DemoSong {
  name: string;
  notes: Array<{ note: string; duration: number }>;
}

// 经典名曲库
export const DEMO_SONGS: Record<string, DemoSong> = {
  twinkle: {
    name: '✨ 小星星',
    notes: [
      { note: 'C4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'A4', duration: 0.4 },
      { note: 'A4', duration: 0.4 },
      { note: 'G4', duration: 0.8 },
      { note: 'F4', duration: 0.4 },
      { note: 'F4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'C4', duration: 0.8 },
      { note: 'G4', duration: 0.4 },
      { note: 'F4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'C4', duration: 0.8 },
    ]
  },
  mary: {
    name: '🐑 玛丽有只小羊羔',
    notes: [
      { note: 'E4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.8 },
      { note: 'D4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'D4', duration: 0.8 },
      { note: 'E4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'G4', duration: 0.8 },
      { note: 'E4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.8 },
    ]
  },
  ode: {
    name: '🎵 欢乐颂',
    notes: [
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'F4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'G4', duration: 0.4 },
      { note: 'F4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'C4', duration: 0.4 },
      { note: 'D4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.4 },
      { note: 'E4', duration: 0.8 },
      { note: 'E4', duration: 0.4 },
      { note: 'F4', duration: 0.4 },
      { note: 'G4', duration: 0.8 },
    ]
  },
  birthday: {
    name: '🎂 生日快乐歌',
    notes: [
      { note: 'C4', duration: 0.3 },
      { note: 'C4', duration: 0.3 },
      { note: 'D4', duration: 0.6 },
      { note: 'C4', duration: 0.6 },
      { note: 'F4', duration: 0.6 },
      { note: 'E4', duration: 1.2 },
      { note: 'C4', duration: 0.3 },
      { note: 'C4', duration: 0.3 },
      { note: 'D4', duration: 0.6 },
      { note: 'C4', duration: 0.6 },
      { note: 'G4', duration: 0.6 },
      { note: 'F4', duration: 1.2 },
      { note: 'C4', duration: 0.3 },
      { note: 'C4', duration: 0.3 },
      { note: 'C5', duration: 0.6 },
      { note: 'A4', duration: 0.6 },
      { note: 'F4', duration: 0.6 },
      { note: 'E4', duration: 0.6 },
      { note: 'D4', duration: 1.2 },
    ]
  },
  summer: {
    name: '🌞 Summer',
    notes: [
      { note: 'E4', duration: 0.3 },
      { note: 'D4', duration: 0.3 },
      { note: 'E4', duration: 0.3 },
      { note: 'G4', duration: 0.6 },
      { note: 'A4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'F#4', duration: 0.3 },
      { note: 'E4', duration: 0.3 },
      { note: 'D4', duration: 0.3 },
      { note: 'E4', duration: 0.6 },
      { note: 'G4', duration: 0.3 },
      { note: 'A4', duration: 0.3 },
      { note: 'B4', duration: 0.3 },
      { note: 'C5', duration: 0.3 },
      { note: 'D5', duration: 0.3 },
      { note: 'E5', duration: 0.6 },
      { note: 'D5', duration: 0.3 },
      { note: 'C5', duration: 0.3 },
      { note: 'B4', duration: 0.3 },
      { note: 'A4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'F#4', duration: 0.6 },
      { note: 'E4', duration: 0.3 },
      { note: 'D4', duration: 0.3 },
      { note: 'E4', duration: 0.6 },
    ]
  },
  hedwig: {
    name: '🏴‍☠️ He\'s a Pirate',
    notes: [
      { note: 'D4', duration: 0.25 },
      { note: 'D4', duration: 0.25 },
      { note: 'D4', duration: 0.25 },
      { note: 'A4', duration: 0.25 },
      { note: 'B4', duration: 0.5 },
      { note: 'C5', duration: 0.25 },
      { note: 'B4', duration: 0.25 },
      { note: 'A4', duration: 0.5 },
      { note: 'G4', duration: 0.25 },
      { note: 'D4', duration: 0.25 },
      { note: 'D4', duration: 0.25 },
      { note: 'D4', duration: 0.25 },
      { note: 'A4', duration: 0.25 },
      { note: 'B4', duration: 0.5 },
      { note: 'C5', duration: 0.25 },
      { note: 'B4', duration: 0.25 },
      { note: 'A4', duration: 0.5 },
      { note: 'B4', duration: 0.25 },
      { note: 'C5', duration: 0.25 },
      { note: 'D5', duration: 0.5 },
      { note: 'B4', duration: 0.25 },
      { note: 'C5', duration: 0.25 },
      { note: 'D5', duration: 0.5 },
      { note: 'E5', duration: 0.25 },
      { note: 'F#5', duration: 0.25 },
      { note: 'G5', duration: 0.5 },
      { note: 'E5', duration: 0.25 },
      { note: 'D5', duration: 0.5 },
    ]
  },
  alice: {
    name: '🎹 致爱丽丝',
    notes: [
      { note: 'E4', duration: 0.2 },
      { note: 'D#4', duration: 0.2 },
      { note: 'E4', duration: 0.2 },
      { note: 'D#4', duration: 0.2 },
      { note: 'E4', duration: 0.2 },
      { note: 'B3', duration: 0.2 },
      { note: 'D4', duration: 0.2 },
      { note: 'C4', duration: 0.2 },
      { note: 'A3', duration: 0.4 },
      { note: 'C4', duration: 0.2 },
      { note: 'E4', duration: 0.2 },
      { note: 'A4', duration: 0.2 },
      { note: 'B4', duration: 0.2 },
      { note: 'E4', duration: 0.2 },
      { note: 'D#4', duration: 0.2 },
      { note: 'E4', duration: 0.4 },
      { note: 'C4', duration: 0.2 },
      { note: 'E4', duration: 0.2 },
      { note: 'A4', duration: 0.4 },
      { note: 'A4', duration: 0.2 },
      { note: 'B4', duration: 0.2 },
      { note: 'C5', duration: 0.4 },
    ]
  },
  reverie: {
    name: '🌊 River Flows in You',
    notes: [
      { note: 'E5', duration: 0.3 },
      { note: 'B4', duration: 0.3 },
      { note: 'C5', duration: 0.3 },
      { note: 'B4', duration: 0.3 },
      { note: 'A4', duration: 0.3 },
      { note: 'B4', duration: 0.6 },
      { note: 'A4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'F#4', duration: 0.6 },
      { note: 'E4', duration: 0.3 },
      { note: 'F#4', duration: 0.3 },
      { note: 'G4', duration: 0.3 },
      { note: 'A4', duration: 0.3 },
      { note: 'B4', duration: 0.6 },
      { note: 'C5', duration: 0.3 },
      { note: 'B4', duration: 0.3 },
      { note: 'A4', duration: 0.3 },
      { note: 'G4', duration: 0.6 },
      { note: 'A4', duration: 0.3 },
      { note: 'B4', duration: 0.3 },
      { note: 'C5', duration: 0.3 },
      { note: 'D5', duration: 0.3 },
      { note: 'E5', duration: 0.6 },
      { note: 'D5', duration: 0.6 },
    ]
  }
};

interface DemoSongsProps {
  onPlaySong: (notes: Array<{ note: string; duration: number }>) => void;
  isPlaying?: boolean;
}

export default function DemoSongs({ onPlaySong, isPlaying = false }: DemoSongsProps) {
  const [selectedSong, setSelectedSong] = useState<string | null>(null);

  const handlePlaySong = (songKey: string) => {
    setSelectedSong(songKey);
    const song = DEMO_SONGS[songKey];
    if (song) {
      onPlaySong(song.notes);
    }
  };

  return (
    <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg border-2 border-purple-300">
      <p className="font-bold text-purple-900 mb-4 text-lg">🎹 名曲演奏库</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Object.entries(DEMO_SONGS).map(([key, song]) => (
          <button
            key={key}
            onClick={() => handlePlaySong(key)}
            disabled={isPlaying && selectedSong !== key}
            className={`px-4 py-3 rounded-lg font-semibold transition-all transform ${
              selectedSong === key && isPlaying
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg'
                : isPlaying
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-purple-900 border-2 border-purple-400 hover:bg-purple-100 hover:scale-105 active:scale-95 shadow-md'
            }`}
          >
            {song.name}
          </button>
        ))}
      </div>
    </div>
  );
}
