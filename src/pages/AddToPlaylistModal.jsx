import React, { useState } from "react";
import "./CreatePlaylistModal.css";
export const AddToPlaylistModal = ({ isOpen, onClose, song }) => {
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [userPlaylists, setUserPlaylists] = useState([
    { id: 1, name: "Nhạc buổi sáng" },
    { id: 2, name: "Nhạc làm việc" },
  ]);

  if (!isOpen || !song) return null;

  const handleAddToExisting = (playlistName) => {
    alert(`Đã thêm bài "${song.title}" vào playlist "${playlistName}"`);
    onClose();
  };

  const handleCreateAndAdd = () => {
    if (newPlaylistName.trim() === "") return;
    setUserPlaylists([
      ...userPlaylists,
      { id: Date.now(), name: newPlaylistName },
    ]);
    alert(
      `Đã tạo playlist "${newPlaylistName}" và thêm bài "${song.title}" vào!`,
    );
    setNewPlaylistName("");
    onClose();
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
            maxHeight: "150px",
            overflowY: "auto",
            marginBottom: "1.5rem",
          }}
        >
          {userPlaylists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => handleAddToExisting(pl.name)}
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
          ))}
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
              style={{ marginBottom: 0 }}
              placeholder="Tên playlist mới..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
            />
            <button className="btn-create" onClick={handleCreateAndAdd}>
              Tạo & Thêm
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
