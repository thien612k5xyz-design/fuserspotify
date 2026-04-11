import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayerStore } from "../store/usePlayerStore";
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying)
        audioRef.current.play().catch((e) => console.log("Lỗi autoplay:", e));
      else audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  if (!currentSong) return null;

  return (
    <div className="music-player">
      <div className="player-left">
        <img src={currentSong.coverUrl} alt="cover" />
        <div className="song-info">
          <h4>{currentSong.title}</h4>
          <p>{currentSong.artist}</p>
        </div>
      </div>

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

      <div className="player-right">
        <button
          className="btn-icon"
          onClick={() => navigate("/queue")}
          title="Hàng đợi (Queue)"
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
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
      />
    </div>
  );
};
