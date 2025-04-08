// src/components/PlayerComponent.tsx
import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

interface PlayerProps {
  currentTrack: string | null;
  isGenerating: boolean;
  onNext: () => void;
  onPrev: () => void;
}

const PlayerComponent: React.FC<PlayerProps> = ({ currentTrack, isGenerating, onNext, onPrev }) => {
  const playerRef = useRef<Tone.Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (currentTrack) {
      playerRef.current?.dispose();

      playerRef.current = new Tone.Player(currentTrack, () => {
        playerRef.current?.toDestination();
        if (isPlaying) playerRef.current?.start();
      }).toDestination();
    }
  }, [currentTrack]);

  const togglePlay = async () => {
    if (!playerRef.current) return;
    await Tone.start(); // Unlock audio context

    if (isPlaying) {
      playerRef.current.stop();
    } else {
      playerRef.current.start();
    }

    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        <button onClick={onPrev} className="bg-gray-800 px-4 py-2 rounded">Prev</button>
        <button onClick={togglePlay} className="bg-indigo-600 px-6 py-2 rounded font-bold">
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button onClick={onNext} className="bg-gray-800 px-4 py-2 rounded">
          {isGenerating ? 'Generating...' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default PlayerComponent;