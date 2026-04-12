import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
import { songAPI } from "../services/api";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  ListMusic,
} from "lucide-react";
import { LikeButton } from "./LikeButton";
import { AddToPlaylistButton } from "./AddToPlaylistButton";

import "./MusicPlayer.css";

const formatTime = (time) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const MusicPlayer = () => {
  const navigate = useNavigate();
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    volume,
    setVolume,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    playNext,
    playPrev,
  } = usePlayerStore();

  const audioRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const recordPlayHistory = async (songId, startTime) => {
    if (!songId) return;
    const durationPlayed = Math.floor((Date.now() - startTime) / 1000);
    if (durationPlayed >= 5) {
      try {
        await songAPI.recordPlay(songId, {
          duration_played: durationPlayed,
          source: "web",
          device_type: "desktop",
        });
      } catch (err) {
        console.error("Lỗi khi ghi lịch sử nghe nhạc", err);
      }
    }
  };

  // đổi bài hát
  useEffect(() => {
    return () => {
      if (currentSong?.song_id) {
        recordPlayHistory(currentSong.song_id, startTimeRef.current);
      }
    };
  }, [currentSong]);

  useEffect(() => {
    if (currentSong) startTimeRef.current = Date.now();
  }, [currentSong]);

  // người dùng đóng tab trình duyệt
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSong?.song_id) {
        const durationPlayed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000,
        );
        if (durationPlayed >= 5) {
          const url = `http://localhost:5000/api/songs/${currentSong.song_id}/play`;
          navigator.sendBeacon(
            url,
            JSON.stringify({ duration_played: durationPlayed, source: "web" }),
          );
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [currentSong]);

  // Xử lý Play/Pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying)
        audioRef.current.play().catch((e) => console.log("Lỗi autoplay:", e));
      else audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  // Xử lý Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) audioRef.current.currentTime = seekTime;
  };
  const handleEnded = () => playNext();

  if (!currentSong) return null;

  return (
    <div className="music-player">
      {/* 1. KHU VỰC THÔNG TIN BÀI HÁT & NÚT BẤM */}
      <div
        className="player-left"
        style={{ display: "flex", alignItems: "center", gap: "15px" }}
      >
        <img
          src={currentSong.cover_url || currentSong.coverUrl}
          alt="cover"
          style={{ width: "56px", height: "56px", borderRadius: "4px" }}
        />
        <div className="song-info">
          <h4 style={{ margin: 0, fontSize: "14px" }}>{currentSong.title}</h4>
          <p style={{ margin: 0, fontSize: "12px", color: "#b3b3b3" }}>
            {currentSong.artist?.name || currentSong.artist}
          </p>
        </div>

        <div
          style={{
            marginLeft: "10px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <LikeButton
            songId={currentSong.song_id || currentSong.id}
            initialIsLiked={currentSong.is_liked}
            initialLikeCount={currentSong.like_count}
          />
          <AddToPlaylistButton songId={currentSong.song_id || currentSong.id} />
        </div>
      </div>

      {/* 2. KHU VỰC ĐIỀU KHIỂN & THANH TIẾN TRÌNH */}
      <div className="player-center">
        <div className="control-buttons">
          <button
            onClick={toggleShuffle}
            className={`btn-icon ${isShuffle ? "active" : ""}`}
            title="Phát ngẫu nhiên"
          >
            <Shuffle size={20} />
          </button>
          <button onClick={playPrev} className="btn-icon" title="Bài trước">
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button onClick={togglePlayPause} className="btn-play">
            {isPlaying ? (
              <Pause size={20} fill="currentColor" />
            ) : (
              <Play size={20} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button onClick={playNext} className="btn-icon" title="Bài tiếp theo">
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button
            onClick={toggleRepeat}
            className={`btn-icon ${isRepeat ? "active" : ""}`}
            title="Lặp lại"
          >
            <Repeat size={20} />
          </button>
        </div>
        <div className="progress-container">
          <span className="time-text">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="progress-slider"
          />
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. KHU VỰC ÂM LƯỢNG & HÀNG ĐỢI */}
      <div className="player-right">
        <button
          className="btn-icon"
          onClick={() => navigate("/queue")}
          title="Hàng đợi"
        >
          <ListMusic size={20} />
        </button>
        <Volume2 size={20} className="btn-icon" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="volume-slider"
        />
      </div>

      <audio
        ref={audioRef}
        src={currentSong.file_url || currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
    </div>
  );
};
