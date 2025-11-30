// Audio visualizer component
'use client';

interface AudioVisualizerProps {
  audioData?: number[];
  isActive: boolean;
}

export default function AudioVisualizer({ audioData, isActive }: AudioVisualizerProps) {
  return (
    <div className="audio-visualizer">
      {isActive && audioData?.map((value, index) => (
        <div
          key={index}
          className="bar"
          style={{ height: `${value}%` }}
        />
      ))}
    </div>
  );
}
