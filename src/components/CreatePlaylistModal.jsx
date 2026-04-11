import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { playlistAPI } from "../services/api";
import { X } from "lucide-react";

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
        onClose(); // Đóng popup
        setName(""); // Xóa form
        setDescription("");
        // Chuyển thẳng sang trang của Playlist vừa tạo
        navigate(`/playlist/${res.data.playlist_id}`);
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tạo playlist");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#282828",
          padding: "24px",
          borderRadius: "8px",
          width: "400px",
          color: "white",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "transparent",
            border: "none",
            color: "#b3b3b3",
            cursor: "pointer",
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ margin: "0 0 20px 0" }}>Tạo Playlist mới</h2>
        {error && <p style={{ color: "#e91429", fontSize: "14px" }}>{error}</p>}

        <form
          onSubmit={handleCreate}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Tên Playlist
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên playlist..."
              autoFocus
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #535353",
                background: "#3e3e3e",
                color: "white",
                outline: "none",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Mô tả (tùy chọn)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả cho playlist..."
              rows="3"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #535353",
                background: "#3e3e3e",
                color: "white",
                outline: "none",
                resize: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              marginTop: "10px",
              padding: "12px",
              borderRadius: "50px",
              border: "none",
              background: name.trim() ? "#1db954" : "#535353",
              color: name.trim() ? "black" : "#b3b3b3",
              fontWeight: "bold",
              cursor: name.trim() ? "pointer" : "not-allowed",
            }}
          >
            {isLoading ? "Đang tạo..." : "Lưu Playlist"}
          </button>
        </form>
      </div>
    </div>
  );
};
