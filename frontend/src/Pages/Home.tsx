// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import PlayerComponent from "../Components/PlayerComponent";
import AIControlComponent from "../Components/AIControlComponent";

const defaultPrompt = "lofi slow bpm electro chill with organic samples";

const Home: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [nextTrack, setNextTrack] = useState<string | null>(null);
  const [prevTrack, setPrevTrack] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateTrack = async (customPrompt: string) => {
    try {
      setIsGenerating(true);
      const res = await axios.post("/api/generate", { prompt: customPrompt });
      setNextTrack(res.data.audioURL);
    } catch (error) {
      console.error("Error generating track:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (nextTrack) {
      setPrevTrack(currentTrack);
      setCurrentTrack(nextTrack);
      generateTrack(prompt); // Preload next
    }
  };

  const handlePrev = () => {
    if (prevTrack) {
      setNextTrack(currentTrack);
      setCurrentTrack(prevTrack);
    }
  };

  const handlePromptUpdate = (newPrompt: string) => {
    setPrompt(newPrompt);
    generateTrack(newPrompt);
  };

  // Initial load
  useEffect(() => {
    generateTrack(prompt);
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-900 via-gray-900 to-black text-white flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center">🎧 Study Beats Gen</h1>

      <AIControlComponent prompt={prompt} onPromptChange={handlePromptUpdate} />

      <PlayerComponent
        currentTrack={currentTrack}
        isGenerating={isGenerating}
        onNext={handleNext}
        onPrev={handlePrev}
      />
    </div>
  );
};

export default Home;
