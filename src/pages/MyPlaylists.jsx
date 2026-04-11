import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Plus, Music } from "lucide-react";
import { CreatePlaylistModal } from "../components/CreatePlaylistModal";
import "./MyPlaylists.css";

const MyPlaylists = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const playlists = [
    {
      id: 1,
      name: "Nhạc Làm Việc Tập Trung",
      coverUrl:
        "https://i.scdn.co/image/ab67706f00000003b5f97305d2188ab1a1bd4966",
      totalSongs: 15,
      totalDuration: "53:20",
    },
    {
      id: 2,
      name: "Acoustic Thư Giãn",
      coverUrl:
        "https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96",
      totalSongs: 8,
      totalDuration: "28:15",
    },
    {
      id: 3,
      name: "Playlist Trống",
      coverUrl: null,
      totalSongs: 0,
      totalDuration: "0:00",
    },
  ];

  return (
    <div className="my-playlists-container">
      {/* header */}
      <div className="my-playlists-header">
        <h1 className="my-playlists-title">Playlist của tôi</h1>
        <button
          className="btn-create-playlist"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={20} /> Tạo Playlist mới
        </button>
      </div>
      <div className="playlists-grid">
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="playlist-card"
            onClick={() => navigate("/playlist")}
          >
            <div className="playlist-cover-wrapper">
              {playlist.coverUrl ? (
                <img src={playlist.coverUrl} alt={playlist.name} />
              ) : (
                <Music size={48} color="#9ca3af" />
              )}

              <button
                className="card-play-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Phát playlist: ${playlist.name}`);
                }}
              >
                <Play size={24} fill="currentColor" className="ml-1" />
              </button>
            </div>
            <h4>{playlist.name}</h4>
            <p>
              {playlist.totalSongs} bài hát • {playlist.totalDuration}
            </p>
          </div>
        ))}
      </div>

      {/*popup*/}
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MyPlaylists;
