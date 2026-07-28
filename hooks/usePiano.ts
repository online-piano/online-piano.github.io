import { useRef, useCallback, useEffect } from 'react';

interface RecordedNote {
  note: string;
  frequency: number;
  startTime: number;
  duration: number;
}

interface NoteData {
  oscillators: Array<{ osc: OscillatorNode; gain: GainNode }>;
  masterGain: GainNode;
  keyElement: HTMLElement | null;
  startTime: number;
  recordIndex: number;
}

const NOTES = {
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
} as const;

const KEY_MAP: Record<string, string> = {
  'z': 'C4', 'x': 'D4', 'c': 'E4', 'v': 'F4', 'b': 'G4', 'n': 'A4', 'm': 'B4',
  ',': 'C5', '.': 'D5', '/': 'E5', '1': 'F5', '2': 'G5', '3': 'A5', '4': 'B5',
  's': 'C#4', 'd': 'D#4', 'g': 'F#4', 'h': 'G#4', 'j': 'A#4',
  'l': 'C#5', 'p': 'D#5', '5': 'F#5', '6': 'G#5', '7': 'A#5'
};

export function usePiano() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const activeOscillatorsRef = useRef<Map<string, NoteData>>(new Map());
  
  const volumeRef = useRef(30);
  const isRecordingRef = useRef(false);
  const recordedNotesRef = useRef<RecordedNote[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  
  const sustainPedalRef = useRef(true);
  const softPedalRef = useRef(false);
  const centerPedalRef = useRef(false);
  const releasedNotesInSustainRef = useRef<any[]>([]);
  
  // 最多同时发音数，防止卡顿
  const MAX_SIMULTANEOUS_NOTES = 12;

  // 初始化 AudioContext
  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = volumeRef.current / 100;
    
    audioContextRef.current = audioContext;
    masterGainRef.current = masterGain;
  }, []);

  const performStopNote = (noteName: string, keyElement?: HTMLElement) => {
    const audioContext = audioContextRef.current;
    const noteData = activeOscillatorsRef.current.get(noteName);
    
    if (!noteData || !audioContext) return;

    const { oscillators, masterGain: noteGain, keyElement: elem, recordIndex } = noteData;
    
    if (elem) {
      elem.classList.remove('active');
    }

    const currentTime = audioContext.currentTime;

    const stopOscillators = (decaySeconds: number) => {
      const stopAt = currentTime + decaySeconds;
      oscillators.forEach(({ osc, gain }) => {
        // 先取消所有已排队的自动化事件，再重新设定释音曲线
        try { gain.gain.cancelScheduledValues(currentTime); } catch {}
        const cur = Math.max(gain.gain.value, 0.0001);
        gain.gain.setValueAtTime(cur, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, stopAt);
        try { osc.stop(stopAt + 0.01); } catch {}
      });
      // 振荡器停止后断开 gainNode，清理音频图
      setTimeout(() => {
        try { noteGain.disconnect(); } catch {}
      }, (decaySeconds + 0.05) * 1000);
    };

    if (sustainPedalRef.current) {
      stopOscillators(3.0);
      setTimeout(() => {
        activeOscillatorsRef.current.delete(noteName);
        releasedNotesInSustainRef.current = releasedNotesInSustainRef.current
          .filter(n => n.noteName !== noteName);
      }, 3200);
      activeOscillatorsRef.current.delete(noteName);
      return;
    }

    stopOscillators(1.5);
    setTimeout(() => {
      activeOscillatorsRef.current.delete(noteName);
    }, 1600);

    if (isRecordingRef.current && recordIndex >= 0 && recordedNotesRef.current[recordIndex]) {
      recordedNotesRef.current[recordIndex].duration =
        audioContext.currentTime - recordStartTimeRef.current - recordedNotesRef.current[recordIndex].startTime;
    }
  };

  const playNote = useCallback((noteName: string, frequency: number, keyElement?: HTMLElement) => {
    const audioContext = audioContextRef.current;
    const masterGain = masterGainRef.current;
    
    if (!audioContext || !masterGain) return;

    // 检查是否超过最大同时音符数，如果超过则停止最旧的音符
    if (activeOscillatorsRef.current.size >= MAX_SIMULTANEOUS_NOTES) {
      let oldestNoteName = '';
      let oldestTime = Infinity;
      activeOscillatorsRef.current.forEach((noteData, key) => {
        if (noteData.startTime < oldestTime) {
          oldestTime = noteData.startTime;
          oldestNoteName = key;
        }
      });
      if (oldestNoteName) {
        performStopNote(oldestNoteName);
      }
    }

    if (activeOscillatorsRef.current.has(noteName)) {
      performStopNote(noteName, keyElement);
    }

    if (keyElement) {
      keyElement.classList.add('active');
    }

    const gameGain = audioContext.createGain();
    gameGain.connect(masterGain);
    
    const startTime = audioContext.currentTime;
    const oscillators: Array<{ osc: OscillatorNode; gain: GainNode }> = [];

    let recordIndex = -1;
    if (isRecordingRef.current) {
      recordIndex = recordedNotesRef.current.length;
      recordedNotesRef.current.push({
        note: noteName,
        frequency: frequency,
        startTime: audioContext.currentTime - recordStartTimeRef.current,
        duration: 0
      });
    }

    // ── 钢琴物理建模合成（优化版本）──────────────────────────────────────────
    // 钢琴弦的非谐波性系数（模拟弦的刚度，越高音越大）
    const B = 0.00015 * Math.max(1, frequency / 440);
    // 柔音踏板降低亮度和音量
    const softFactor = softPedalRef.current ? 0.65 : 1.0;

    // 简化谐波配置：只保留4个主要谐波（从原来的8个）
    // [谐波次数, 峰值振幅, 衰减时间(秒)]
    const harmonicConfig: [number, number, number][] = [
      [1,   0.60 * softFactor, 6.0],
      [2,   0.28 * softFactor, 3.5],
      [3,   0.16 * softFactor, 2.0],
      [4,   0.09 * softFactor, 1.3],
    ];

    harmonicConfig.forEach(([n, amp, decayTime]) => {
      // 非谐波频率：f_n = n * f * sqrt(1 + B*n²)，但基频（n=1）不应用校正
      let freqN: number;
      if (n === 1) {
        // 基频保持精确值，不应用非谐波校正
        freqN = frequency;
      } else {
        // 只对谐波（n≥2）应用非谐波校正，模拟弦的刚度导致高次谐波略偏高
        freqN = frequency * n * Math.sqrt(1 + B * n * n);
      }
      const osc = audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freqN;

      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(amp, startTime + 0.005); // 5ms攻击（真实击弦速度）
      gain.gain.exponentialRampToValueAtTime(amp * 0.6, startTime + 0.08); // 初始快速衰减
      gain.gain.exponentialRampToValueAtTime(0.00001, startTime + decayTime);

      osc.connect(gain);
      gain.connect(gameGain);
      osc.start(startTime);
      oscillators.push({ osc, gain });
    });

    // 两根略微失谐的"弦"（保留）
    const detuneRatios = [1 + 0.0012, 1 - 0.0009];
    detuneRatios.forEach(ratio => {
      const osc = audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency * ratio;

      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.22 * softFactor, startTime + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.00001, startTime + 5.5);

      osc.connect(gain);
      gain.connect(gameGain);
      osc.start(startTime);
      oscillators.push({ osc, gain });
    });

    // 击弦噪声（简化：减小持续时间）
    const clickDuration = 0.012; // 从0.018减少到0.012
    const clickBufferSize = Math.ceil(audioContext.sampleRate * clickDuration);
    const clickBuffer = audioContext.createBuffer(1, clickBufferSize, audioContext.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickBufferSize; i++) {
      clickData[i] = Math.random() * 2 - 1;
    }
    const clickSource = audioContext.createBufferSource();
    clickSource.buffer = clickBuffer;

    const clickFilter = audioContext.createBiquadFilter();
    clickFilter.type = 'bandpass';
    clickFilter.frequency.value = frequency * 2.5;
    clickFilter.Q.value = 1.2;

    const clickGain = audioContext.createGain();
    clickGain.gain.setValueAtTime(0.07 * softFactor, startTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + clickDuration);

    clickSource.connect(clickFilter);
    clickFilter.connect(clickGain);
    clickGain.connect(gameGain);
    clickSource.start(startTime);
    clickSource.stop(startTime + clickDuration);

    activeOscillatorsRef.current.set(noteName, {
      oscillators,
      masterGain: gameGain,
      keyElement: keyElement || null,
      startTime,
      recordIndex
    });
  }, []);

  const stopNote = useCallback((noteName: string, keyElement?: HTMLElement) => {
    performStopNote(noteName, keyElement);
  }, []);

  const releaseSustainedNotes = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    const currentTime = audioContext.currentTime;
    const releaseTime = 1.0;
    const stopTime = currentTime + releaseTime;

    releasedNotesInSustainRef.current.forEach(({ noteName, oscillators, masterGain: noteGain, recordIndex }) => {
      oscillators.forEach(({ osc, gain }: any) => {
        try { gain.gain.cancelScheduledValues(currentTime); } catch {}
        const cur = Math.max(gain.gain.value, 0.0001);
        gain.gain.setValueAtTime(cur, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, stopTime);
        try { osc.stop(stopTime + 0.01); } catch {}
      });
      setTimeout(() => {
        try { noteGain.disconnect(); } catch {}
        activeOscillatorsRef.current.delete(noteName);
      }, (releaseTime + 0.05) * 1000);
    });

    releasedNotesInSustainRef.current = [];
  }, []);

  const updateVolume = useCallback((volume: number) => {
    volumeRef.current = volume;
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = volume / 100;
    }
  }, []);

  const startRecording = useCallback(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    isRecordingRef.current = true;
    recordedNotesRef.current = [];
    recordStartTimeRef.current = audioContext.currentTime;
  }, []);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
  }, []);

  const clearRecording = useCallback(() => {
    recordedNotesRef.current = [];
    isRecordingRef.current = false;
  }, []);

  const playRecording = useCallback((
    onNoteOn?: (note: string) => void,
    onNoteOff?: (note: string) => void,
    onFinish?: () => void
  ): (() => void) => {
    if (recordedNotesRef.current.length === 0) return () => {};
    const timers: ReturnType<typeof setTimeout>[] = [];
    const notes = recordedNotesRef.current;
    const totalDuration = Math.max(...notes.map(n => n.startTime + n.duration)) + 0.2;

    notes.forEach(({ note, frequency, startTime, duration }) => {
      timers.push(setTimeout(() => {
        playNote(note, frequency);
        onNoteOn?.(note);
      }, startTime * 1000));
      timers.push(setTimeout(() => {
        performStopNote(note);
        onNoteOff?.(note);
      }, (startTime + Math.max(duration, 0.1)) * 1000));
    });

    // 回放结束回调
    const finishTimer = setTimeout(() => onFinish?.(), totalDuration * 1000);
    timers.push(finishTimer);

    // 返回取消函数
    return () => {
      timers.forEach(clearTimeout);
      // 停止所有正在播放的音符
      notes.forEach(({ note }) => {
        try { performStopNote(note); } catch {}
      });
      onFinish?.();
    };
  }, [playNote]);

  const downloadRecording = useCallback(async () => {
    const audioContext = audioContextRef.current;
    const notes = recordedNotesRef.current;
    if (!audioContext || notes.length === 0) return;

    const sampleRate = audioContext.sampleRate;
    const totalDuration = Math.max(...notes.map(n => n.startTime + n.duration + 3)) + 1;
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(totalDuration * sampleRate), sampleRate);

    const offlineMaster = offlineCtx.createGain();
    offlineMaster.gain.value = volumeRef.current / 100;
    offlineMaster.connect(offlineCtx.destination);

    notes.forEach(({ frequency, startTime, duration }) => {
      const B = 0.00015 * Math.max(1, frequency / 440);
      const noteGain = offlineCtx.createGain();
      noteGain.connect(offlineMaster);
      const releaseAt = startTime + Math.max(duration, 0.05);

      const harmonicConfig: [number, number, number][] = [
        [1, 0.60, 6.0], [2, 0.28, 3.5], [3, 0.16, 2.0],
        [4, 0.09, 1.3], [5, 0.05, 0.9], [6, 0.03, 0.65],
      ];
      harmonicConfig.forEach(([n, amp, decayTime]) => {
        const freqN = frequency * n * Math.sqrt(1 + B * n * n);
        const osc = offlineCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freqN;
        const gain = offlineCtx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(amp, startTime + 0.005);
        gain.gain.exponentialRampToValueAtTime(amp * 0.6, startTime + 0.08);
        gain.gain.exponentialRampToValueAtTime(Math.min(amp * 0.4, gain.gain.value), Math.min(releaseAt, startTime + decayTime * 0.8));
        gain.gain.exponentialRampToValueAtTime(0.001, releaseAt + 1.5);
        osc.connect(gain);
        gain.connect(noteGain);
        osc.start(startTime);
        osc.stop(Math.min(releaseAt + 2, totalDuration));
      });

      [1.0012, 0.9991].forEach(ratio => {
        const osc = offlineCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = frequency * ratio;
        const gain = offlineCtx.createGain();
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.22, startTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.001, releaseAt + 1.8);
        osc.connect(gain);
        gain.connect(noteGain);
        osc.start(startTime);
        osc.stop(Math.min(releaseAt + 2, totalDuration));
      });
    });

    const renderedBuffer = await offlineCtx.startRendering();

    // 编码为 WAV 文件
    const numCh = renderedBuffer.numberOfChannels;
    const len = renderedBuffer.length * numCh * 2;
    const ab = new ArrayBuffer(44 + len);
    const view = new DataView(ab);
    const ws = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); view.setUint32(4, 36 + len, true);
    ws(8, 'WAVE'); ws(12, 'fmt '); view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); view.setUint16(22, numCh, true);
    view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * numCh * 2, true);
    view.setUint16(32, numCh * 2, true); view.setUint16(34, 16, true);
    ws(36, 'data'); view.setUint32(40, len, true);
    let offset = 44;
    for (let i = 0; i < renderedBuffer.length; i++) {
      for (let ch = 0; ch < numCh; ch++) {
        const s = Math.max(-1, Math.min(1, renderedBuffer.getChannelData(ch)[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
      }
    }

    const blob = new Blob([ab], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    // 生成带时间戳的文件名
    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    a.href = url;
    a.download = `piano-recording-${timestamp}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  }, [playNote]);

  const toggleSustainPedal = useCallback(() => {
    sustainPedalRef.current = !sustainPedalRef.current;
    if (!sustainPedalRef.current) {
      releaseSustainedNotes();
    }
    return sustainPedalRef.current;
  }, [releaseSustainedNotes]);

  const toggleSoftPedal = useCallback(() => {
    softPedalRef.current = !softPedalRef.current;
    return softPedalRef.current;
  }, []);

  // 播放一个音符序列（用于名曲演奏）
  const playSongSequence = useCallback((
    notes: Array<{ note: string; frequency?: number; duration: number }>,
    onNoteOn?: (note: string) => void,
    onNoteOff?: (note: string) => void,
    onFinish?: () => void
  ) => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return () => {};

    let isPlaying = true;
    let currentTime = 0;
    const timerId: any[] = [];

    const playNextNote = (index: number) => {
      if (index >= notes.length || !isPlaying) {
        if (index >= notes.length && onFinish) {
          onFinish();
        }
        return;
      }

      const { note, frequency: freq, duration } = notes[index];
      
      // 从NOTES对象中查找频率
      let frequency = freq || NOTES[note as keyof typeof NOTES];
      if (!frequency) {
        // 如果音符不在标准列表中，跳过
        playNextNote(index + 1);
        return;
      }

      // 触发按键按下回调
      if (onNoteOn) onNoteOn(note);

      // 播放当前音符
      playNote(note, frequency);

      // 设置在duration时间后停止该音符
      const stopTimer = setTimeout(() => {
        stopNote(note);
        // 立即触发按键释放回调（实时反馈）
        if (onNoteOff) onNoteOff(note);
        // 小延迟后播放下一个音符（给UI回弹动画时间）
        setTimeout(() => {
          playNextNote(index + 1);
        }, 10);
      }, duration * 1000);

      timerId.push(stopTimer);
    };

    // 开始播放
    playNextNote(0);

    // 返回取消函数
    return () => {
      isPlaying = false;
      timerId.forEach(id => clearTimeout(id));
      notes.forEach(({ note }) => {
        stopNote(note);
        if (onNoteOff) onNoteOff(note);
      });
      if (onFinish) onFinish();
    };
  }, [playNote, stopNote]);

  return {
    audioContext: audioContextRef.current,
    playNote,
    stopNote,
    updateVolume,
    startRecording,
    stopRecording,
    clearRecording,
    playRecording,
    downloadRecording,
    playSongSequence,
    toggleSustainPedal,
    toggleSoftPedal,
    recordedNotes: recordedNotesRef.current,
    isRecording: isRecordingRef.current,
    volume: volumeRef.current,
  };
}
