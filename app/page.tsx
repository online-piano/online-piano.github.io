'use client';

import { useState, useEffect, useRef } from 'react';
import { usePiano } from '@/hooks/usePiano';
import PianoKeyboard from '@/components/PianoKeyboard';
import PedalPanel from '@/components/PedalPanel';
import RecordingControls from '@/components/RecordingControls';
import DemoSongs from '@/components/DemoSongs';

const NOTES: Record<string, number> = {
  'C2': 65.41, 'C#2': 69.30, 'D2': 73.42, 'D#2': 77.78, 'E2': 82.41,
  'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00,
  'A#2': 116.54, 'B2': 123.47,
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81,
  'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
  'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
  'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
  'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25,
  'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00,
  'A#5': 932.33, 'B5': 987.77,
  'C6': 1046.50, 'C#6': 1108.73, 'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51,
  'F6': 1396.91, 'F#6': 1479.98, 'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00,
  'A#6': 1864.66, 'B6': 1975.53,
  'C7': 2093.00, 'C#7': 2217.46, 'D7': 2349.32, 'D#7': 2489.02, 'E7': 2637.02,
  'F7': 2793.83, 'F#7': 2959.96, 'G7': 3135.96, 'G#7': 3322.44, 'A7': 3520.00,
  'A#7': 3729.31, 'B7': 3951.07,
  'C8': 4186.01
};

const KEY_MAP: Record<string, string> = {
  'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4',
  'q': 'C5', 'w': 'D5', 'e': 'E5', 'r': 'F5', 't': 'G5', 'y': 'A5', 'u': 'B5',
  's': 'C#4', 'd': 'D#4', 'g': 'F#4', 'h': 'G#4', 'j': 'A#4',
  '1': 'C#5', '2': 'D#5', '5': 'F#5', '6': 'G#5', '7': 'A#5'
};

// 根据八度动态生成键盘映射
function buildKeyMap(octave: number): Record<string, string> {
  const o = octave;
  return {
    'z': `C${o}`, 'x': `D${o}`, 'c': `E${o}`, 'v': `F${o}`,
    'b': `G${o}`, 'n': `A${o}`, 'm': `B${o}`,
    ',': `C${o+1}`, '.': `D${o+1}`, '/': `E${o+1}`, 'r': `F${o+1}`,
    't': `G${o+1}`, 'y': `A${o+1}`, 'u': `B${o+1}`,
    'i': `C${o+2}`, 'o': `D${o+2}`, 'p': `E${o+2}`, '[': `F${o+2}`,
    ']': `G${o+2}`, ';': `A${o+2}`, '\\': `B${o+2}`,
    's': `C#${o}`, 'd': `D#${o}`, 'g': `F#${o}`, 'h': `G#${o}`, 'j': `A#${o}`,
    'l': `C#${o+1}`, '`': `D#${o+1}`, '6': `F#${o+1}`, '7': `G#${o+1}`, '8': `A#${o+1}`,
    '9': `C#${o+2}`, '0': `D#${o+2}`, '-': `F#${o+2}`, '=': `G#${o+2}`, '2': `A#${o+2}`,
  };
}

