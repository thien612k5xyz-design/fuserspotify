import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { songAPI, BASE_URL } from "../services/api";
import { AuthContext } from "../context/AuthContext";

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

  const lastRecordedRef = useRef({ songId: null, timestamp: 0 });
  const isTransitioningRef = useRef(false);
  const hasRecordedInitialRef = useRef(false);

  const { token } = React.useContext(AuthContext);

  const getStreamUrl = (songId) => `${BASE_URL}/songs/${songId}/stream`;

  const recordPlayToServer = useCallback(async (songId, durationPlayed) => {
    if (!songId) return;

    let dp = Number(durationPlayed) || 0;
    if (dp > 10000) dp = Math.floor(dp / 1000);
    dp = Math.floor(dp);

    if (dp < 5) return;

    const now = Date.now();
    if (
      lastRecordedRef.current.songId === songId &&
      now - lastRecordedRef.current.timestamp < 15000
    ) {
      return;
    }

    lastRecordedRef.current = { songId, timestamp: now };

    try {
      await songAPI.recordPlay(songId, {
        duration_played: dp,
      });
    } catch (err) {
      console.error("Ghi play lỗi:", err);
    }
  }, []);

  const flushCurrentPlay = useCallback(async () => {
    const audio = audioRef.current;
    const songId = currentSong?.song_id || currentSong?.id;
    if (!songId || !audio) return;

    let durationPlayed = Math.floor(audio.currentTime || 0);
    if (durationPlayed > 10000)
      durationPlayed = Math.floor(durationPlayed / 1000);

    if (durationPlayed >= 5) {
      await recordPlayToServer(songId, durationPlayed);
    }
  }, [currentSong, recordPlayToServer]);

  const loadAndPlay = async (song, index = -1) => {
    if (!song || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    hasRecordedInitialRef.current = false;

    try {
      await flushCurrentPlay();

      let fullSong = { ...song };
      if (!fullSong.file_url && fullSong.song_id) {
        const res = await songAPI.getSongById(fullSong.song_id);
        if (res?.success) fullSong = res.data;
      }

      setCurrentSong(fullSong);
      if (index >= 0) setCurrentIndex(index);

      const audio = audioRef.current;
      if (audio._objectUrl) {
        URL.revokeObjectURL(audio._objectUrl);
        audio._objectUrl = null;
      }

      audio.pause();
      audio.src = "";
      audio.currentTime = 0;
      audio.volume = volume;

      let played = false;

      if (fullSong.song_id && token) {
        try {
          const res = await fetch(getStreamUrl(fullSong.song_id), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);
            audio._objectUrl = objectUrl;
            audio.src = objectUrl;

            await new Promise((r) => setTimeout(r, 30));
            await audio.play();
            setIsPlaying(true);
            played = true;
          } else {
            console.warn("Stream fetch failed", res.status, res.statusText);
          }
        } catch (e) {
          console.warn("Stream fetch error", e);
        }
      }

      if (!played && fullSong.file_url) {
        try {
          audio.src = fullSong.file_url;
          await new Promise((r) => setTimeout(r, 30));
          await audio.play();
          setIsPlaying(true);
          played = true;
        } catch (e) {
          console.warn("Fallback play error", e);
        }
      }

      if (!played) setIsPlaying(false);

      audio.onerror = () => {
        console.warn("Audio error");
        setIsPlaying(false);
      };
    } catch (err) {
      console.error("Lỗi play:", err);
      setIsPlaying(false);
    } finally {
      isTransitioningRef.current = false;
    }
  };

  const playSong = (song) => {
    if (!song) return;
    const id = song.song_id || song.id;
    const currentId = currentSong?.song_id || currentSong?.id;

    if (id === currentId) {
      togglePlayPause();
      return;
    }

    if (queue.length === 0) {
      setQueue([song]);
      setCurrentIndex(0);
    }

    loadAndPlay(song);
  };

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio.src) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Play failed", err);
        setIsPlaying(false);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
      try {
        await flushCurrentPlay();
      } catch (e) {
        console.warn("Flush on pause failed", e);
      }
    }
  };

  const playNext = async () => {
    if (queue.length === 0 || isTransitioningRef.current) return;
    try {
      await flushCurrentPlay();
    } catch (e) {
      console.warn(e);
    }

    let next = currentIndex + 1;
    if (isShuffle) next = Math.floor(Math.random() * queue.length);
    if (next >= queue.length) next = isRepeat ? 0 : -1;

    if (next >= 0) loadAndPlay(queue[next], next);
    else setIsPlaying(false);
  };

  const playPrev = async () => {
    if (queue.length === 0 || isTransitioningRef.current) return;
    try {
      await flushCurrentPlay();
    } catch (e) {
      console.warn(e);
    }

    let prev = currentIndex - 1;
    if (prev < 0) prev = isRepeat ? queue.length - 1 : 0;

    loadAndPlay(queue[prev], prev);
  };

  const setQueueAndPlay = (newQueue, startIndex = 0) => {
    setQueue(newQueue);
    setCurrentIndex(startIndex);
    loadAndPlay(newQueue[startIndex], startIndex);
  };

  const addToQueue = (song) => {
    if (!song) return;
    const id = song.song_id || song.id;
    setQueue((prev) =>
      prev.some((s) => (s.song_id || s.id) === id) ? prev : [...prev, song],
    );
  };

  const removeFromQueue = (songId) => {
    const id = songId?.song_id || songId;
    setQueue((prev) => prev.filter((s) => (s.song_id || s.id) !== id));
  };

  const closePlayer = async () => {
    const audio = audioRef.current;
    if (audio) {
      try {
        await flushCurrentPlay();
      } catch (e) {
        console.warn(e);
      }
      audio.pause();
      audio.src = "";
      audio.currentTime = 0;
      if (audio._objectUrl) {
        URL.revokeObjectURL(audio._objectUrl);
        audio._objectUrl = null;
      }
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setQueue([]);
    setCurrentIndex(-1);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = async () => {
      if (hasRecordedInitialRef.current) return;
      const songId = currentSong?.song_id || currentSong?.id;
      if (!songId) return;

      let duration = Math.floor(audio.currentTime || 0);
      if (duration >= 5) {
        hasRecordedInitialRef.current = true;
        await recordPlayToServer(songId, duration);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    return () => audio.removeEventListener("timeupdate", onTimeUpdate);
  }, [currentSong, recordPlayToServer]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = async () => {
      const songId = currentSong?.song_id || currentSong?.id;
      if (!songId) {
        playNext();
        return;
      }

      const now = Date.now();
      if (
        lastRecordedRef.current.songId === songId &&
        now - lastRecordedRef.current.timestamp < 15000
      ) {
        playNext();
        return;
      }

      let duration = Math.floor(audio.currentTime || audio.duration || 0);
      if (duration > 10000) duration = Math.floor(duration / 1000);

      if (duration >= 5) {
        await recordPlayToServer(songId, duration);
      }

      playNext();
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [currentSong, playNext, recordPlayToServer]);

  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) {
        flushCurrentPlay();
      }
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [flushCurrentPlay]);

  useEffect(() => {
    const handle = () => {
      const audio = audioRef.current;
      const songId = currentSong?.song_id || currentSong?.id;
      if (!songId) return;

      let duration = Math.floor(audio.currentTime || 0);
      if (duration > 10000) duration = Math.floor(duration / 1000);
      if (duration < 5) return;

      const url = `${BASE_URL}/songs/${songId}/play`;
      const payload = JSON.stringify({ duration_played: duration });
      const blob = new Blob([payload], { type: "application/json" });

      try {
        navigator.sendBeacon(url, blob);
      } catch (e) {
        try {
          fetch(url, {
            method: "POST",
            body: payload,
            headers: { "Content-Type": "application/json" },
            keepalive: true,
          }).catch(() => {});
        } catch (err) {}
      }
    };

    window.addEventListener("beforeunload", handle);
    return () => window.removeEventListener("beforeunload", handle);
  }, [currentSong]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

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
        toggleShuffle: () => setIsShuffle((p) => !p),
        isRepeat,
        toggleRepeat: () => setIsRepeat((p) => !p),
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        addToQueue,
        removeFromQueue,
        setQueueAndPlay,
        closePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
