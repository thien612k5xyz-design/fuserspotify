import React, { createContext, useState, useRef, useEffect } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  // User bấm vào bài hát bất kỳ
  const playSong = (song) => {
    setCurrentSong(song);
  };

  // Bật/tắt nhạc
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play().catch((err) => console.error("Play error:", err));
    }
  };

  //đổi bài hát
  useEffect(() => {
    if (currentSong) {
      audioRef.current.pause();
      audioRef.current.src = currentSong.file_url || currentSong.audioUrl;
      audioRef.current
        .play()
        .catch((err) => console.error("Autoplay error:", err));
    }
  }, [currentSong]);

  // Đồng bộ trạng thái isPlaying với sự kiện audio
  useEffect(() => {
    const audio = audioRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  return (
    <PlayerContext.Provider
      value={{ currentSong, isPlaying, playSong, togglePlay, audioRef }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