export default function PianoPage() {
  const piano = usePiano();
  const [volume, setVolume] = useState(30);
  const [currentOctave, setCurrentOctave] = useState(4);
  const [keyboardSize, setKeyboardSize] = useState<'compact' | 'full'>('full');
  const [sustainActive, setSustainActive] = useState(false);
  const [softActive, setSoftActive] = useState(false);
  const [centerPedalActive, setCenterPedalActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [canPlayback, setCanPlayback] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const stopPlaybackRef = useRef<(() => void) | null>(null);
  const [keyboardPressed, setKeyboardPressed] = useState<Set<string>>(new Set());
  const [playbackNotes, setPlaybackNotes] = useState<Set<string>>(new Set());
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const stopSongRef = useRef<(() => void) | null>(null);
  const allExternalNotes = new Set([...keyboardPressed, ...playbackNotes]);

  // 设置键盘快捷键（随八度动态变化）
  useEffect(() => {
    if (!piano.audioContext) return;
    const keyMap = buildKeyMap(currentOctave);

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        if (e.repeat) return; // 防止长按时重复触发
        const note = keyMap[key];
        const frequency = NOTES[note as keyof typeof NOTES];
        if (!frequency) return;
        piano.playNote(note, frequency);
        setKeyboardPressed(prev => new Set(prev).add(note));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (keyMap[key]) {
        const note = keyMap[key];
        piano.stopNote(note);
        setKeyboardPressed(prev => { const s = new Set(prev); s.delete(note); return s; });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [piano, currentOctave]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    piano.updateVolume(val);
  };

  const handleRecordClick = () => {
    if (!isRecording) {
      piano.startRecording();
      setIsRecording(true);
    } else {
      piano.stopRecording();
      setIsRecording(false);
      setCanPlayback(piano.recordedNotes.length > 0);
    }
  };

  const handleSustainClick = () => {
    const newState = piano.toggleSustainPedal();
    setSustainActive(newState);
  };

  const handleSoftClick = () => {
    const newState = piano.toggleSoftPedal();
    setSoftActive(newState);
  };

  const handleCenterPedalClick = () => {
    setCenterPedalActive(!centerPedalActive);
    // 中踏板功能可在future中扩展
  };

  const handlePlaySong = (notes: Array<{ note: string; duration: number }>) => {
    if (isSongPlaying) {
      stopSongRef.current?.();
      setIsSongPlaying(false);
      return;
    }
    
    setIsSongPlaying(true);
    const cancel = piano.playSongSequence(
      notes,
      (note) => setPlaybackNotes(prev => new Set(prev).add(note)),
      (note) => setPlaybackNotes(prev => { const s = new Set(prev); s.delete(note); return s; }),
      () => {
        setIsSongPlaying(false);
        setPlaybackNotes(new Set());
      }
    );
    stopSongRef.current = cancel;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12" style={{ maxWidth: '100%' }}>
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">🎹 在线钢琴</h1>
          <p className="text-gray-600 text-lg">用键盘或点击钢琴键来弹奏</p>
        </div>

        {/* 控制面板 */}
        <div className="flex flex-wrap justify-center gap-8 mb-8">
          {/* 音量控制 */}
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">音量:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              className="w-32 h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-gray-700 font-semibold min-w-12">{volume}%</span>
          </div>

          {/* 八度控制 */}
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">八度:</label>
            <button
              onClick={() => setCurrentOctave(Math.max(2, currentOctave - 1))}
              className="px-4 py-2 border-2 border-purple-500 text-purple-500 rounded-lg hover:bg-purple-500 hover:text-white transition"
            >
              -
            </button>
            <span className="text-gray-700 font-semibold min-w-8 text-center">{currentOctave}</span>
            <button
              onClick={() => setCurrentOctave(Math.min(6, currentOctave + 1))}
              className="px-4 py-2 border-2 border-purple-500 text-purple-500 rounded-lg hover:bg-purple-500 hover:text-white transition"
            >
              +
            </button>
          </div>

          {/* 键盘大小切换 */}
          <div className="flex items-center gap-3">
            <label className="font-semibold text-gray-700">键盘:</label>
            <button
              onClick={() => setKeyboardSize('compact')}
              className={`px-4 py-2 border-2 rounded-lg transition ${
                keyboardSize === 'compact'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
              }`}
            >
              21键
            </button>
            <button
              onClick={() => setKeyboardSize('full')}
              className={`px-4 py-2 border-2 rounded-lg transition ${
                keyboardSize === 'full'
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
              }`}
            >
              88键
            </button>
          </div>
        </div>

        {/* 录音控制按钮 */}
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
            const cancel = piano.playRecording(
              (note) => setPlaybackNotes(prev => new Set(prev).add(note)),
              (note) => setPlaybackNotes(prev => { const s = new Set(prev); s.delete(note); return s; }),
              () => { setIsPlaying(false); setPlaybackNotes(new Set()); }
            );
            stopPlaybackRef.current = cancel;
          }}
          onDownload={() => piano.downloadRecording()}
          onClear={() => { piano.clearRecording(); setCanPlayback(false); }}
        />

        {/* 钢琴键盘 */}
        <PianoKeyboard piano={piano} octave={currentOctave} notes={NOTES} externalPressedKeys={allExternalNotes} keyboardSize={keyboardSize} />

        {/* 脚踏板 */}
        <PedalPanel
          sustainActive={sustainActive}
          softActive={softActive}
          centerPedalActive={centerPedalActive}
          onSustainClick={handleSustainClick}
          onSoftClick={handleSoftClick}
          onCenterPedalClick={handleCenterPedalClick}
        />

        {/* 名曲演奏库 */}
        <DemoSongs onPlaySong={handlePlaySong} isPlaying={isSongPlaying} />

        {/* 键盘指南 */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
          <p className="font-bold text-blue-900 mb-2">键盘快捷键（钢琴键位布局）：</p>
          <p className="text-gray-700 font-mono text-sm">
            <strong>白键：</strong> Z X C V B N M | , . / R T Y U | I O P [ ] ; \
          </p>
          <p className="text-gray-700 font-mono text-sm mt-1">
            <strong>黑键：</strong> S D | G H J | L ` | 6 7 8 | 9 0 | - = 2
          </p>
        </div>

        {/* 页脚 */}
        <div className="mt-8 text-center text-gray-500 text-sm border-t pt-6">
          <p>使用 Web Audio API 实现的虚拟钢琴 | Next.js + React + TypeScript</p>
        </div>
      </div>
    </div>
  );
}
