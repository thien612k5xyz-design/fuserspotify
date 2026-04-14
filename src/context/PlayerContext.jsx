import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
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

  // Track played seconds more robustly
  const playedSecondsRef = useRef(0);
  const lastAudioTimeRef = useRef(0);

  // Prevent duplicate recordPlay calls for same song in short time
  const lastRecordedRef = useRef({ songId: null, timestamp: 0 });

  /**
   * Record play to server
   * Uses songAPI.recordPlay if available, otherwise falls back to fetch.
   * Backend requires authentication for POST /api/songs/:id/play.
   */
  const recordPlayToServer = useCallback(
    async ({ songId, durationPlayed, source = "web", deviceType = "web" }) => {
      if (!songId) return;
      if (!durationPlayed || durationPlayed < 5) return; // backend threshold

      // Avoid duplicate sends within 5 seconds
      const now = Date.now();
      const last = lastRecordedRef.current;
      if (last.songId === songId && now - last.timestamp < 5000) return;
      lastRecordedRef.current = { songId, timestamp: now };

      try {
        if (songAPI && typeof songAPI.recordPlay === "function") {
          await songAPI.recordPlay(songId, {
            duration_played: Math.floor(durationPlayed),
            source,
            device_type: deviceType,
          });
          return;
        }

        // fallback fetch
        const token = localStorage.getItem("token");
        await fetch(`${BASE_URL}/songs/${songId}/play`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            duration_played: Math.floor(durationPlayed),
            source,
            device_type: deviceType,
          }),
        });
      } catch (err) {
        console.error("Ghi play thất bại:", err);
      }
    },
    [],
  );

  /**
   * Helper to flush and record the currently playing song before switching.
   * Should be called BEFORE changing currentSong or resetting playedSecondsRef.
   */
  const flushCurrentPlay = useCallback(
    async (reason = "switch") => {
      const audio = audioRef.current;
      const prevSongId = currentSong?.song_id || currentSong?.id;
      if (!prevSongId || !audio) return;

      // Use accumulated playedSecondsRef for accurate played duration
      const durationPlayed = Math.floor(playedSecondsRef.current || 0);

      // If audio.currentTime is larger (edge cases), prefer that
      const currentTime = Math.floor(audio.currentTime || 0);
      const finalPlayed = Math.max(durationPlayed, currentTime);

      if (finalPlayed < 5) return; // backend threshold

      await recordPlayToServer({
        songId: prevSongId,
        durationPlayed: finalPlayed,
        source: reason,
        deviceType: "web",
      });
    },
    [currentSong, recordPlayToServer],
  );

  const loadAndPlay = async (song, index = -1) => {
    if (!song) return;

    // If switching from an existing song, record its play before resetting
    if (
      currentSong &&
      (currentSong.song_id || currentSong.id) !== (song.song_id || song.id)
    ) {
      try {
        await flushCurrentPlay("switch");
      } catch (e) {
        console.error("Error flushing previous play:", e);
      }
    }

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

    // Reset played tracking for the new song
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

  const playSong = async (song) => {
    if (!song) return;
    const songId = song.song_id || song.id;
    const currentId = currentSong?.song_id || currentSong?.id;
    if (currentId && currentId === songId) {
      togglePlayPause();
      return;
    }

    // If queue empty, initialize it
    if (queue.length === 0) {
      setQueue([song]);
      setCurrentIndex(0);
    }

    // If switching from another song, flush previous play BEFORE loading new
    if (currentSong) {
      try {
        await flushCurrentPlay("manual");
      } catch (e) {
        console.error("Error flushing play before manual playSong:", e);
      }
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

  const playNext = async () => {
    if (queue.length === 0) return;

    // flush current play before moving to next
    if (currentSong) {
      try {
        await flushCurrentPlay("next");
      } catch (e) {
        console.error("Error flushing play before next:", e);
      }
    }

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

  const playPrev = async () => {
    if (queue.length === 0) return;

    // flush current play before moving to prev
    if (currentSong) {
      try {
        await flushCurrentPlay("prev");
      } catch (e) {
        console.error("Error flushing play before prev:", e);
      }
    }

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      if (isRepeat) prevIndex = queue.length - 1;
      else return;
    }
    loadAndPlay(queue[prevIndex], prevIndex);
  };

  // Add to queue (avoid duplicates)
  const addToQueue = (song) => {
    if (!song) return;
    const id = song.song_id || song.id;
    setQueue((prev) => {
      if (prev.some((s) => (s.song_id || s.id) === id)) return prev;
      return [...prev, song];
    });
  };

  // Remove from queue by id
  const removeFromQueue = (songId) => {
    const id = songId?.song_id || songId;
    setQueue((prev) => prev.filter((s) => (s.song_id || s.id) !== id));
    // adjust currentIndex if needed
    setCurrentIndex((prevIndex) => {
      const idx = queue.findIndex((s) => (s.song_id || s.id) === id);
      if (idx === -1) return prevIndex;
      if (idx < prevIndex) return Math.max(prevIndex - 1, 0);
      if (idx === prevIndex)
        return Math.min(prevIndex, Math.max(queue.length - 2, -1));
      return prevIndex;
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = async () => {
      // When song ends, record play using accumulated seconds or audio.currentTime
      try {
        const durationPlayed = Math.floor(
          Math.max(playedSecondsRef.current || 0, audio.currentTime || 0),
        );
        const songId = currentSong?.song_id || currentSong?.id;
        if (songId && durationPlayed >= 5) {
          await recordPlayToServer({
            songId,
            durationPlayed,
            source: "ended",
            deviceType: "web",
          });
        }
      } catch (err) {
        console.error("Error recording play on ended:", err);
      } finally {
        // proceed to next track
        playNext();
      }
    };

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
  }, [
    queue,
    currentIndex,
    isShuffle,
    isRepeat,
    currentSong,
    playNext,
    recordPlayToServer,
  ]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Use sendBeacon on unload as a last-resort fallback
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!currentSong) return;
      const durationPlayed = Math.floor(playedSecondsRef.current || 0);
      if (durationPlayed < 5) return;
      try {
        const url = `${BASE_URL}/songs/${currentSong.song_id || currentSong.id}/play`;
        const payload = JSON.stringify({
          duration_played: durationPlayed,
          source: "unload",
        });
        navigator.sendBeacon(url, payload);
      } catch (e) {
        // ignore
      }
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
        addToQueue,
        removeFromQueue,
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
