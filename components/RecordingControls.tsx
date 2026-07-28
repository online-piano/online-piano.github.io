'use client';

interface RecordingControlsProps {
  isRecording: boolean;
  canPlayback: boolean;
  isPlaying: boolean;
  onRecord: () => void;
  onPlayback: () => void;
  onDownload: () => void;
  onClear: () => void;
}

export default function RecordingControls({
  isRecording,
  canPlayback,
  isPlaying,
  onRecord,
  onPlayback,
  onDownload,
  onClear,
}: RecordingControlsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      <button
        onClick={onRecord}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg'
        }`}
      >
        {isRecording ? 'Stop' : 'Record'}
      </button>
      <button
        onClick={canPlayback ? onPlayback : undefined}
        disabled={!canPlayback}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          canPlayback
            ? isPlaying
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg cursor-pointer'
              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg cursor-pointer'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
        }`}
      >
        {isPlaying ? '⏹ Stop' : '▶ Play'}
      </button>
      <button
        onClick={canPlayback ? onDownload : undefined}
        disabled={!canPlayback}
        className={`px-6 py-3 rounded-lg font-semibold transition-all ${
          canPlayback
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg cursor-pointer'
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
        }`}
      >
        Download
      </button>
      <button
        onClick={onClear}
        className="px-6 py-3 rounded-lg font-semibold bg-gray-300 hover:bg-gray-400 text-gray-800 transition-all shadow-lg"
      >
        Clear
      </button>
    </div>
  );
}