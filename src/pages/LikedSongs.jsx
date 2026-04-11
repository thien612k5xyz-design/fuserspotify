import React, { useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import { Heart, Play, Clock } from "lucide-react";
import "./LikedSongs.css";

const LikedSongs = () => {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const initialLikedSongs = [
    {
      id: "1",
      title: "ok",
      artist: "surtr",
      album: "1",
      duration: "3:53",
      liked_at: "2024-04-01T10:00:00Z",
      coverUrl:
        "https://o2.edu.vn/wp-content/uploads/2021/11/icon-chim-canh-cut-la-gi.jpg",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "3",
      title: "ysganhteam",
      artist: "yasou",
      album: "2",
      duration: "3:23",
      liked_at: "2024-04-03T15:00:00Z",
      coverUrl:
        "https://o2.edu.vn/wp-content/uploads/2021/11/icon-chim-canh-cut-la-gi.jpg",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
  ];
  const sortedSongs = [...initialLikedSongs].sort(
    (a, b) => new Date(b.liked_at) - new Date(a.liked_at),
  );
  const [likedSongs, setLikedSongs] = useState(sortedSongs);
  const handleUnlike = (e, songId) => {
    e.stopPropagation();
    setLikedSongs((prev) => prev.filter((song) => song.id !== songId));
  };

  return (
    <div className="liked-container">
      <div className="liked-header">
        <div className="liked-icon-box">
          <Heart size={64} fill="currentColor" color="white" />
        </div>
        <div className="liked-info">
          <span>Playlist</span>
          <h1>Bài hát đã thích</h1>
          <p>Bạn • {likedSongs.length} bài hát</p>
        </div>
      </div>

      <div className="liked-content">
        <button
          className="play-all-btn"
          onClick={() => likedSongs.length > 0 && playSong(likedSongs[0])}
        >
          <Play size={28} fill="currentColor" className="ml-1" />
        </button>

        <div
          className="liked-item"
          style={{
            borderBottom: "1px solid #1f2937",
            color: "#9ca3af",
            marginBottom: "1rem",
            cursor: "default",
          }}
        >
          <div style={{ textAlign: "center" }}>#</div>
          <div>Tiêu đề</div>
          <div>Album</div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              paddingRight: "1rem",
            }}
          >
            <Clock size={16} />
          </div>
        </div>

        <div className="liked-list">
          {likedSongs.map((song, index) => {
            const isThisSongPlaying = currentSong?.id === song.id && isPlaying;
            return (
              <div
                key={song.id}
                className="liked-item"
                onDoubleClick={() => playSong(song)}
              >
                <div
                  style={{
                    textAlign: "center",
                    color: isThisSongPlaying ? "#10b981" : "#9ca3af",
                  }}
                >
                  {index + 1}
                </div>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <img src={song.coverUrl} alt="cover" />
                  <div>
                    <div
                      className="liked-title"
                      style={{ color: isThisSongPlaying ? "#10b981" : "white" }}
                    >
                      {song.title}
                    </div>
                    <div className="liked-artist">{song.artist}</div>
                  </div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  {song.album}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "1.5rem",
                    color: "#10b981",
                    paddingRight: "1rem",
                  }}
                >
                  <button
                    onClick={(e) => handleUnlike(e, song.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#10b981",
                      cursor: "pointer",
                    }}
                  >
                    <Heart
                      size={18}
                      fill="currentColor"
                      className="hover:scale-110"
                    />
                  </button>
                  <span style={{ color: "#9ca3af" }}>{song.duration}</span>
                </div>
              </div>
            );
          })}
          {likedSongs.length === 0 && (
            <p
              style={{
                color: "#9ca3af",
                textAlign: "center",
                marginTop: "2rem",
              }}
            >
              Bạn chưa có bài hát yêu thích nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LikedSongs;
