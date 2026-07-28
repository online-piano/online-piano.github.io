'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

interface PianoKeyboardProps {
  piano: any;
  octave: number;
  notes: Record<string, number>;
  externalPressedKeys?: Set<string>;
  keyboardSize?: 'compact' | 'full';
}

export default function PianoKeyboard({ piano, octave, notes, externalPressedKeys = new Set(), keyboardSize = 'full' }: PianoKeyboardProps) {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const allPressedKeys = new Set([...pressedKeys, ...externalPressedKeys]);

  const octaveWhiteShortcuts: Record<number, string[]> = {
    [octave]:     ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    [octave + 1]: [',', '.', '/', 'R', 'T', 'Y', 'U'],
    [octave + 2]: ['I', 'O', 'P', '[', ']', ';', '\\'],
  };
  const octaveBlackShortcuts: Record<number, string[]> = {
    [octave]:     ['S', 'D', '', 'G', 'H', 'J', ''],
    [octave + 1]: ['L', '`', '', '6', '7', '8', ''],
    [octave + 2]: ['9', '0', '', '-', '=', '2', ''],
  };

  const noteNames = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const blackKeyAfterWhiteIndex = [0, 1, 3, 4, 5];

  const whiteKeyWidth = 46;
  const whiteKeyHeight = 180;
  const blackKeyWidth = 28;
  const blackKeyHeight = 115;
  const containerPadding = 16;
  
  // 根据 keyboardSize 决定显示的八度数量和起始八度
  const octavesCount = keyboardSize === 'compact' ? 3 : 5;
  const startOctave = keyboardSize === 'compact' ? octave : 2;  // 88键从C2开始
  const octaves = Array.from({ length: octavesCount }, (_, i) => startOctave + i);
  const totalWhiteKeys = octaves.length * noteNames.length;

  const pressKey = useCallback((noteName: string, freq: number) => {
    setPressedKeys(prev => new Set(prev).add(noteName));
    piano.playNote(noteName, freq);
  }, [piano]);

  const releaseKey = useCallback((noteName: string) => {
    setPressedKeys(prev => {
      const next = new Set(prev);
      next.delete(noteName);
      return next;
    });
    piano.stopNote(noteName);
  }, [piano]);

  const handleMouseDown = (noteName: string, freq: number) => pressKey(noteName, freq);
  const handleMouseUp = (noteName: string) => releaseKey(noteName);

  const handleTouchStart = (noteName: string, freq: number, e: React.TouchEvent) => {
    pressKey(noteName, freq);
  };
  const handleTouchEnd = (noteName: string, e: React.TouchEvent) => {
    releaseKey(noteName);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: keyboardSize === 'compact' ? 'center' : 'flex-start',
      marginBottom: '30px',
      overflowX: 'auto',
      paddingTop: '20px',
      paddingBottom: '20px',
      width: '100%',
    }}>
      <div style={{
        position: 'relative',
        width: totalWhiteKeys * whiteKeyWidth + containerPadding * 2,
        height: whiteKeyHeight + containerPadding * 2,
        background: '#2a2a2a',
        padding: `${containerPadding}px`,
        marginLeft: '10px',
        marginRight: '10px',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
        flexShrink: 0,
        touchAction: 'none',
      }}>
        <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
          {octaves.map((oct) =>
            noteNames.map((noteName, noteIdx) => {
              const fullNoteName = `${noteName}${oct}`;
              const freq = notes[fullNoteName];
              const shortcut = octaveWhiteShortcuts[oct]?.[noteIdx] ?? '';
              const isFirstOfOctave = noteIdx === 0;
              const isPressed = allPressedKeys.has(fullNoteName);

              return (
                <button
                  key={`w-${fullNoteName}`}
                  onMouseDown={() => handleMouseDown(fullNoteName, freq)}
                  onMouseUp={() => handleMouseUp(fullNoteName)}
                  onMouseLeave={() => handleMouseUp(fullNoteName)}
                  onTouchStart={(e) => handleTouchStart(fullNoteName, freq, e)}
                  onTouchEnd={(e) => handleTouchEnd(fullNoteName, e)}
                  onTouchCancel={(e) => handleTouchEnd(fullNoteName, e)}
                  style={{
                    width: whiteKeyWidth,
                    height: whiteKeyHeight,
                    background: isPressed
                      ? 'linear-gradient(to bottom, #c8d8ff 0%, #a0b8f0 100%)'
                      : 'linear-gradient(to bottom, #ffffff 0%, #f0f0f0 100%)',
                    border: `1px solid ${isFirstOfOctave ? '#888' : '#bbb'}`,
                    borderLeft: isFirstOfOctave ? '2px solid #666' : '1px solid #bbb',
                    borderRadius: '0 0 6px 6px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingBottom: '6px',
                    flex: `0 0 ${whiteKeyWidth}px`,
                    boxShadow: isPressed
                      ? 'inset 0 3px 8px rgba(0,0,100,0.25)'
                      : 'inset 0 -3px 5px rgba(0,0,0,0.08)',
                    transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
                    transition: 'background 0.05s, transform 0.05s, box-shadow 0.05s',
                  }}
                >
                  {/* 音名：C键显示完整名称（如 C4），其他区只显字母 */}
                  <div style={{ color: isPressed ? '#3050a0' : '#555', fontSize: noteName === 'C' ? '12px' : '11px', fontWeight: 'bold', marginBottom: shortcut ? '2px' : '0' }}>
                    {noteName === 'C' ? `C${oct}` : noteName}
                  </div>
                  {shortcut && (
                    <div style={{ color: isPressed ? '#6070c0' : '#bbb', fontSize: '10px' }}>
                      {shortcut}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {octaves.map((oct, octIdx) =>
          blackKeyAfterWhiteIndex.map((whiteIdx) => {
            const whiteNote = noteNames[whiteIdx];
            const sharpNames: Record<string, string> = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };
            const sharpName = sharpNames[whiteNote];
            const fullNoteName = `${sharpName}${oct}`;
            const freq = notes[fullNoteName];
            const globalWhiteIdx = octIdx * noteNames.length + whiteIdx;
            const leftPosition = containerPadding + (globalWhiteIdx + 1) * whiteKeyWidth - blackKeyWidth / 2;
            const shortcut = octaveBlackShortcuts[oct]?.[whiteIdx] ?? '';
            const isPressed = allPressedKeys.has(fullNoteName);

            return (
              <div
                key={`b-${fullNoteName}`}
                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(fullNoteName, freq); }}
                onMouseUp={(e) => { e.stopPropagation(); handleMouseUp(fullNoteName); }}
                onMouseLeave={() => handleMouseUp(fullNoteName)}
                onTouchStart={(e) => { e.stopPropagation(); handleTouchStart(fullNoteName, freq, e); }}
                onTouchEnd={(e) => { e.stopPropagation(); handleTouchEnd(fullNoteName, e); }}
                onTouchCancel={(e) => { e.stopPropagation(); handleTouchEnd(fullNoteName, e); }}
                style={{
                  position: 'absolute',
                  top: containerPadding,
                  left: leftPosition,
                  width: blackKeyWidth,
                  height: blackKeyHeight,
                  background: isPressed
                    ? 'linear-gradient(to bottom, #555 0%, #222 100%)'
                    : 'linear-gradient(to bottom, #222 0%, #000 100%)',
                  border: '1px solid #000',
                  borderRadius: '0 0 5px 5px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  paddingBottom: '6px',
                  zIndex: 10,
                  boxShadow: isPressed
                    ? 'inset 0 3px 6px rgba(0,0,0,0.8)'
                    : '2px 4px 8px rgba(0,0,0,0.6)',
                  transform: isPressed ? 'translateY(2px)' : 'translateY(0)',
                  transition: 'background 0.05s, transform 0.05s, box-shadow 0.05s',
                }}
              >
                  {/* 黑键显示升号名称 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1px' }}>
                    <div style={{ color: isPressed ? '#ddd' : '#999', fontSize: '9px', fontWeight: 'bold', lineHeight: 1 }}>
                      {sharpName}
                    </div>
                    {shortcut && (
                      <div style={{ color: isPressed ? '#aaa' : '#666', fontSize: '9px', lineHeight: 1 }}>
                        {shortcut}
                      </div>
                    )}
                  </div>
                </div>
            );
          })
        )}
      </div>
    </div>
  );
}