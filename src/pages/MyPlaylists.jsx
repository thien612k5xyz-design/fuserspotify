import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { playlistAPI } from "../services/api";
import { Music, Plus } from "lucide-react";
import { CreatePlaylistModal } from "../components/CreatePlaylistModal";

const MyPlaylists = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load lại danh sách mỗi khi trang được mở hoặc Modal tạo xong đóng lại
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const res = await playlistAPI.getMyPlaylists();
        if (res.success) setPlaylists(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách playlist:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!isModalOpen) fetchPlaylists();
  }, [isModalOpen]); // Thêm isModalOpen vào dependency để tự động reload khi tạo mới

  if (isLoading)
    return (
      <div style={{ padding: "50px", color: "white" }}>
        Đang tải danh sách...
      </div>
    );

  return (
    <div style={{ padding: "30px", color: "white" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ margin: 0 }}>Playlist của tôi</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "50px",
            border: "none",
            background: "white",
            color: "black",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          <Plus size={20} /> Tạo mới
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "24px",
        }}
      >
        {playlists.length > 0 ? (
          playlists.map((pl) => (
            <div
              key={pl.playlist_id}
              onClick={() => navigate(`/playlist/${pl.playlist_id}`)}
              style={{
                background: "#181818",
                padding: "16px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background 0.3s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "#282828")
              }
              onMouseOut={(e) => (e.currentTarget.style.background = "#181818")}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  background: "#333",
                  borderRadius: "4px",
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                {pl.cover_url ? (
                  <img
                    src={pl.cover_url}
                    alt={pl.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <Music size={48} color="#b3b3b3" />
                )}
              </div>
              <h4
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {pl.name}
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#b3b3b3" }}>
                {pl.total_songs || 0} bài hát
              </p>
            </div>
          ))
        ) : (
          <p style={{ color: "#b3b3b3" }}>Bạn chưa tạo playlist nào.</p>
        )}
      </div>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default MyPlaylists;
