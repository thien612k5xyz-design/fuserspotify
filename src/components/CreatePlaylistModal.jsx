import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { playlistAPI } from "../services/api";
import { X } from "lucide-react";
import "./Createplaylistmodal.css";

export const CreatePlaylistModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await playlistAPI.createPlaylist({
        name,
        description,
        is_public: true,
      });
      if (res.success) {
        onClose();
        setName("");
        setDescription("");
        navigate(`/playlist/${res.data.playlist_id}`);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tạo playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="modal-overlay">
      <div className="modal-box">
        <button
          onClick={onClose}
          className="btn-cancel"
          style={{ position: "absolute", top: "15px", right: "15px" }}
        >
          <X size={24} />
        </button>
        <h2>Tạo Playlist mới</h2>
        {error && <p style={{ color: "#e91429", fontSize: "14px" }}>{error}</p>}
        <form onSubmit={handleCreate}>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên playlist..."
            className="modal-input"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Thêm mô tả cho playlist..."
            rows="3"
            className="modal-input"
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Hủy
            </button>
            <button type="submit" disabled={isLoading} className="btn-create">
              {isLoading ? "Đang tạo..." : "Lưu Playlist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  return ReactDOM.createPortal(modalContent, document.body);
};
