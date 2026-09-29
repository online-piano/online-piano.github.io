"use client";
import { useCallback, useEffect, useRef, useState } from "react";

const SAMPLE_BASE = "https://tonejs.github.io/audio/salamander/";
const SAMPLE_NOTES = [
  "C2",
  "D#2",
  "F#2",
  "A2",
  "C3",
  "D#3",
  "F#3",
  "A3",
  "C4",
  "D#4",
  "F#4",
  "A4",
  "C5",
  "D#5",
  "F#5",
  "A5",
  "C6",
  "D#6",
  "F#6",
  "A6",
  "C7",
  "D#7",
  "F#7",
  "A7",
  "C8",
];
const midiName = (m: number) => {
  const names = [
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
  return names[m % 12] + (Math.floor(m / 12) - 1);
};
const midi = (n: string) => {
  const m = n.match(/^([A-G]#?)(-?\d+)$/)!;
  const map: any = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11,
  };
  return (Number(m[2]) + 1) * 12 + map[m[1]];
};
const sampleFile = (n: string) =>
  n.replace("D#", "Ds").replace("F#", "Fs") + ".mp3";

export type PlayedNote = {
  note: string;
  midi: number;
  time: number;
  duration: number;
};

export function usePiano() {
  const [activeNotes, setActiveNotes] = useState<number[]>([]);
  const [volume, setVolume] = useState(0.85);
  const [sustain, setSustain] = useState(false);
  const [recording, setRecording] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const samples = useRef(new Map<number, AudioBuffer>());
  const sources = useRef(new Map<number, Set<AudioBufferSourceNode>>());
  const activeRef = useRef(new Set<number>());
  const sustainedRef = useRef(new Set<number>());
  const recordedRef = useRef<PlayedNote[]>([]);
  const startedAt = useRef(0);

  const ensureAudio = useCallback(async () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      const compressor = ctx.createDynamicsCompressor();
      const master = ctx.createGain();
      master.gain.value = volume;
      compressor.connect(master).connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
      compressorRef.current = compressor;
    }
    if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    return ctxRef.current;
  }, [volume]);

  const loadSample = useCallback(
    async (m: number) => {
      const ctx = await ensureAudio();
      if (samples.current.has(m)) return samples.current.get(m)!;
      const nearest = SAMPLE_NOTES.map(midi).sort(
        (a, b) => Math.abs(a - m) - Math.abs(b - m),
      )[0];
      if (!samples.current.has(nearest)) {
        const res = await fetch(SAMPLE_BASE + sampleFile(midiName(nearest)));
        const buf = await res.arrayBuffer();
        samples.current.set(nearest, await ctx.decodeAudioData(buf));
      }
      return samples.current.get(nearest)!;
    },
    [ensureAudio],
  );

  const stopNote = useCallback(
    (m: number) => {
      const set = sources.current.get(m);
      if (set && !sustain) {
        set.forEach((source) => {
          try {
            source.stop();
          } catch {}
        });
        sources.current.delete(m);
        activeRef.current.delete(m);
      } else if (sustain) {
        sustainedRef.current.add(m);
      }
      setActiveNotes([...activeRef.current]);
    },
    [sustain],
  );

  const playNote = useCallback(
    async (note: string, record = true) => {
      const m = midi(note);
      const ctx = await ensureAudio();
      const buffer = await loadSample(m);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const nearest = SAMPLE_NOTES.map(midi).sort(
        (a, b) => Math.abs(a - m) - Math.abs(b - m),
      )[0];
      source.playbackRate.value = Math.pow(2, (m - nearest) / 12);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 0.7);
      source.connect(gain).connect(masterRef.current!);
      source.start();
      let sourceSet = sources.current.get(m);
      if (!sourceSet) {
        sourceSet = new Set<AudioBufferSourceNode>();
        sources.current.set(m, sourceSet);
      }
      sourceSet.add(source);
      source.onended = () => {
        sourceSet?.delete(source);
        if (sourceSet?.size === 0) sources.current.delete(m);
      };
      activeRef.current.add(m);
      sustainedRef.current.delete(m);
      setActiveNotes([...activeRef.current]);
      if (record && recording)
        recordedRef.current.push({
          note,
          midi: m,
          time: performance.now() - startedAt.current,
          duration: 400,
        });
    },
    [ensureAudio, loadSample, recording],
  );

  const playNoteInstance = useCallback(
    async (note: string) => {
      const m = midi(note);
      const ctx = await ensureAudio();
      const buffer = await loadSample(m);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const nearest = SAMPLE_NOTES.map(midi).sort(
        (a, b) => Math.abs(a - m) - Math.abs(b - m),
      )[0];
      source.playbackRate.value = Math.pow(2, (m - nearest) / 12);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.45, ctx.currentTime + 0.7);
      source.connect(gain).connect(masterRef.current!);
      source.start();
      let sourceSet = sources.current.get(m);
      if (!sourceSet) {
        sourceSet = new Set<AudioBufferSourceNode>();
        sources.current.set(m, sourceSet);
      }
      sourceSet.add(source);
      activeRef.current.add(m);
      setActiveNotes([...activeRef.current]);
      const stop = () => {
        try {
          source.stop();
        } catch {}
        sourceSet?.delete(source);
        if (sourceSet?.size === 0) sources.current.delete(m);
        // Only clear the MIDI highlight when no overlapping instance remains.
        if (!sources.current.get(m)?.size) {
          activeRef.current.delete(m);
          setActiveNotes([...activeRef.current]);
        }
      };
      source.onended = () => {
        sourceSet?.delete(source);
        if (sourceSet?.size === 0) {
          sources.current.delete(m);
          activeRef.current.delete(m);
          setActiveNotes([...activeRef.current]);
        }
      };
      return { midi: m, stop };
    },
    [ensureAudio, loadSample],
  );

  const releaseSustained = useCallback(() => {
    sustainedRef.current.forEach((m) => {
      const set = sources.current.get(m);
      set?.forEach((s) => {
        try {
          s.stop();
        } catch {}
      });
      sources.current.delete(m);
      activeRef.current.delete(m);
    });
    sustainedRef.current.clear();
    setActiveNotes([...activeRef.current]);
  }, []);

  useEffect(() => {
    if (masterRef.current) masterRef.current.gain.value = volume;
  }, [volume]);

  const startRecording = useCallback(async () => {
    await ensureAudio();
    recordedRef.current = [];
    startedAt.current = performance.now();
    setRecording(true);
  }, [ensureAudio]);
  const stopRecording = useCallback(() => setRecording(false), []);
  const playSongSequence = useCallback(
    async (
      seq: { note?: string; chord?: string[]; duration: number }[],
      onStep?: (note: string) => void,
    ) => {
      for (const item of seq) {
        if (item.note) {
          onStep?.(item.note);
          await playNote(item.note, false);
          await new Promise((r) => setTimeout(r, item.duration));
          stopNote(midi(item.note));
        } else if (item.chord) {
          item.chord.forEach((n) => playNote(n, false));
          await new Promise((r) => setTimeout(r, item.duration));
          item.chord.forEach((n) => stopNote(midi(n)));
        } else await new Promise((r) => setTimeout(r, item.duration));
      }
      onStep?.("");
    },
    [playNote, stopNote],
  );
  const clearRecording = useCallback(() => (recordedRef.current = []), []);
  const playRecording = useCallback(async () => {
    let previousTime = 0;
    for (const n of recordedRef.current) {
      await new Promise((r) =>
        setTimeout(r, Math.max(0, n.time - previousTime)),
      );
      previousTime = n.time;
      await playNote(n.note, false);
      await new Promise((r) => setTimeout(r, n.duration));
      stopNote(n.midi);
    }
  }, [playNote, stopNote]);

  return {
    activeNotes,
    volume,
    setVolume,
    sustain,
    toggleSustain: () => {
      setSustain((v) => {
        if (v) releaseSustained();
        return !v;
      });
    },
    playNote,
    playNoteInstance,
    stopNote,
    startRecording,
    stopRecording,
    recording,
    clearRecording,
    playRecording,
    playSongSequence,
    audioContext: ctxRef.current,
    recordedNotes: recordedRef.current,
  };
}
