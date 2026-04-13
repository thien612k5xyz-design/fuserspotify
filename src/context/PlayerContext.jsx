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

  const loadAndPlay = (song, index = -1) => {
    if (!song) return;
    playedSecondsRef.current = 0;
    lastAudioTimeRef.current = 0;
    setCurrentSong(song);
    if (index >= 0) setCurrentIndex(index);

    const audio = audioRef.current;
    audio.pause();
    audio.src = song.file_url || song.audioUrl || "";
    audio.currentTime = 0;
    audio.volume = volume;
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        lastAudioTimeRef.current = audio.currentTime || 0;
      })
      .catch((err) => console.error("Play error:", err));
  };

  const playSong = (song) => {
    if (
      currentSong &&
      (currentSong.song_id || currentSong.id) === (song.song_id || song.id)
    ) {
      const audio = audioRef.current;
      audio.play().catch((e) => console.error("Play error:", e));
      setIsPlaying(true);
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
        .catch((e) => console.error("Play error:", e));
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
        audioRef.current.pause();
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
      } catch {}
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
        toggleShuffle: () => setIsShuffle((s) => !s),
        isRepeat,
        toggleRepeat: () => setIsRepeat((r) => !r),
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        setQueueAndPlay: (songs, i = 0) => {
          setQueue(songs);
          loadAndPlay(songs[i], i);
        },
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
