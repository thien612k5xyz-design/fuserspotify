import React, { useState, useEffect } from "react";
import { playlistAPI } from "../services/api";
import "./CreatePlaylistModal.css";

export const AddToPlaylistModal = ({ isOpen, onClose, song }) => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchPlaylists = async () => {
        setLoadingPlaylists(true);
        try {
          const res = await playlistAPI.getMyPlaylists();
          if (res.success) setUserPlaylists(res.data);
        } catch (error) {
          console.error("Lỗi tải playlist:", error);
        } finally {
          setLoadingPlaylists(false);
        }
      };
      fetchPlaylists();
    }
  }, [isOpen]);

  if (!isOpen || !song) return null;

  const handleAddToExisting = async (playlistId, playlistName) => {
    try {
      await playlistAPI.addSongToPlaylist(playlistId, song.song_id || song.id);
      alert(`Đã thêm bài "${song.title}" vào playlist "${playlistName}"`);
      onClose();
    } catch (error) {
      if (error.code === "SONG_EXISTS") {
        alert("Bài hát đã có trong playlist này");
      } else {
        alert(error.message || "Lỗi khi thêm bài hát");
      }
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newPlaylistName.trim()) return;
    setIsLoading(true);
    try {
      const res = await playlistAPI.createPlaylist({
        name: newPlaylistName,
        is_public: true,
      });
      if (res.success) {
        await playlistAPI.addSongToPlaylist(
          res.data.playlist_id,
          song.song_id || song.id,
        );
        alert(
          `Đã tạo playlist "${newPlaylistName}" và thêm bài "${song.title}" thành công!`,
        );
        setNewPlaylistName("");
        onClose();
      }
    } catch (error) {
      alert(error.message || "Lỗi khi tạo và thêm playlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Thêm vào Playlist</h2>
        <p
          style={{
            color: "#9ca3af",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          Chọn playlist để thêm bài <strong>{song.title}</strong>:
        </p>

        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            marginBottom: "1.5rem",
          }}
        >
          {loadingPlaylists ? (
            <p style={{ fontSize: "12px", color: "#666" }}>Đang tải...</p>
          ) : userPlaylists.length > 0 ? (
            userPlaylists.map((pl) => (
              <button
                key={pl.playlist_id}
                className="playlist-option-btn"
                onClick={() => handleAddToExisting(pl.playlist_id, pl.name)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "0.75rem 1rem",
                  background: "#374151",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  marginBottom: "0.5rem",
                  cursor: "pointer",
                }}
              >
                {pl.name}
              </button>
            ))
          ) : (
            <p style={{ fontSize: "12px", color: "#666" }}>
              Bạn chưa có playlist nào.
            </p>
          )}
        </div>

        <div style={{ borderTop: "1px solid #4b5563", paddingTop: "1.5rem" }}>
          <h3
            style={{ fontSize: "1rem", color: "white", marginBottom: "0.5rem" }}
          >
            Hoặc tạo playlist mới
          </h3>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              type="text"
              className="modal-input"
              placeholder="Tên playlist mới..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <button
              className="btn-create"
              onClick={handleCreateAndAdd}
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Tạo & Thêm"}
            </button>
          </div>
        </div>
        <button
          className="btn-cancel"
          style={{ marginTop: "1.5rem", width: "100%" }}
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
