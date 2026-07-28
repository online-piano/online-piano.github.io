// 频率准确性检测脚本

const NOTES = {
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
  'A#6': 1864.66, 'B6': 1975.53
};

// 标准 12 平均律频率计算（基于 A4 = 440 Hz）
function calculateFrequency(noteNumber) {
  // C0 = 音符 12, A4 = 音符 57
  const A4_MIDI = 57;
  const A4_FREQ = 440;
  const cents = (noteNumber - A4_MIDI) * 100;
  return A4_FREQ * Math.pow(2, cents / 1200);
}

// 从音符名称获取 MIDI 号
const notesToMidi = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
};

console.log('🎹 钢琴频率准确性检测\n');
console.log('验证 NOTES 对象中的频率是否符合标准 12 平均律...\n');

let errors = [];
let maxError = 0;

Object.entries(NOTES).forEach(([note, freq]) => {
  // 解析音符名称
  const match = note.match(/([A-G]#?)(\d+)/);
  if (!match) return;
  
  const noteName = match[1];
  const octave = parseInt(match[2]);
  
  // 计算标准频率
  const midiNumber = octave * 12 + notesToMidi[noteName];
  const standardFreq = calculateFrequency(midiNumber);
  
  // 计算误差（以 cents 为单位，1 cent = 1/100 半音）
  const cents = 1200 * Math.log2(freq / standardFreq);
  const errorPercent = Math.abs(cents);
  
  if (Math.abs(cents) > 0.5) {
    errors.push({ note, freq, standardFreq, cents });
    maxError = Math.max(maxError, Math.abs(cents));
  }
  
  const status = Math.abs(cents) < 0.5 ? '✅' : '⚠️';
  console.log(`${status} ${note.padEnd(4)} | 定义: ${freq.toFixed(2)} Hz | 标准: ${standardFreq.toFixed(2)} Hz | 误差: ${cents.toFixed(2)} cents`);
});

console.log('\n' + '='.repeat(80));
console.log('\n检测结果：');

if (errors.length === 0) {
  console.log('✅ 所有频率都准确！偏差小于 0.5 cents（人耳无法察觉）');
} else {
  console.log(`⚠️ 发现 ${errors.length} 个误差超过 0.5 cents 的频率：`);
  errors.forEach(({ note, freq, standardFreq, cents }) => {
    console.log(`   ${note}: 误差 ${cents.toFixed(2)} cents (${((freq/standardFreq - 1)*100).toFixed(2)}%)`);
  });
  console.log(`\n最大误差: ${maxError.toFixed(2)} cents`);
}

console.log('\n\n🔍 检测音频合成中的非谐波性是否影响基频...\n');

// 检查 playNote 中的计算
const frequency = 440; // A4
const B = 0.00015 * Math.max(1, frequency / 440);

console.log(`基频 (n=1): ${frequency} Hz`);
console.log(`物理建模系数 B: ${B.toFixed(8)}`);

// 计算各次谐波的实际频率
const harmonics = [
  [1, '基频'],
  [2, '二倍音'],
  [3, '三倍音'],
  [4, '四倍音'],
];

console.log('\n非谐波校正后的实际频率：');
harmonics.forEach(([n, name]) => {
  const adjustedFreq = frequency * n * Math.sqrt(1 + B * n * n);
  const theoreticalFreq = frequency * n;
  const shift = adjustedFreq - theoreticalFreq;
  console.log(`${name.padEnd(8)} (n=${n}): ${adjustedFreq.toFixed(2)} Hz (理论: ${theoreticalFreq.toFixed(2)} Hz, 偏移: +${shift.toFixed(2)} Hz)`);
});

console.log('\n⚠️ 注意：当前实现中，基频（n=1）也被应用了非谐波校正！');
console.log('这可能导致音调偏高。基频应该始终 = 给定频率。\n');

// 计算建议的基频
const actualBaseFreq = frequency * 1 * Math.sqrt(1 + B * 1);
const frequencyShift = actualBaseFreq - frequency;
console.log(`🎯 建议修复：`);
console.log(`   当前基频: ${actualBaseFreq.toFixed(2)} Hz (偏高 ${frequencyShift.toFixed(2)} Hz 或 ${(frequencyShift/frequency*100).toFixed(3)}%)`);
console.log(`   应该输出: ${frequency.toFixed(2)} Hz`);
