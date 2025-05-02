import React, { useState, useRef, useEffect } from "react";
import * as Tone from "tone";

interface BasicPlayerProps {
  audioUrl: string | null;
  onNext: () => void;
  onPrev: () => void;
  nextReady: boolean;
  prevReady: boolean;
  isGenerating: boolean;
}

const BasicPlayer: React.FC<BasicPlayerProps> = ({
  audioUrl,
  onNext,
  onPrev,
  nextReady,
  prevReady,
  isGenerating,
}) => {
  const playerRef = useRef<Tone.Player | null>(null);
  const volumeRef = useRef<Tone.Volume | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolume] = useState(90); // 0 to 100

  useEffect(() => {
    // Reset player when track changes
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current.dispose();
      playerRef.current = null;
    }
    if (volumeRef.current) {
      volumeRef.current.dispose();
      volumeRef.current = null;
    }
    setIsPlaying(false);
    setIsLoaded(false);
  }, [audioUrl]);

  const handlePlay = async () => {
    console.log(audioUrl);
    await Tone.start(); // ✅ required for audio context unlock

    if (!playerRef.current) {
      const vol = new Tone.Volume(Tone.gainToDb(volume / 100)).toDestination();
      volumeRef.current = vol;

      const player = new Tone.Player(audioUrl || "", () => {
        setIsLoaded(true);
        player.toDestination();
        playerRef.current = player;
        player.start();
        setIsPlaying(true);
      }).connect(vol);
    } else {
      if (isPlaying) {
        playerRef.current.stop();
        setIsPlaying(false);
      } else {
        playerRef.current.start();
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    if (volumeRef.current) {
      volumeRef.current.volume.value = Tone.gainToDb(newVolume / 100);
    }
  };

  const getTitleFromUrl = (url: string | null) => {
    const parts = url?.split("/") || "";
    return parts[parts.length - 1];
  };

  return (
    <div
      style={{
        textAlign: "center",
        fontFamily: "sans-serif",
        marginTop: "2rem",
      }}
    >
      <h3>{getTitleFromUrl(audioUrl)}</h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <button onClick={onPrev} disabled={!prevReady}>
          ⏮️
        </button>
        <button onClick={handlePlay}>
          {isPlaying ? "⏸️" : isLoaded ? "▶️" : "🔄"}
        </button>
        <button onClick={onNext} disabled={!nextReady}>
          ⏭️
        </button>
      </div>

      <div>
        <label>
          Volume: {volume}
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            style={{ marginLeft: "0.5rem" }}
          />
        </label>
      </div>
      <h1>{isGenerating ? "1" : "0"}</h1>
    </div>
  );
};

export default BasicPlayer;
