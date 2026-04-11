import React, { useState } from "react";
import { usePlayerStore } from "../store/usePlayerStore";
import {
  Play,
  Clock,
  MoreHorizontal,
  Trash2,
  Edit2,
  Music,
} from "lucide-react";
import "./PlaylistDetail.css";

const PlaylistDetail = () => {
  const { playSong, currentSong, isPlaying } = usePlayerStore();
  const [playlistInfo, setPlaylistInfo] = useState({
    id: 1,
    name: "Nhạc 🐧",
    description: "Những bản nhạc không lời giúp tăng cường sự tập trung.",
    coverUrl:
      "https://i.scdn.co/image/ab67706f00000003b5f97305d2188ab1a1bd4966",
    totalDuration: "10:46",
  });

  const [playlistSongs, setPlaylistSongs] = useState([
    {
      id: "4",
      title: "nnn",
      artist: "sakiko",
      album: "1",
      duration: "3:08",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b27341ea22b31278bf6641ab3b1e",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
    {
      id: "5",
      title: "x",
      artist: "ruma",
      album: "2",
      duration: "4:18",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b27341ea22b31278bf6641ab3b1e",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    },
    {
      id: "6",
      title: "ff",
      artist: "discord mess",
      album: "3",
      duration: "3:20",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273c02cb4275ccb98260b09dc69",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    },
  ]);

  const handleRemoveSong = (e, songId) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa bài này khỏi playlist?")) {
      setPlaylistSongs((prev) => prev.filter((song) => song.id !== songId));
    }
  };

  const handleRenamePlaylist = () => {
    const newName = window.prompt(
      "Nhập tên mới cho Playlist:",
      playlistInfo.name,
    );
    if (newName && newName.trim() !== "") {
      setPlaylistInfo((prev) => ({ ...prev, name: newName }));
    }
  };
  const handleDeletePlaylist = () => {
    if (window.confirm("Hành động này không thể hoàn tác. Xóa Playlist này?")) {
      alert("Đã xóa Playlist");
    }
  };

  return (
    <div className="playlist-detail-container">
      <div className="playlist-header">
        {playlistSongs.length > 0 ? (
          <img
            src={playlistInfo.coverUrl}
            alt="cover"
            className="playlist-cover"
          />
        ) : (
          <div className="playlist-cover">
            <Music size={64} color="#9ca3af" />
          </div>
        )}

        <div className="playlist-info">
          <span>Playlist</span>
          <h1 onClick={handleRenamePlaylist} title="Nhấn để đổi tên">
            {playlistInfo.name}
          </h1>
          <p>
            Bạn • {playlistSongs.length} bài hát • {playlistInfo.totalDuration}{" "}
            [cite: 55]
          </p>
        </div>
      </div>

      <div className="playlist-content">
        <div className="playlist-actions">
          <button
            className="play-all-btn"
            onClick={() =>
              playlistSongs.length > 0 && playSong(playlistSongs[0])
            }
            title="Phát tất cả"
          >
            <Play size={28} fill="currentColor" className="ml-1" />
          </button>

          <button
            className="icon-action-btn"
            onClick={handleRenamePlaylist}
            title="Đổi tên Playlist"
          >
            <Edit2 size={24} />
          </button>

          <button
            className="icon-action-btn"
            onClick={handleDeletePlaylist}
            title="Xóa Playlist"
          >
            <Trash2 size={24} />
          </button>
        </div>

        <div
          className="playlist-item"
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

        <div className="playlist-list">
          {playlistSongs.map((song, index) => {
            const isThisSongPlaying = currentSong?.id === song.id && isPlaying;
            return (
              <div
                key={song.id}
                className="playlist-item"
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
                      className="playlist-title"
                      style={{ color: isThisSongPlaying ? "#10b981" : "white" }}
                    >
                      {song.title}
                    </div>
                    <div className="playlist-artist">{song.artist}</div>
                  </div>
                </div>
                <div style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  {song.album}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: "1rem",
                    paddingRight: "1rem",
                  }}
                >
                  <button
                    className="remove-song-btn"
                    onClick={(e) => handleRemoveSong(e, song.id)}
                    title="Xóa khỏi Playlist"
                  >
                    <Trash2 size={18} />
                  </button>
                  <span style={{ color: "#9ca3af" }}>{song.duration}</span>
                </div>
              </div>
            );
          })}

          {playlistSongs.length === 0 && (
            <p
              style={{
                color: "#9ca3af",
                textAlign: "center",
                marginTop: "3rem",
              }}
            >
              Playlist này chưa có bài hát nào. Hãy tìm nhạc và thêm vào nhé!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetail;
