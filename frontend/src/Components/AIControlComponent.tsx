// src/components/AIControlComponent.tsx
import React, { useState } from "react";

interface AIControlProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
}

const moods = ["calm", "dreamy", "melancholy", "uplifting"];
const tags = ["ambient", "jazzy", "vinyl crackle", "glitchy", "rainy"];
const speeds = ["slow", "medium", "fast"];

const AIControlComponent: React.FC<AIControlProps> = ({
  prompt,
  onPromptChange,
}) => {
  const [selectedMood, setSelectedMood] = useState("calm");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSpeed, setSelectedSpeed] = useState("slow");

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleGeneratePrompt = () => {
    const generatedPrompt = `${selectedSpeed} bpm ${selectedMood} ${selectedTags.join(
      " "
    )} lofi slow bpm electro chill with organic samples`;
    onPromptChange(generatedPrompt);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium">Mood</label>
          <select
            className="bg-gray-800 px-2 py-1 mt-1 rounded w-full"
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
          >
            {moods.map((mood) => (
              <option key={mood}>{mood}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Speed</label>
          <select
            className="bg-gray-800 px-2 py-1 mt-1 rounded w-full"
            value={selectedSpeed}
            onChange={(e) => setSelectedSpeed(e.target.value)}
          >
            {speeds.map((speed) => (
              <option key={speed}>{speed}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Tags</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-2 py-1 rounded border ${
                  selectedTags.includes(tag) ? "bg-indigo-600" : "bg-gray-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGeneratePrompt}
          className="mt-4 bg-indigo-500 px-4 py-2 rounded"
        >
          Re-Generate
        </button>
      </div>
    </div>
  );
};

export default AIControlComponent;
