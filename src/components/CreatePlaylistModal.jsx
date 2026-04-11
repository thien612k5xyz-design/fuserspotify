import React, { useState } from "react";
import "./CreatePlaylistModal.css";

export const CreatePlaylistModal = ({ isOpen, onClose }) => {
  const [playlistName, setPlaylistName] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    if (playlistName.trim() === "") return;
    alert(`Đã tạo playlist mới: "${playlistName}"`);
    setPlaylistName("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Tạo Playlist mới</h2>
        <input
          type="text"
          autoFocus
          className="modal-input"
          placeholder="Nhập tên playlist của bạn..."
          value={playlistName}
          onChange={(e) => setPlaylistName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Hủy
          </button>
          <button className="btn-create" onClick={handleCreate}>
            Tạo mới
          </button>
        </div>
      </div>
    </div>
  );
};
