'use client';

interface PedalPanelProps {
  sustainActive: boolean;
  softActive: boolean;
  onSustainClick: () => void;
  onSoftClick: () => void;
}

export default function PedalPanel({
  sustainActive,
  softActive,
  onSustainClick,
  onSoftClick
}: PedalPanelProps) {
  return (
    <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-6 mt-8 border-2 border-gray-600">
      <div className="text-center text-white text-xl font-bold mb-6 tracking-wide">
        🎹 脚踏板
      </div>

      <div className="flex gap-6 justify-center flex-wrap">
        {/* 柔音踏板 */}
        <button
          onClick={onSoftClick}
          className={`w-20 h-16 rounded-t-lg border-4 border-t-2 border-b-4 transition-all duration-75 flex flex-col items-center justify-center text-xs font-bold ${
            softActive
              ? 'bg-gradient-to-b from-blue-400 to-blue-600 text-white border-blue-800 transform translate-y-1 shadow-inner'
              : 'bg-gradient-to-b from-gray-400 to-gray-600 text-gray-800 border-gray-700 shadow-lg hover:-translate-y-1'
          }`}
        >
          ♪ 柔音
        </button>

        {/* 中踏板 */}
        <button
          className="w-20 h-16 rounded-t-lg border-4 border-gray-700 bg-gradient-to-b from-gray-400 to-gray-600 text-gray-800 transition-all duration-75 flex flex-col items-center justify-center text-xs font-bold shadow-lg hover:-translate-y-1"
        >
          ⫶ 中踏板
        </button>

        {/* 延音踏板（主要） */}
        <button
          onClick={onSustainClick}
          className={`w-20 h-16 rounded-t-lg border-4 border-t-2 border-b-4 transition-all duration-75 flex flex-col items-center justify-center text-xs font-bold ${
            sustainActive
              ? 'bg-gradient-to-b from-blue-400 to-blue-600 text-white border-blue-800 transform translate-y-1 shadow-inner'
              : 'bg-gradient-to-b from-gray-400 to-gray-600 text-gray-800 border-gray-700 shadow-lg hover:-translate-y-1'
          }`}
        >
          ⊡ 延音
        </button>
      </div>

      {/* 脚踏板支架 */}
      <div className="flex gap-6 justify-center mt-1">
        <div className="w-20 h-3 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-lg shadow-md border-2 border-gray-700" />
        <div className="w-20 h-3 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-lg shadow-md border-2 border-gray-700" />
        <div className="w-20 h-3 bg-gradient-to-b from-gray-600 to-gray-800 rounded-b-lg shadow-md border-2 border-gray-700" />
      </div>
    </div>
  );
}
