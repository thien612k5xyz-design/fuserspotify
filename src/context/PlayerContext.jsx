import React, { createContext, useState, useRef, useEffect } from "react";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null); // Bài hát đang phát
  const [isPlaying, setIsPlaying] = useState(false); // Trạng thái phát

  // theAudioRef là một cái "mỏ neo" móc vào thẻ <audio> HTML
  const audioRef = useRef(new Audio());

  // Hàm được gọi khi user bấm vào 1 bài hát bất kỳ
  const playSong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  // Hàm bật/tắt nhạc
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Lắng nghe: Cứ mỗi khi currentSong thay đổi (bấm bài mới), thì nạp link MP3 và phát
  useEffect(() => {
    if (currentSong) {
      audioRef.current.src = currentSong.file_url; // Lấy link mp3 từ API
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [currentSong]);

  return (
    <PlayerContext.Provider
      value={{ currentSong, isPlaying, playSong, togglePlay, audioRef }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
