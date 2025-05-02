// src/pages/Home.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import PlayerComponent from "../Components/PlayerComponent";
import AIControlComponent from "../Components/AIControlComponent";
import BasicPlayer from "../Components/PlayerComponent";

const defaultPrompt = "lofi slow bpm electro chill with organic samples";

const Home: React.FC = () => {
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [nextTrack, setNextTrack] = useState<string | null>(null);
  const [prevTrack, setPrevTrack] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // API
  const generateTrack = async (customPrompt: string) => {
    try {
      setIsGenerating(true);
      const res = await axios.post("http://localhost:5000/api/generate", {
        prompt: customPrompt || prompt,
      });
      if (currentTrack == null) {
        setCurrentTrack(res.data.audioURL);
        console.log(currentTrack);
      } else {
        setNextTrack(res.data.audioURL);
      }
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

  const handleTrackEnd = () => {
    handleNext();
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
      <h1 className="text-3xl font-bold text-center">
        🎧 Study Beats Generator
      </h1>

      <AIControlComponent prompt={prompt} onPromptChange={handlePromptUpdate} />

      {/* <PlayerComponent
        currentTrack={currentTrack}
        isGenerating={false}
        prevCount={false}
        nextReady={false}
        onNext={handleNext}
        onPrev={handlePrev}
        onEnd={handleTrackEnd}
      /> */}

      <BasicPlayer
        audioUrl={currentTrack}
        prevReady={prevTrack ? true : false}
        nextReady={nextTrack ? true : false}
        onNext={handleNext}
        onPrev={handlePrev}
        isGenerating={isGenerating}
      />
    </div>
  );
};

export default Home;
