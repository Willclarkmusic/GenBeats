const generateTrack = async ({ tempo, danceability, mood }: any) => {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tempo, danceability, mood }),
  });

  const data = await res.json();
  return data.url;
};

export default generateTrack;
