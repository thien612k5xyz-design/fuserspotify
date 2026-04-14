import React, { createContext, useState, useRef, useEffect } from "react";
import { songAPI, BASE_URL } from "../services/api";

export const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const playedSecondsRef = useRef(0);
  const lastAudioTimeRef = useRef(0);

  const loadAndPlay = async (song, index = -1) => {
    if (!song) return;
    let fullSong = { ...song };
    if (!fullSong.file_url) {
      try {
        console.log("Đang lấy chi tiết bài hát...");
        const res = await songAPI.getSongById(fullSong.song_id || fullSong.id);
        if (res?.success && res.data) {
          fullSong = res.data;
        } else {
          console.error("Không lấy được file_url");
          return;
        }
      } catch (err) {
        console.error("Lỗi lấy chi tiết bài hát:", err);
        return;
      }
    }

    playedSecondsRef.current = 0;
    lastAudioTimeRef.current = 0;

    setCurrentSong(fullSong);
    if (index >= 0) setCurrentIndex(index);

    const audio = audioRef.current;
    audio.pause();

    if (fullSong.file_url) {
      audio.src = fullSong.file_url;
      audio.currentTime = 0;
      audio.volume = volume;

      try {
        await audio.play();
        setIsPlaying(true);
        console.log("▶ Tự động phát:", fullSong.title);
      } catch (err) {
        console.error("Browser chặn auto-play:", err);
        setIsPlaying(false);
      }
    } else {
      console.error("Không có file_url để phát nhạc");
    }
  };

  const playSong = (song) => {
    if (!song) return;

    const songId = song.song_id || song.id;
    const currentId = currentSong?.song_id || currentSong?.id;

    if (currentId && currentId === songId) {
      togglePlayPause();
      return;
    }

    if (queue.length === 0) {
      setQueue([song]);
      setCurrentIndex(0);
    }

    loadAndPlay(song);
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio.src) return;

    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    if (isShuffle) nextIndex = Math.floor(Math.random() * queue.length);

    if (nextIndex >= queue.length) {
      if (isRepeat) nextIndex = 0;
      else {
        setIsPlaying(false);
        return;
      }
    }

    loadAndPlay(queue[nextIndex], nextIndex);
  };

  const playPrev = () => {
    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (isRepeat) prevIndex = queue.length - 1;
      else return;
    }

    loadAndPlay(queue[prevIndex], prevIndex);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => playNext();
    const onTimeUpdate = () => {
      const t = audio.currentTime || 0;
      const delta = t - (lastAudioTimeRef.current || 0);
      if (delta > 0 && delta < 10) playedSecondsRef.current += delta;
      lastAudioTimeRef.current = t;
    };

    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [queue, currentIndex, isShuffle, isRepeat]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!currentSong) return;
      const durationPlayed = Math.floor(playedSecondsRef.current || 0);
      if (durationPlayed < 5) return;

      try {
        const url = `${BASE_URL}/songs/${currentSong.song_id || currentSong.id}/play`;
        const payload = JSON.stringify({
          duration_played: durationPlayed,
          source: "web",
        });
        navigator.sendBeacon(url, payload);
      } catch (e) {}
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentSong]);

  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        currentSong,
        isPlaying,
        queue,
        currentIndex,
        volume,
        setVolume,
        isShuffle,
        toggleShuffle: () => setIsShuffle((prev) => !prev),
        isRepeat,
        toggleRepeat: () => setIsRepeat((prev) => !prev),
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        setQueueAndPlay: (songs, startIndex = 0) => {
          setQueue(songs);
          loadAndPlay(songs[startIndex], startIndex);
        },
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
