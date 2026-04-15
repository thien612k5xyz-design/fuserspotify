import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  ListMusic,
  X,
} from "lucide-react";
import { PlayerContext } from "../context/PlayerContext";
import { LikeButton } from "./LikeButton";
import { AddToPlaylistButton } from "./AddToPlaylistButton";
import "./MusicPlayer.css";

const formatTime = (time) => {
  if (isNaN(time) || time === Infinity || !time) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export const MusicPlayer = () => {
  const navigate = useNavigate();

  const {
    audioRef,
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
    closePlayer,
  } = useContext(PlayerContext);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => playNext();

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioRef, playNext]);

  const handleSeek = (e) => {
    const seekTime = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const v = Number(e.target.value) / 100;
    setVolume(v);
  };

  const handleClosePlayer = () => {
    closePlayer();
  };

  if (!currentSong) return null;

  return (
    <div className="music-player">
      {/* LEFT */}
      <div className="player-left">
        <img
          src={currentSong.cover_url || currentSong.coverUrl}
          alt="cover"
          className="player-cover"
          onClick={() =>
            navigate(`/song/${currentSong.song_id || currentSong.id}`)
          }
        />

        <div className="song-info">
          <h4
            onClick={() =>
              navigate(`/song/${currentSong.song_id || currentSong.id}`)
            }
          >
            {currentSong.title}
          </h4>
          <p
            onClick={() =>
              navigate(
                `/artist/${
                  currentSong.artist?.artist_id || currentSong.artist_id
                }`,
              )
            }
          >
            {currentSong.artist?.name || currentSong.artist || "Unknown"}
          </p>
        </div>

        <div className="player-actions">
          <LikeButton
            songId={currentSong.song_id || currentSong.id}
            initialIsLiked={currentSong.is_liked}
            initialLikeCount={currentSong.like_count ?? 0}
          />
          <AddToPlaylistButton songId={currentSong.song_id || currentSong.id} />
        </div>
      </div>

      {/* CENTER */}
      <div className="player-center">
        <div className="control-buttons">
          <button
            onClick={toggleShuffle}
            className={`btn-icon ${isShuffle ? "active" : ""}`}
          >
            <Shuffle size={18} />
          </button>

          <button onClick={playPrev} className="btn-icon">
            <SkipBack size={22} />
          </button>

          <button onClick={togglePlayPause} className="btn-play">
            {isPlaying ? (
              <Pause size={22} fill="black" />
            ) : (
              <Play size={22} fill="black" style={{ marginLeft: "3px" }} />
            )}
          </button>

          <button onClick={playNext} className="btn-icon">
            <SkipForward size={22} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`btn-icon ${isRepeat ? "active" : ""}`}
          >
            <Repeat size={18} />
          </button>
        </div>

        <div className="progress-container">
          <span className="time-text">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="progress-slider"
          />
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      {/* RIGHT */}
      <div className="player-right">
        <button className="btn-icon" onClick={() => navigate("/queue")}>
          <ListMusic size={20} />
        </button>

        <div className="volume-control">
          <Volume2 size={20} />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={Math.round(volume * 100)}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>

        {/* NÚT X  */}
        <button
          className="close-player-btn"
          onClick={handleClosePlayer}
          title="Đóng trình phát"
        >
          <X size={22} />
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
