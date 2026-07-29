'use client';

interface PedalPanelProps {
  sustainActive: boolean;
  softActive: boolean;
  centerPedalActive: boolean;
  onSustainClick: () => void;
  onSoftClick: () => void;
  onCenterPedalClick: () => void;
}

export default function PedalPanel({
  sustainActive,
  softActive,
  centerPedalActive,
  onSustainClick,
  onSoftClick,
  onCenterPedalClick
}: PedalPanelProps) {
  const pedals = [
    {
      label: '柔音',
      icon: '♪',
      active: softActive,
      onClick: onSoftClick,
    },
    {
      label: '中踏板',
      icon: '⫶',
      active: centerPedalActive,
      onClick: onCenterPedalClick,
    },
    {
      label: '延音',
      icon: '⊡',
      active: sustainActive,
      onClick: onSustainClick,
    },
  ];

  return (
    <div className="mb-5 flex items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white/80 px-4 py-3 shadow-md backdrop-blur-sm">
      <div className="text-sm font-semibold tracking-wide text-gray-700">
        脚踏板
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {pedals.map((pedal) => (
          <button
            key={pedal.label}
            onClick={pedal.onClick}
            className={`min-w-20 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-100 ${
              pedal.active
                ? 'border-blue-700 bg-gradient-to-b from-blue-400 to-blue-600 text-white shadow-inner translate-y-px'
                : 'border-gray-300 bg-gradient-to-b from-white to-gray-100 text-gray-700 shadow-sm hover:-translate-y-0.5 hover:shadow'
            }`}
          >
            <span className="mr-1">{pedal.icon}</span>
            {pedal.label}
          </button>
        ))}
      </div>
    </div>
  );
}
