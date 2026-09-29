"use client";
import { useRef, useState } from "react";
import { usePiano } from "@/hooks/usePiano";
import DemoSongs, { type DemoSong } from "@/components/DemoSongs";

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
const midiOf = (note: string) => {
  const m = note.match(/^([A-G]#?)(\d+)$/);
  return m ? noteNames.indexOf(m[1]) + (Number(m[2]) + 1) * 12 : -1;
};

export default function SongsPage() {
  const p = usePiano();
  const [playingSongName, setPlayingSongName] = useState("");
  const stopRef = useRef(false);

  const playSong = async (song: DemoSong) => {
    stopRef.current = true;
    await Promise.resolve();
    stopRef.current = false;
    setPlayingSongName(song.name);
    const beatMs = 60000 / song.bpm;
    for (const item of song.events) {
      if (stopRef.current) break;
      const ns: string[] = item.notes;
      await Promise.all(ns.map((n: string) => p.playNote(n, false)));
      await new Promise((r) => setTimeout(r, item.duration * beatMs));
      ns.forEach((n: string) => p.stopNote(midiOf(n)));
    }
    setPlayingSongName("");
  };

  const stopSong = () => {
    stopRef.current = true;
    setPlayingSongName("");
  };

  return (
    <div className="container py-14">
      <h1 className="text-4xl font-black">Piano Songs</h1>
      <p className="mt-3 text-slate-600">
        Practice complete melody arrangements and play them with the same piano
        sound.
      </p>
      <div className="mt-8">
        <DemoSongs
          onPlaySong={(song) => void playSong(song)}
          onPauseSong={stopSong}
          onResumeSong={() => undefined}
          onStopSong={stopSong}
          playingSongName={playingSongName}
          isPaused={false}
        />
      </div>
    </div>
  );
}
